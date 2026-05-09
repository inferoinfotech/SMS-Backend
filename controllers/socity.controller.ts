const Society = require("../models/society.model");
const Auth = require("../models/auth.model");
const logger = require("../config/logger");

const createSociety = async (req: any, res: any) => {
  try {
    const {
      societyName,
      societyAddress,
      country,
      city,
      state,
      zipCode,
    } = req.body;
    if (
      !societyName ||
      !societyAddress ||
      !country ||
      !city ||
      !state ||
      !zipCode
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const society = await Society.findOne({ societyName });
    if (society) {
      return res.status(400).json({ message: "Society already exists" });
    }
    const newSociety = new Society({
      societyName,
      societyAddress,
      country,
      city,
      state,
      zipCode,
    });
    await newSociety.save();
    console.log(newSociety, "newsociety")
    res.status(201).json({ message: "Society created successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error });
  }
};


const getAllSocieties = async (req: any, res: any) => {
  try {
    const societies = await Society.find();
    console.log(societies, "societies")
    res.status(200).json(societies);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error });
  }
};



//extra
const getAdminSocieties = async (req: any, res: any) => {
  try {
    const { id } = req.user;
    const admin = await Auth.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.selectSociety || admin.selectSociety.length === 0) {
      return res.status(200).json([]);
    }

    const societies = await Society.find({
      societyName: { $in: admin.selectSociety },
    });

    res.status(200).json(societies);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createSociety, getAllSocieties, getAdminSocieties };