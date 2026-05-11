const Expanse = require("../models/expanse.model");

const addExpanse = async (req: any, res: any) => {
  try {
    const { title, amount, date, description, society } = req.body;
    const uploadBill = req.file ? req.file.path : req.body.uploadBill;

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
    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Expense",
      message: `A new expense "${expanse.title}" of ₹${expanse.amount} has been added.`,
      type: "success",
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

    const { title, amount, date, description } = req.body;
    const uploadBill = req.file ? req.file.path : req.body.uploadBill;

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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Expense Updated",
      message: `Expense "${expanse.title}" has been updated.`,
      type: "info",
    });

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
