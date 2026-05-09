const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model");
const transporter = require("../utils/nodemailer/transporter");
require("dotenv").config();

const createSecurityGuard = async function (req: any, res: any) {
  try {
    const {
      fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
      uploadAadhar,
      email,
    } = req.body;
    if (
      !fullName ||
      !phoneNumber ||
      !shift ||
      !gender ||
      !shiftDate ||
      !shiftTime ||
      !uploadAadhar ||
      !email
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
      uploadAadhar,
      email,
      role: "guard",
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
    const {
      fullName,
      phoneNumber,
      shift,
      gender,
      shiftDate,
      shiftTime,
      uploadAadhar,
    } = req.body;
    const nameParts = (fullName || "").trim().split(" ");
    const firstname = nameParts[0] || fullName || "";
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const securityGuard = await Auth.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        name: fullName,
        phoneNumber,
        shift,
        gender,
        shiftDate,
        shiftTime,
      },
      { new: true },
    );
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
    const securityGuard = await Auth.find({ role: "guard" });
    if (!securityGuard) {
      return res.status(404).json({ message: "Security guard not found" });
    }
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
