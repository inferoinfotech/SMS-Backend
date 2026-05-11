const Auth = require("../models/auth.model");
const Society = require("../models/society.model");
const logger = require("../config/logger");
const transporter = require("../utils/nodemailer/transporter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const MaintenanceSetting = require("../models/maintenanceSetup");
const Maintenance = require("../models/maintenance");

const createResident = async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      age,
      gender,
      wing,
      unit,
      phoneNumber,
      profileImage,
      relation,
      uploadAadharfront,
      uploadAadharback,
      uploadPan,
      addressProof,
      rentAgreeMent,
      members,
      memberCount,
      vehicles,
      residentStatus,
      unitStatus,
      society,
    } = req.body;

    const missingFields = [];
    if (!wing) missingFields.push("wing");
    if (!unit) missingFields.push("unit");
    if (!unitStatus) missingFields.push("unitStatus");
    if (!society) missingFields.push("society");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Required fields missing",
        missingFields: missingFields, // Sending the actual array
        error: `The following fields are required: ${missingFields.join(", ")}`,
      });
    }

    // Always handle as Occupied since Vacant is handled by editStatusResident
    if (unitStatus !== "Occupied") {
      return res.status(400).json({ message: "createResident only supports 'Occupied' status. Use editStatusResident to vacate." });
    }

    if (!name || !phoneNumber || !residentStatus) {
      const missingOccupied = [];
      if (!name) missingOccupied.push("name");
      if (!phoneNumber) missingOccupied.push("phoneNumber");
      if (!residentStatus) missingOccupied.push("residentStatus");

      return res.status(400).json({
        message: "Occupant details required",
        missingFields: missingOccupied,
        error: `When unit is Occupied, these are required: ${missingOccupied.join(", ")}`,
      });
    }

    // Splitting name into firstname and lastname for Auth consistency if possible
    const nameParts = name.trim().split(" ");
    const firstname = nameParts[0] || name;
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const resident = await Auth.findOneAndUpdate(
      { wing, unit, society },
      {
        firstname,
        lastname,
        name,
        email,
        age,
        gender,
        wing,
        unit,
        phoneNumber,
        profileImage,
        relation,
        uploadAadharfront,
        uploadAadharback,
        uploadPan,
        addressProof,
        rentAgreeMent,
        members: members || [],
        memberCount: members ? members.length : 1,
        vehicles: vehicles || [],
        residentStatus,
        unitStatus: "Occupied",
        society,
        role: "resident",
      },
      { upsert: true, new: true },
    );

    // --- AUTO-MAINTENANCE LOGIC START ---
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // 1. Find the maintenance setup for this society for the current month
      const setup = await MaintenanceSetting.findOne({
        society,
        maintenanceDueDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (setup) {
        // 2. Check if a record already exists to avoid duplicates
        const existingRecord = await Maintenance.findOne({
          resident: resident._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        if (!existingRecord) {
          // 3. Create the maintenance record automatically
          await Maintenance.create({
            resident: resident._id,
            maintenanceSetup: setup._id,
            name: resident.name || `${resident.firstname} ${resident.lastname}`,
            wing: resident.wing,
            unit: resident.unit,
            residentStatus: resident.residentStatus,
            phoneNumber: resident.phoneNumber,
            date: setup.maintenanceDueDate,
            amount: setup.maintenanceAmount,
            penalty: 0,
            status: "Pending",
            payment: "Cash",
            society: society,
          });
        }
      }
    } catch (maintenanceError) {
      console.error("Failed to create auto-maintenance record:", maintenanceError);
    }
    // --- AUTO-MAINTENANCE LOGIC END ---

    if (email) {
      const token = jwt.sign({ id: resident._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const setupPassword = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to SMS",
        html: `<p>Welcome to SMS.</p><p>Click on the link below to create your password:</p><a href="${process.env.FRONTEND_URL}/create-password/${token}">${process.env.FRONTEND_URL}/create-password/${token}</a>`,
      });

      if (!setupPassword) {
        console.log("Email not sent");
      }
    }

    return res.status(201).json({
      message: "Resident created/updated successfully",
      data: resident,
    });

    return res.status(400).json({
      message: "Invalid unitStatus",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const editStatusResident = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // We don't strictly need wing/unit/society in the body because we are finding by ID,
    // but we can keep the validation if you want to ensure the frontend is sending them.
    const { wing, unit, society } = req.body;
    if (!wing || !unit || !society) {
      return res
        .status(400)
        .json({ message: "Wing, unit and society are required to confirm vacancy" });
    }

    const resident = await Auth.findByIdAndUpdate(
      id,
      {
        unitStatus: "Vacant",
        name: "",
        firstname: "",
        lastname: "",
        email: "", // Clear email
        password: "", // Clear password for next resident
        phoneNumber: "", // Clear phone
        address: "", // Clear address
        age: undefined,
        gender: undefined,
        profileImage: "",
        relation: "",
        uploadAadharfront: "",
        uploadAadharback: "",
        uploadPan: "",
        addressProof: "",
        rentAgreeMent: "",
        members: [],
        memberCount: 0,
        vehicles: [],
        residentStatus: undefined,
      },
      { new: true },
    );

    if (!resident) {
      return res.status(404).json({ message: "Resident record not found" });
    }

    return res.status(200).json({
      message: "Unit vacated and resident details cleared successfully",
      data: resident,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAllResidents = async (req: any, res: any) => {
  try {
    const { role, id } = req.user;
    let query: any = {};

    if (role === "admin") {
      // Find the admin to get their associated societies
      const admin = await Auth.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.selectSociety && admin.selectSociety.length > 0) {
        // Resolve society names to IDs if they are stored as names
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      } else {
        // If no society is linked to admin, return empty list or all?
        // Usually an admin should be linked. Let's return empty to be safe.
        return res.status(200).json([]);
      }
    } else if (role === "resident") {
      // Residents only see themselves
      query._id = id;
    }

    const residents = await Auth.find(query).populate("society");
    console.log(residents, "residents");
    return res.status(200).json(residents);
  } catch (error: any) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

const createPassword = async function (req: any, res: any) {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password are not matching" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const resident = await Auth.findByIdAndUpdate(
      decoded.id,
      {
        password: hashedPassword,
      },
      { new: true },
    );
    res.status(200).json({ message: " Resident password set successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editResident = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      age,
      gender,
      wing,
      unit,
      phoneNumber,
      address,
      profileImage,
      relation,
      uploadAadharfront,
      uploadAadharback,
      uploadPan,
      addressProof,
      rentAgreeMent,
      members,
      memberCount,
      vehicles,
      residentStatus,
      unitStatus,
      society,
    } = req.body;
    // Splitting name into firstname and lastname for Auth consistency
    const nameParts = (name || "").trim().split(" ");
    const firstname = nameParts[0] || name || "";
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const resident = await Auth.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        name,
        email,
        age,
        gender,
        wing,
        unit,
        phoneNumber,
        address,
        profileImage,
        relation,
        uploadAadharfront,
        uploadAadharback,
        uploadPan,
        addressProof,
        rentAgreeMent,
        members,
        memberCount,
        vehicles,
        residentStatus,
        unitStatus,
        society,
      },
      { new: true },
    );
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }
    res
      .status(200)
      .json({ message: "Resident updated successfully", data: resident });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error });
  }
};

module.exports = {
  createResident,
  getAllResidents,
  createPassword,
  editResident,
  editStatusResident,
};
