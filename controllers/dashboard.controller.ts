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
        const admin = await Auth.findById(id);
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
        });
        const societyIds = societies.map((s: any) => s._id);
        societyQuery = { _id: { $in: societyIds } };
      }
    } else if (role === "resident") {
      const resident = await Auth.findById(id);
      if (!resident || !resident.society) {
        return res.status(404).json({ message: "Resident society not found" });
      }
      societyQuery = { _id: resident.society };
    }

    const societies = await Society.find(societyQuery);
    const societyIds = societies.map((s: any) => s._id);

    // 1. Total Income from Maintenance (Paid only)
    const maintenanceIncome = await Maintenance.aggregate([
      { $match: { society: { $in: societyIds }, status: "Paid" } },
      { $group: { _id: null, total: { $sum: { $add: ["$amount", { $ifNull: ["$penalty", 0] }] } } } },
    ]);
    const eventPayment = await EventPayment.aggregate([
      { $match: { society: { $in: societyIds }, status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 2. Total Income from other sources
    const otherIncome = await Income.aggregate([
      { $match: { society: { $in: societyIds } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 3. Total Expenses
    const totalExpenses = await Expanse.aggregate([
      { $match: { society: { $in: societyIds } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 4. Total Units (Count of residents)
    const totalUnits = await Auth.countDocuments({
      society: { $in: societyIds },
      role: "resident",
    });

    const incomeTotal = (maintenanceIncome[0]?.total || 0 ) + (eventPayment[0]?.total || 0) + (otherIncome[0]?.total || 0);
    const expenseTotal = totalExpenses[0]?.total || 0;
    const balanceTotal = incomeTotal - expenseTotal;

    return res.status(200).json({
      totalBalance: balanceTotal,
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      totalUnit: totalUnits,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { getDashboardStats };
