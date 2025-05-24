const Income = require('../models/Income');

// Add a new income
exports.addIncome = async (req, res) => {
  try {
    const { title, description, amount, society } = req.body;

    const createdBy = req.admin._id;

    const income = new Income({
      title,
      description,
      amount,
      // society,
      // createdBy,
    });

    await income.save();
    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      income,
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ success: false, message: 'Error adding income', error: error.message });
  }
};

// Get all incomes
exports.getIncomes = async (req, res) => {
  try {
    const filter = {isDeleted: false };

    if (req.society) {
      filter.society = req.society._id;
    }

    const incomes = await Income.find(filter).populate('society').populate('createdBy');

    if (!incomes.length) {
      return res.status(404).json({ success: false, message: 'No incomes found' });
    }

    res.status(200).json({
      success: true,
      message: 'Incomes fetched successfully',
      incomes,
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ success: false, message: 'Error fetching incomes', error: error.message });
  }
};

// Get a single income by ID
exports.getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findOne({ _id: id, isDeleted: false }).populate('society').populate('createdBy');

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Income fetched successfully',
      income,
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ success: false, message: 'Error fetching income', error: error.message });
  }
};

// Update an income
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, society } = req.body;

    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { title, description, amount, society },
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Income updated successfully',
      updatedIncome,
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ success: false, message: 'Error updating income', error: error.message });
  }
};

// Soft delete an income
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Income deleted successfully',
      income,
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ success: false, message: 'Error deleting income', error: error.message });
  }
};
