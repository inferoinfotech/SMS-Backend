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
    const files = req.files as { [fieldname: string]: any[] } | undefined;

    const {
      name,
      email,
      age,
      gender,
      wing,
      unit,
      phoneNumber,
      relation,
      members,
      memberCount,
      vehicles,
      residentStatus,
      unitStatus,
      society,
    } = req.body;

    // Handle Cloudinary URLs from files
    const profileImage =
      files?.profileImage?.[0]?.path || req.body.profileImage;
    const uploadAadharfront =
      files?.uploadAadharfront?.[0]?.path || req.body.uploadAadharfront;
    const uploadAadharback =
      files?.uploadAadharback?.[0]?.path || req.body.uploadAadharback;
    const uploadPan = files?.uploadPan?.[0]?.path || req.body.uploadPan;
    const addressProof =
      files?.addressProof?.[0]?.path || req.body.addressProof;
    const rentAgreeMent =
      files?.rentAgreeMent?.[0]?.path || req.body.rentAgreeMent;

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
      return res
        .status(400)
        .json({
          message:
            "createResident only supports 'Occupied' status. Use editStatusResident to vacate.",
        });
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

    const sanitizedEmail = email === "" ? undefined : email;
    const sanitizedPhoneNumber = phoneNumber === "" ? undefined : phoneNumber;

    // Parse members and vehicles if they are sent as strings (common with FormData)
    let parsedMembers = members;
    if (typeof members === "string" && members.trim() !== "") {
      try {
        parsedMembers = JSON.parse(members);
      } catch (e) {
        parsedMembers = [];
      }
    }

    let parsedVehicles = vehicles;
    if (typeof vehicles === "string" && vehicles.trim() !== "") {
      try {
        parsedVehicles = JSON.parse(vehicles);
      } catch (e) {
        parsedVehicles = [];
      }
    }

    const resident = await Auth.findOneAndUpdate(
      { wing, unit, society },
      {
        firstname,
        lastname,
        name,
        email: sanitizedEmail,
        age,
        gender,
        wing,
        unit,
        phoneNumber: sanitizedPhoneNumber,
        profileImage,
        relation,
        ownerName: req.body.ownerName,
        ownerPhone: req.body.ownerPhone,
        ownerAddress: req.body.ownerAddress,
        uploadAadharfront,
        uploadAadharback,
        uploadPan,
        addressProof,
        rentAgreeMent,
        members: parsedMembers || [],
        memberCount: parsedMembers ? parsedMembers.length : 1,
        vehicles: parsedVehicles || [],
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
      console.error(
        "Failed to create auto-maintenance record:",
        maintenanceError,
      );
    }
    // --- AUTO-MAINTENANCE LOGIC END ---

    if (email) {
      const token = jwt.sign({ id: resident._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      // Send email asynchronously without blocking the response
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to SMS",
        html: `<p>Welcome to SMS.</p><p>Click on the link below to create your password:</p><a href="${process.env.FRONTEND_URL}/create-password/${token}">${process.env.FRONTEND_URL}/create-password/${token}</a>`,
      }).then((info: any) => {
        logger.info(`Welcome email sent to resident ${email}: ${info.response}`);
      }).catch((err: any) => {
        logger.error(`Failed to send welcome email to resident ${email}: ${err.message}`);
      });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Resident",
      message: `Resident ${resident.name} has been added.`,
      type: "success",
    });

    return res.status(201).json({
      message: "Resident created/updated successfully",
      data: resident,
    });

    return res.status(400).json({
      message: "Invalid unitStatus",
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `A resident with this ${field} already exists.` });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
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
        .json({
          message: "Wing, unit and society are required to confirm vacancy",
        });
    }

    const resident = await Auth.findByIdAndUpdate(
      id,
      {
        unitStatus: "Vacant",
        name: "",
        firstname: "",
        lastname: "",
        email: undefined, // Set to undefined to avoid unique constraint issues
        password: undefined, // Clear password for next resident
        phoneNumber: undefined, // Set to undefined to avoid unique constraint issues
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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Unit Vacated",
      message: `Unit ${resident.wing}-${resident.unit} has been vacated.`,
      type: "info",
    });

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
    let query: any = { role: "resident" };

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
    res.status(200).json({ message: "Password set successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editResident = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: any[] } | undefined;
    const {
      name,
      email,
      age,
      gender,
      wing,
      unit,
      phoneNumber,
      address,
      relation,
      members,
      memberCount,
      vehicles,
      residentStatus,
      unitStatus,
      society,
      password,
    } = req.body;

    // Handle Cloudinary URLs from files
    const profileImage =
      files?.profileImage?.[0]?.path || req.body.profileImage;
    const uploadAadharfront =
      files?.uploadAadharfront?.[0]?.path || req.body.uploadAadharfront;
    const uploadAadharback =
      files?.uploadAadharback?.[0]?.path || req.body.uploadAadharback;
    const uploadPan = files?.uploadPan?.[0]?.path || req.body.uploadPan;
    const addressProof =
      files?.addressProof?.[0]?.path || req.body.addressProof;
    const rentAgreeMent =
      files?.rentAgreeMent?.[0]?.path || req.body.rentAgreeMent;
    // Splitting name into firstname and lastname for Auth consistency
    const nameParts = (name || "").trim().split(" ");
    const firstname = nameParts[0] || name || "";
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const sanitizedEmail = email === "" ? undefined : email;
    const sanitizedPhoneNumber = phoneNumber === "" ? undefined : phoneNumber;

    // Parse members and vehicles if they are sent as strings
    let parsedMembers = members;
    if (typeof members === "string" && members.trim() !== "") {
      try {
        parsedMembers = JSON.parse(members);
      } catch (e) {
        parsedMembers = [];
      }
    }

    let parsedVehicles = vehicles;
    if (typeof vehicles === "string" && vehicles.trim() !== "") {
      try {
        parsedVehicles = JSON.parse(vehicles);
      } catch (e) {
        parsedVehicles = [];
      }
    }

    const oldResident = await Auth.findById(id);
    if (!oldResident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // Handle password update
    let hashedPassword = oldResident.password;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Handle email change and notification
    if (sanitizedEmail && sanitizedEmail !== oldResident.email) {
      const token = jwt.sign({ id: oldResident._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      // Send email asynchronously without blocking the response
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: sanitizedEmail,
        subject: "Update your password for SMS",
        html: `<p>Your email has been updated. Click on the link below to set your password:</p><a href="${process.env.FRONTEND_URL}/create-password/${token}">${process.env.FRONTEND_URL}/create-password/${token}</a>`,
      }).then((info: any) => {
        logger.info(`Update password email sent to resident ${sanitizedEmail}: ${info.response}`);
      }).catch((err: any) => {
        logger.error(`Failed to send update password email to resident ${sanitizedEmail}: ${err.message}`);
      });
    }

    const resident = await Auth.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        name,
        email: sanitizedEmail,
        password: hashedPassword,
        age,
        gender,
        wing,
        unit,
        phoneNumber: sanitizedPhoneNumber,
        address,
        profileImage,
        relation,
        ownerName: req.body.ownerName,
        ownerPhone: req.body.ownerPhone,
        ownerAddress: req.body.ownerAddress,
        uploadAadharfront,
        uploadAadharback,
        uploadPan,
        addressProof,
        rentAgreeMent,
        members: parsedMembers,
        memberCount,
        vehicles: parsedVehicles,
        residentStatus,
        unitStatus,
        society,
      },
      { new: true },
    );
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }
    const io = req.app.get("io");
    io.emit("notification", {
      title: "Resident Updated",
      message: `Resident ${resident.name} details have been updated.`,
      type: "success",
    });

    return res
      .status(200)
      .json({ message: "Resident updated successfully", data: resident });
  } catch (error: any) {
    logger.error(error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `A resident with this ${field} already exists.` });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  createResident,
  getAllResidents,
  createPassword,
  editResident,
  editStatusResident,
};
