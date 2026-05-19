const Expanse = require("../models/expanse.model");

const createDBNotifications = async (societyId: any, title: string, message: string, type: string) => {
  try {
    const Notification = require("../models/notification.model");
    const Auth = require("../models/auth.model");
    const Society = require("../models/society.model");

    if (!societyId) return;

    // Find the society name to map selectSociety for admins
    const societyDoc = await Society.findById(societyId);
    const societyName = societyDoc ? societyDoc.societyName : null;

    const query: any = {
      $or: [
        { society: societyId }
      ]
    };
    if (societyName) {
      query.$or.push({ selectSociety: { $in: [societyName] } });
    }

    const users = await Auth.find(query);

    const notificationsToCreate = users.map((user: any) => ({
      userId: user._id,
      title,
      message,
      type,
      society: societyId,
      status: "unread",
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (error) {
    console.error("Error creating database notifications:", error);
  }
};

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

    await createDBNotifications(
      society,
      "New Expense",
      `A new expense "${expanse.title}" of ₹${expanse.amount} has been added.`,
      "success"
    );

    return res.status(201).json({
      message: "Expanse added successfully",
      data: expanse,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
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

    await createDBNotifications(
      expanse.society,
      "Expense Updated",
      `Expense "${expanse.title}" has been updated.`,
      "info"
    );

    return res.status(200).json({
      message: "Expense updated successfully",
      data: expanse,
    });
  } catch (error: any) {
    console.log(error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Expense Deleted",
      message: `Expense "${expanse.title}" has been removed.`,
      type: "warning",
    });

    await createDBNotifications(
      expanse.society,
      "Expense Deleted",
      `Expense "${expanse.title}" has been removed.`,
      "warning"
    );

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
    const { role, id } = req.user;
    const { societyId } = req.query;
    let query: any = {};

    if (role === "admin") {
      if (societyId) {
        query.society = societyId;
      } else {
        const Auth = require("../models/auth.model");
        const Society = require("../models/society.model");
        const admin = await Auth.findById(id);
        if (!admin || !admin.selectSociety || admin.selectSociety.length === 0) {
          return res.status(200).json({ data: [] });
        }
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      }
    } else if (role === "resident") {
      const Auth = require("../models/auth.model");
      const resident = await Auth.findById(id);
      if (!resident || !resident.society) {
        return res.status(404).json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const expanse = await Expanse.find(query).sort({ createdAt: -1 });
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
