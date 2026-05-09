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

    const newSetup = await MaintenanceSetting.create({
      maintenanceAmount,
      penaltyAmount,
      maintenanceDueDate,
      penaltyAppliedAfterDay,
      society,
    });

    // Create maintenance records for all residents (users with role 'resident') of this particular society
    const residents = await Auth.find({ society, role: "resident" });
    
    if (residents.length > 0) {
      const maintenanceRecords = residents.map((resident: any) => ({
        resident: resident._id,
        maintenanceSetup: newSetup._id,
        name: resident.name || "N/A",
        wing: resident.wing || "N/A",
        unit: resident.unit || "N/A",
        residentStatus: resident.residentStatus || "Tenant",
        phoneNumber: resident.phoneNumber || "N/A",
        date: maintenanceDueDate,
        amount: maintenanceAmount,
        penalty: 0,
        status: "Pending",
        payment: "Cash", // Default payment method
        society: society,
      }));

      await Maintenance.insertMany(maintenanceRecords);
    }

    return res.status(201).json({
      message: "Maintenance setup and records created successfully for the society",
      data: newSetup,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" + error });
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
      penalty,
      payment,
      status,
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

    const maintenanceRecords = await Maintenance.find(query)
      .populate("resident")
      .populate("maintenanceSetup");

    return res.status(200).json({ data: maintenanceRecords });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { maintenanceSetup, createMaintenance, getMaintenance ,verifyPassword};
