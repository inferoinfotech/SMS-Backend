const moment = require('moment');
const { Expense, Income, Resident, Maintenance, Announcement } = require("../../admin/models");

exports.summary = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfFinancialYear = new Date(currentYear, 3, 1);
    const endOfFinancialYear = new Date(currentYear + 1, 2, 31, 23, 59, 59);

    // Calculate total expenses from Maintenance where status is 'Done' and within the financial year
    const totalMaintenanceExpenses = await Maintenance.aggregate([
      {
        $match: {
          isDeleted: false,
          status: 'Done',
          residentId: req.resident._id,
          society: req.society._id,
          maintenanceDate: { $gte: startOfFinancialYear, $lte: endOfFinancialYear }
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$maintenanceAmount" },
        },
      },
    ]);
    
    // Calculate total expenses from Announcement where status is 'Done' and within the financial year
    const totalAnnouncementExpenses = await Announcement.aggregate([
      {
        $match: {
          isDeleted: false,
          status: 'Done',
          residentId: req.resident._id,
          createdAt: { $gte: startOfFinancialYear, $lte: endOfFinancialYear }
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalExpenses = (totalMaintenanceExpenses[0]?.totalAmount || 0) + (totalAnnouncementExpenses[0]?.totalAmount || 0);

    const residentDetails = await Resident.findById(req.resident._id)
      .select('wing unit');

    const unitName = residentDetails ? `${residentDetails.wing || 'Unknown Wing'}  ${residentDetails.unit || 'Unknown Unit'}` : 'Unknown Unit';

    const totalUnitsResult = await Resident.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: req.resident._id,
        },
      },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: 1 },
        },
      },
    ]);
    const totalUnits = totalUnitsResult.length > 0 ? totalUnitsResult[0].totalUnits : 0;

    res.status(200).json({
      totalExpenses,
      totalUnits,
      unitName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoicesForMaintenancePending = async (req, res) => {
  try {
    const filter = { 
      status: 'Pending', 
      isDeleted: false,
      residentId: req.resident._id,
      society: req.society._id
    };
    
    const pendingMaintenanceRecords = await Maintenance.find(filter)
      .populate('residentId', 'firstName lastName')
      .populate('society', 'name')
      .select('maintenanceDueDate maintenanceAmount penaltyAmount residentId society'); 

    const formattedRecords = pendingMaintenanceRecords.map(record => {
      const now = moment();
      const dueDate = moment(record.maintenanceDueDate);

      // Calculate duration since the due date
      const totalDaysPending = now.diff(dueDate, 'days');
      const totalMonthsPending = now.diff(dueDate, 'months');

      let pendingDuration;
      if (totalDaysPending < 30) {
        pendingDuration = `${totalDaysPending} day${totalDaysPending > 1 ? 's' : ''} pending`;
      } else {
        pendingDuration = `${totalMonthsPending} month${totalMonthsPending > 1 ? 's' : ''} pending`;
      }

      const totalPendingAmount = record.maintenanceAmount + record.penaltyAmount;

      const residentName = record.residentId
        ? `${record.residentId.firstName} ${record.residentId.lastName}`.trim()
        : 'Unknown';

      return {
        residentName,
        societyName: record.society?.name || 'Unknown',
        pendingDuration,
        totalAmount: totalPendingAmount,
      };
    }); 

    res.status(200).json({
      success: true,
      message: 'Pending maintenance records fetched successfully',
      records: formattedRecords,
    });
  } catch (error) {
    console.error('Error fetching pending maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending maintenance records',
      error,
    });
  }
};

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

exports.activityParticipatorRecordsUpcoming = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const filter = {
      Announcement_type: false,
      date: { $gt: currentDate },
      isDeleted: false,
      residentId: req.resident._id,
      society: req.society._id
    };

    const records = await Announcement.find(filter)
      .populate("residentId")
      .populate("society");

    // Check if records are found
    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No upcoming activity participator records found" });
    }

    const uniqueRecords = [];
    const participatorIds = new Set();

    records.forEach(record => {
      if (!participatorIds.has(record.participatorId)) {
        participatorIds.add(record.participatorId);
        uniqueRecords.push(record);
      }
    });

    // Format the createdAt date field in each unique record
    const formattedRecords = uniqueRecords.map(record => {
      record.createdAt = formatDate(record.createdAt);
      return record;
    });

    res.status(200).json({
      message: "Upcoming activity participator records fetched successfully",
      count: formattedRecords.length,
      records: formattedRecords,
    });
  } catch (error) {
    console.error("Error fetching activity participator records:", error);
    res.status(500).json({ message: "Error fetching activity participator records", error: error.message });
  }
};