const ImportantNumber = require("../models/importantNumber.model");

const createImportantNumber = async function name(req: any, res: any) {
  try {
    const { societyId } = req.query;
    const targetSociety = req.user.society || societyId;
    const { name, number, work } = req.body;
    if (!name || !number || !work) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const importantNumber = await ImportantNumber.create({
      name,
      number,
      work,
      society: targetSociety,
    });
    res.status(201).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllImportantNumber = async function name(req: any, res: any) {
  try {
    const { societyId } = req.query;
    const targetSociety = req.user.society || societyId;
    const importantNumber = await ImportantNumber.find({society:targetSociety});
    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editImportantNumber = async function name(req: any, res: any) {
  try {
    const { id } = req.params;
    const { name, number, work } = req.body;
    const importantNumber = await ImportantNumber.findByIdAndUpdate(
      id,
      { name, number, work },
      { new: true },
    );
    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteImportantNumber = async function name(req: any, res: any) {
  try {
    const { id } = req.params;
    const importantNumber = await ImportantNumber.findByIdAndDelete(id);
    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createImportantNumber,
  getAllImportantNumber,
  editImportantNumber,
  deleteImportantNumber,
};
