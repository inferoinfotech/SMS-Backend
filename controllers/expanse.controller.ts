const Expanse = require("../models/expanse.model");

const addExpanse = async (req: any, res: any) => {
  try {
    const { title, amount, date, description, uploadBill, society } = req.body;
    if (!title || !amount || !date || !description || !uploadBill || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const expanse = await Expanse.create({
      title,
      amount,
      date,
      description,
      uploadBill,
      society,
    });
    return res.status(201).json({
      message: "Expanse added successfully",
      data: expanse,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const editExpanse = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const { title, amount, date, description, uploadBill } = req.body;

    const expanse = await Expanse.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        date,
        description,
        uploadBill,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!expanse) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense updated successfully",
      data: expanse,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const deleteExpanse = async (req: any, res: any) => {
  try {
    const id = req.params.id;

    const expanse = await Expanse.findByIdAndDelete(id);
    if (!expanse) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }
    return res.status(200).json({
      message: "Expense deleted successfully",
      data: expanse,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const getExpanse = async (req: any, res: any) => {
  try {
    const { societyId } = req.query; // Get from query if Admin
    const targetSociety = req.user.society || societyId;
    const expanse = await Expanse.find({ society: targetSociety });
    if (!expanse) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }
    return res.status(200).json({
      message: "Expense fetched successfully",
      data: expanse,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports = { addExpanse, editExpanse, deleteExpanse, getExpanse };
