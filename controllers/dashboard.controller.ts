const Maintenance = require("../models/maintenance");
const Income = require("../models/income.model");
const Expanse = require("../models/expanse.model");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");
const EventPayment = require("../models/eventPayment.model");

const getDashboardStats = async (req: any, res: any) => {
  try {
    const { role, id } = req.user;
    const { societyId } = req.query;

    let societyQuery: any = {};

    if (role === "admin") {
      if (societyId) {
        societyQuery = { _id: societyId };
      } else {
        const admin = await Auth.findById(id).select("selectSociety").lean();
        if (!admin || !admin.selectSociety || admin.selectSociety.length === 0) {
          return res.status(200).json({
            totalBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            totalUnit: 0,
          });
        }
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        }).select("_id").lean();
        const societyIds = societies.map((s: any) => s._id);
        societyQuery = { _id: { $in: societyIds } };
      }
    } else if (role === "resident") {
      const resident = await Auth.findById(id).select("society").lean();
      if (!resident || !resident.society) {
        return res.status(404).json({ message: "Resident society not found" });
      }
      societyQuery = { _id: resident.society };
    }

    const societies = await Society.find(societyQuery).select("_id").lean();
    const societyIds = societies.map((s: any) => s._id);
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const [
      maintenanceIncome,
      eventPayment,
      otherIncome,
      totalExpenses,
      totalUnits,
      monthlyIncomeData,
      otherMonthlyIncome,
      eventMonthlyIncome,
    ] = await Promise.all([
      Maintenance.aggregate([
        { $match: { society: { $in: societyIds }, status: "Paid" } },
        { $group: { _id: null, total: { $sum: { $add: ["$amount", { $ifNull: ["$penalty", 0] }] } } } },
      ]),
      EventPayment.aggregate([
        { $match: { society: { $in: societyIds }, status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Income.aggregate([
        { $match: { society: { $in: societyIds } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expanse.aggregate([
        { $match: { society: { $in: societyIds } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Auth.countDocuments({
        society: { $in: societyIds },
        role: "resident",
      }),
      Maintenance.aggregate([
        {
          $match: {
            society: { $in: societyIds },
            status: "Paid",
            date: {
              $gte: yearStart,
              $lte: yearEnd,
            },
          },
        },
        {
          $group: {
            _id: { $month: "$date" },
            total: { $sum: { $add: ["$amount", { $ifNull: ["$penalty", 0] }] },
            },
          },
        },
      ]),
      Income.aggregate([
        {
          $match: {
            society: { $in: societyIds },
            date: {
              $gte: yearStart,
              $lte: yearEnd,
            },
          },
        },
        {
          $group: {
            _id: { $month: "$date" },
            total: { $sum: "$amount" },
          },
        },
      ]),
      EventPayment.aggregate([
        {
          $match: {
            society: { $in: societyIds },
            status: "Paid",
            createdAt: {
              $gte: yearStart,
              $lte: yearEnd,
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const incomeTotal = (maintenanceIncome[0]?.total || 0 ) + (eventPayment[0]?.total || 0) + (otherIncome[0]?.total || 0);
    const expenseTotal = totalExpenses[0]?.total || 0;
    const balanceTotal = incomeTotal - expenseTotal;

    const monthlyIncome = new Array(12).fill(0);
    monthlyIncomeData.forEach((item: any) => {
      if (item._id >= 1 && item._id <= 12) {
        monthlyIncome[item._id - 1] += item.total;
      }
    });
    otherMonthlyIncome.forEach((item: any) => {
      if (item._id >= 1 && item._id <= 12) {
        monthlyIncome[item._id - 1] += item.total;
      }
    });
    eventMonthlyIncome.forEach((item: any) => {
      if (item._id >= 1 && item._id <= 12) {
        monthlyIncome[item._id - 1] += item.total;
      }
    });

    return res.status(200).json({
      totalBalance: balanceTotal,
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      totalUnit: totalUnits,
      monthlyIncome: monthlyIncome
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { getDashboardStats };
