const Income = require("../models/income.model");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");

const addIncome = async (req: any, res: any) => {
  try {
    const { title, amount, date, dueDate, description } = req.body;
    if (!title || !amount || !date || !dueDate || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const income = await Income.create({
      title,
      amount,
      date,
      dueDate,
      description,
    });
    return res.status(201).json({
      message: "Income added successfully",
      data: income,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editIncome = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { title, amount, date, dueDate, description } = req.body;

    const income = await Income.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        date,
        dueDate,
        description,
      },
      { new: true },
    );

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }
    return res.status(200).json({
      message: "Income updated successfully",
      data: income,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteIncome = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const income = await Income.findByIdAndDelete(id);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }
    return res.status(200).json({
      message: "Income deleted successfully",
      data: income,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getIncome = async (req: any, res: any) => {
  try {
    const { role, id } = req.user;
    let query: any = {};

    if (role === "resident") {
      // Residents only see their own records
      query = { resident: id };
    } else if (role === "admin") {
      const admin = await Auth.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.selectSociety && admin.selectSociety.length > 0) {
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      } else {
        return res.status(200).json({ data: [] });
      }
    }
    const income = await Income.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Income fetched successfully",
      data: income,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { addIncome, editIncome, deleteIncome, getIncome };
