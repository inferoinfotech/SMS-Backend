const Income = require("../models/income.model");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");

const addIncome = async (req: any, res: any) => {
  try {
    const { title, amount, date, dueDate, description, society } = req.body;
    if (!title || !amount || !date || !dueDate || !description || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = await Income.create({
      title,
      amount,
      date,
      dueDate,
      description,
      society,
    });

    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Income",
      message: `New income entry "${income.title}" of ₹${income.amount} added.`,
      type: "success",
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
    const { title, amount, date, dueDate, description, society } = req.body;

    const income = await Income.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        date,
        dueDate,
        description,
        society,
      },
      { new: true },
    );

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Income Updated",
      message: `Income entry "${income.title}" has been updated.`,
      type: "info",
    });

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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Income Deleted",
      message: `Income entry "${income.title}" has been removed.`,
      type: "warning",
    });

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
    const { societyId } = req.query; // Allow filtering by particular society
    let query: any = {};

    if (role === "resident") {
      // Residents see income linked to their society (since they don't have a 'resident' field in Income model)
      const resident = await Auth.findById(id);
      if (resident && resident.society) {
        query.society = resident.society;
      }
    } else if (role === "admin") {
      if (societyId) {
        query.society = societyId;
      } else {
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
