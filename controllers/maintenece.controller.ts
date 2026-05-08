const MaintenanceSetting = require("../models/maintenanceSetup");
const Maintenance = require("../models/maintenance");
const Resident = require("../models/resident.model");

const maintenanceSetup = async (req: any, res: any) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const {
      maintenanceAmount,
      penaltyAmount,
      maintenanceDueDate,
      penaltyAppliedAfterDay,
    } = req.body;
    if (
      !maintenanceAmount ||
      !penaltyAmount ||
      !maintenanceDueDate ||
      !penaltyAppliedAfterDay
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const maintenance = await MaintenanceSetting.create({
      maintenanceAmount,
      penaltyAmount,
      maintenanceDueDate,
      penaltyAppliedAfterDay,
    });

    return res.status(201).json({
      message: "Maintenance setup created successfully",
      data: maintenance,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
const maintenance = async (req: any, res: any) => {
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

    const residentObj = await Resident.findById(resident);
    if (!residentObj) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const rawStatus = residentObj.residentStatus || residentObj.ResidentStatus || residentObj.role || "Tenant";
    const validStatus = ["Owner", "Tenant"].includes(rawStatus) ? rawStatus : "Tenant";

    const maintenance = await Maintenance.create({
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
    });
    return res
      .status(201)
      .json({ message: "Maintenance created successfully", data: maintenance });
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
    const maintenance = await Maintenance.find()
      .populate("resident")
      .populate("maintenanceSetup");
    return res.status(200).json({ data: maintenance });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { maintenanceSetup, maintenance, getMaintenance };
