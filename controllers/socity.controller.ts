

const Society = require("../models/society.model");
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
    console.log(newSociety,"newsociety")
    res.status(201).json({ message: "Society created successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error });
  }
};


const getAllSocieties = async (req: any, res: any) => {
  try {
    const societies = await Society.find();
    console.log(societies,"societies")
    res.status(200).json(societies);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: error });
  }
};

module.exports = { createSociety ,getAllSocieties};