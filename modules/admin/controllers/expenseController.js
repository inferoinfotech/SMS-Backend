const { Expense } = require("../models");

exports.createExpense = async (req, res) => {
  try {
    const { title, date, description, amount } = req.body;
    const bill = req.file ? req.file.filename : null;
    const society = req.society._id;
    const expense = new Expense({
      title,
      date,
      description,
      amount,
      bill,
      society,
      createdBy: req.admin._id,
      isDeleted: false,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      isDeleted: false,
      society: req.society._id,
    })
      .populate("society")
      .populate("createdBy");

    if (expenses.length === 0) {
      return res.status(404).json({ error: "No expenses found" });
    }

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id,
      isDeleted: false,
      society: req.society._id,
    })
      .populate("society")
      .populate("createdBy");

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { title, date, description, amount } = req.body;
    const bill = req.file ? req.file.filename : undefined;
    const society = req.society._id;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { title, date, description, amount, bill, society, createdBy: req.admin._id },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted", expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
