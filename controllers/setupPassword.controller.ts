const jwt = require("jsonwebtoken");
const SecurityGuard = require("../models/securityGuard.model");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const setupPassword = async function (req: any, res: any) {
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


    const security = await SecurityGuard.findByIdAndUpdate(
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

module.exports = {
  setupPassword,
};
