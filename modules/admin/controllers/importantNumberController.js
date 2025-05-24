const { ImportantNumber } = require("../models");

exports.createImportantNumber = async (req, res) => {
  try {
    const { name, phoneNumber, work } = req.body;
    const society = req.society._id;

    const newNumber = await ImportantNumber.create({
      name,
      phoneNumber,
      work,
      society,
      createdBy: req.admin._id,
      isDeleted: false, 
    });

    res.status(201).json({
      status: 'success',
      data: newNumber,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getImportantNumbers = async (req, res) => {
  try {
    const numbers = await ImportantNumber.find({ society: req.society._id, isDeleted: false })
      .populate('society')
      .populate('createdBy');

    if (numbers.length === 0) {
      return res.status(404).json({ message: 'No important numbers found' });
    }

    res.status(200).json({
      status: 'success',
      data: numbers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateImportantNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNumber = await ImportantNumber.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedNumber) {
      return res.status(404).json({ message: 'Important number not found' });
    }

    res.status(200).json({
      status: 'success',
      data: updatedNumber,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteImportantNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNumber = await ImportantNumber.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedNumber) {
      return res.status(404).json({ message: 'Important number not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Important number deleted',
      data: deletedNumber,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

