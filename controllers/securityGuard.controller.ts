const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model");
const transporter = require("../utils/nodemailer/transporter");
require("dotenv").config();
const Society = require("../models/society.model");


const createSecurityGuard = async function (req: any, res: any) {
  try {
    const files = req.files as { [fieldname: string]: any[] } | undefined;
    const {
      fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
      email,
      society,
    } = req.body;

    // Handle uploaded files
    const profileImage = files?.profileImage?.[0]?.path || "";
    const uploadAadhar = files?.uploadAadhar?.[0]?.path || req.body.uploadAadhar || "";

    if (
      !fullName ||
      !phoneNumber ||
      !shift ||
      !gender ||
      !shiftDate ||
      !shiftTime ||
      !uploadAadhar ||
      !email ||
      !society
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sguard = await Auth.findOne({ phoneNumber });
    if (sguard) {
      return res.status(400).json({ message: "Security guard already exists" });
    }

    const nameParts = (fullName || "").trim().split(" ");
    const firstname = nameParts[0] || fullName || "";
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const securityGuard = await Auth.create({
      firstname,
      lastname,
      name: fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
      profileImage,
      uploadAadhar,
      email,
      role: "guard",
      society,
    });
    const token = jwt.sign({ id: securityGuard._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "Setup Your Password",

      html: `
    <h2>Welcome</h2>

    <p>Click below to set your password:</p>

    <a href="${process.env.FRONTEND_URL}/setup-password/${token}">
      Set Password
    </a>
  `,
    });
    const setuplink = `${process.env.FRONTEND_URL}/setup-password/${token}`;

    // await client.messages.create({
    //   body: `Setup your password: ${setuplink}`,
    //   from: process.env.TWILIO_NUMBER,
    //   to: phoneNumber,
    // });

    res.status(201).json({
      message: "Security guard mail send successfully",
      securityGuard,
      setuplink,
    });



  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editSecurityGuard = async function (req: any, res: any) {
  try {
    const id = req.params.id;
    const files = req.files as { [fieldname: string]: any[] } | undefined;
    const {
      fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
    } = req.body;

    const updateData: any = {
      name: fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
    };

    if (fullName) {
      const nameParts = (fullName || "").trim().split(" ");
      updateData.firstname = nameParts[0] || fullName || "";
      updateData.lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";
    }

    // Update files if new ones are uploaded
    if (files?.profileImage?.[0]?.path) {
      updateData.profileImage = files.profileImage[0].path;
    }
    if (files?.uploadAadhar?.[0]?.path) {
      updateData.uploadAadhar = files.uploadAadhar[0].path;
    } else if (req.body.uploadAadhar) {
      updateData.uploadAadhar = req.body.uploadAadhar;
    }

    const securityGuard = await Auth.findByIdAndUpdate(id, updateData, { new: true });
    if (!securityGuard) {
      return res.status(404).json({ message: "Security guard not found" });
    }



    res.status(200).json({ securityGuard });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteSecurityGuard = async function (req: any, res: any) {
  try {
    const id = req.params.id;
    const securityGuard = await Auth.findByIdAndDelete(id);
    if (!securityGuard) {
      return res.status(404).json({ message: "Security guard not found" });
    }



    res.status(200).json({ message: "Security guard deleted successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllSecurityGuard = async function (req: any, res: any) {
  try {
    const { role, id } = req.user;
    const { societyId } = req.query;
    let query: any = { role: "guard" };

    if (role === "admin") {
      if (societyId) {
        query.society = societyId;
      } else {
        const Society = require("../models/society.model");
        const admin = await Auth.findById(id);
        if (!admin || !admin.selectSociety || admin.selectSociety.length === 0) {
          return res.status(200).json({ securityGuard: [] });
        }
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      }
    } else if (role === "resident") {
      const resident = await Auth.findById(id);
      if (!resident || !resident.society) {
        return res.status(404).json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const securityGuard = await Auth.find(query).sort({ createdAt: -1 });
    res.status(200).json({ securityGuard });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSecurityGuard,
  editSecurityGuard,
  deleteSecurityGuard,
  getAllSecurityGuard,
};
