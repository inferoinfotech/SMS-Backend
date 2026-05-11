const Complain = require("../models/complain.model");

const createComplain = async (req: any, res: any) => {
  try {
    const {
      compainerName,
      wing,
      unit,
      complainName,
      description,
      status,
      priority, 
      society
    } = req.body;

    if (
      !compainerName ||
      !wing ||
      !unit ||
      !complainName ||
      !description ||
      !status ||
      !priority ||
      !society
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complain = await Complain.create({
      compainerName,
      wing,
      unit,
      complainName,
      description,
      status,
      priority,
      society,
    });
    res.status(201).json({ complain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const editComplain = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { compainerName, wing, unit, complainName, description, status, priority } = req.body;

    const updateComplain = await Complain.findByIdAndUpdate(
      id,
      {
        compainerName,
        wing,
        unit,
        complainName,
        description,
        status,
        priority,
      },
      { new: true },
    );

    if (!updateComplain) {
      return res.status(404).json({ message: "Complain not found" });
    }
    res.status(200).json({ updateComplain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComplain = async function name(req:any, res:any) {
    try {
        const id = req.params.id;
        const deleteComplain = await Complain.findByIdAndDelete(id);
        if(!deleteComplain){
            return res.status(404).json({ message: "Complain not found" });
        }
        res.status(200).json({ deleteComplain });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


const getAllComplain = async function name(req:any, res:any) {
    try {
        const { societyId } = req.query;
        const targetSociety = req.user.society || societyId;
        const complainList = await Complain.find({society:targetSociety});
        if(!complainList){
            return res.status(404).json({ message: "Complain not found" });
        }
        res.status(200).json({ complainList });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


module.exports = { createComplain , editComplain , deleteComplain , getAllComplain};
