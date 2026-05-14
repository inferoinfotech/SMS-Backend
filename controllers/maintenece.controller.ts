const MaintenanceSetting = require("../models/maintenanceSetup");
const Maintenance = require("../models/maintenance");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");

const maintenanceSetup = async (req: any, res: any) => {
  try {
    const {
      maintenanceAmount,
      penaltyAmount,
      maintenanceDueDate,
      penaltyAppliedAfterDay,
      society, // Link to society
    } = req.body;

    if (
      !maintenanceAmount ||
      !penaltyAmount ||
      !maintenanceDueDate ||
      !penaltyAppliedAfterDay ||
      !society
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Create or update the maintenance setup for this society
    // We try to find if there's already a setup for this society with the same due date (same month/year)
    const dueDate = new Date(maintenanceDueDate);
    const startOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0, 23, 59, 59, 999);

    let setup = await MaintenanceSetting.findOne({
      society,
      maintenanceDueDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (setup) {
      setup.maintenanceAmount = maintenanceAmount;
      setup.penaltyAmount = penaltyAmount;
      setup.maintenanceDueDate = maintenanceDueDate;
      setup.penaltyAppliedAfterDay = penaltyAppliedAfterDay;
      await setup.save();
    } else {
      setup = await MaintenanceSetting.create({
        maintenanceAmount,
        penaltyAmount,
        maintenanceDueDate,
        penaltyAppliedAfterDay,
        society,
      });
    }

    // 2. Update or create maintenance records for all residents of this society
    const residents = await Auth.find({ society, role: "resident" });

    if (residents.length > 0) {
      const maintenancePromises = residents.map(async (resident: any) => {
        // Check if a maintenance record already exists for this resident in this month
        const existingRecord = await Maintenance.findOne({
          resident: resident._id,
          society: society,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const now = new Date();
        const dueDate = new Date(maintenanceDueDate);
        const penaltyDate = new Date(dueDate);
        penaltyDate.setDate(penaltyDate.getDate() + penaltyAppliedAfterDay);

        const calculatedStatus = now > dueDate ? "Due" : "Pending";
        const calculatedPenalty = now > penaltyDate ? penaltyAmount : 0;

        if (existingRecord) {
          // If it exists and is not Paid, update it with the new amount and setup details
          if (existingRecord.status !== "Paid") {
            existingRecord.maintenanceSetup = setup._id;
            existingRecord.amount = maintenanceAmount;
            existingRecord.date = maintenanceDueDate;
            existingRecord.status = calculatedStatus;
            existingRecord.penalty = calculatedPenalty;
            await existingRecord.save();
          }
          return existingRecord;
        } else {
          // Create a new record if none exists
          return await Maintenance.create({
            resident: resident._id,
            maintenanceSetup: setup._id,
            name: resident.name || `${resident.firstname} ${resident.lastname}` || "N/A",
            wing: resident.wing || "N/A",
            unit: resident.unit || "N/A",
            residentStatus: resident.residentStatus || "Tenant",
            phoneNumber: resident.phoneNumber || "N/A",
            date: maintenanceDueDate,
            amount: maintenanceAmount,
            penalty: calculatedPenalty,
            status: calculatedStatus,
            payment: "Cash",
            society: society,
          });
        }
      });

      await Promise.all(maintenancePromises);
    }

    return res.status(201).json({
      message: "Maintenance setup and records updated successfully for the society",
      data: setup,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

const verifyPassword = async (req: any, res: any) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Incorrect Password" });
    }
    return res.status(200).json({ message: "Password verified successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
const createMaintenance = async (req: any, res: any) => {
  try {
    const {
      resident,
      maintenanceSetup,
      date,
      amount,
      penalty,
      payment,
      status,
    } = req.body;

    if (!resident || !maintenanceSetup || !date || !amount || !payment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const residentObj = await Auth.findOne({ _id: resident, role: "resident" });
    if (!residentObj) {
      return res.status(404).json({ message: "Resident not found" });
    }

    if (!residentObj.society) {
      return res.status(400).json({ 
        message: "This resident is not linked to any society. Please update the resident record first." 
      });
    }

    const existingRecord = await Maintenance.findOne({ resident, date });
    if (existingRecord) {
      return res.status(400).json({ 
        message: "Maintenance record for this resident and date already exists." 
      });
    }

    const rawStatus = residentObj.residentStatus || residentObj.ResidentStatus || "Tenant";
    const validStatus = ["Owner", "Tenant"].includes(rawStatus) ? rawStatus : "Tenant";

    const now = new Date();
    const dueDate = new Date(date);
    const calculatedStatus = status || (now > dueDate ? "Due" : "Pending");

    const newMaintenance = await Maintenance.create({
      resident,
      maintenanceSetup,
      name: residentObj.name || "N/A",
      wing: residentObj.wing || "N/A",
      unit: residentObj.unit || "N/A",
      residentStatus: validStatus,
      phoneNumber: residentObj.phoneNumber || "N/A",
      date,
      amount,
      penalty: penalty || 0,
      payment,
      status: calculatedStatus,
      society: residentObj.society, // Use society from resident record
    });
    return res
      .status(201)
      .json({ message: "Maintenance created successfully", data: newMaintenance });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

// const maintenanceList = async (req: any, res: any) => {
//   try {
//     const maintenance = await Resident.find().populate("maintenance");
//     console.log(maintenance);
//     return res.status(200).json({ data: maintenance });
//   } catch (error: any) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error: " + error.message });
//   }
// };
const getMaintenance = async (req: any, res: any) => {
  try {
    const { role, id } = req.user;
    const { status } = req.query;
    
    let query: any = {};

    if (role === "resident") {
      // Residents only see their own records
      query = { resident: id };
    } else if (role === "admin") {
      // Find the admin to get their associated societies
      const admin = await Auth.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.selectSociety && admin.selectSociety.length > 0) {
        // Resolve society names to IDs
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      } else {
        return res.status(200).json({ data: [] });
      }
    }

    // Refresh statuses and penalties for unpaid records to ensure they are current
    const now = new Date();
    
    // Efficiently update basic statuses first
    await Maintenance.updateMany(
      { status: "Pending", date: { $lt: now }, ...query },
      { $set: { status: "Due" } }
    );
    await Maintenance.updateMany(
      { status: "Due", date: { $gt: now }, ...query },
      { $set: { status: "Pending" } }
    );

    // Fetch and dynamically update penalties if needed
    // This part ensures that if the grace period has passed, the penalty is applied.
    const unpaidRecords = await Maintenance.find({
      ...query,
      status: { $in: ["Pending", "Due"] }
    }).populate("maintenanceSetup");

    for (const record of unpaidRecords) {
      if (record.maintenanceSetup) {
        const dueDate = new Date(record.date);
        const penaltyDate = new Date(dueDate);
        penaltyDate.setDate(penaltyDate.getDate() + record.maintenanceSetup.penaltyAppliedAfterDay);
        
        const targetPenalty = now > penaltyDate ? record.maintenanceSetup.penaltyAmount : 0;
        
        if (record.penalty !== targetPenalty) {
          await Maintenance.updateOne(
            { _id: record._id },
            { $set: { penalty: targetPenalty } }
          );
        }
      }
    }

    if (status) {
      query.status = status;
    }

    const maintenanceRecords = await Maintenance.find(query)
      .populate("resident")
      .populate("maintenanceSetup")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: maintenanceRecords });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { maintenanceSetup, createMaintenance, getMaintenance ,verifyPassword};
