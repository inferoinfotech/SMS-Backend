const EventPayment = require("../models/eventPayment.model");
const Auth = require("../models/auth.model");
const Announcement = require("../models/announcement.model");

const createEventPayment = async (req: any, res: any) => {
  try {
    const { event, resident, amount, payment, society, status } = req.body;

    if (!event || !resident || !amount || !payment || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPayment = await EventPayment.create({
      event,
      resident,
      amount,
      payment,
      society,
      status: status || "Pending",
    });

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Event Payment",
      message: `A new event payment of ₹${newPayment.amount} has been received.`,
      type: "success",
    });

    return res.status(201).json({
      message: "Event payment recorded successfully",
      data: newPayment,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getEventPayments = async (req: any, res: any) => {
  try {
    const { eventId, status } = req.query;
    const { role, id } = req.user;

    let query: any = {};
    if (eventId) {
      query.event = eventId;
    }

    if (status) {
      query.status = status;
    }

    if (role === "admin") {
      const admin = await Auth.findById(id);
      if (admin && admin.selectSociety && admin.selectSociety.length > 0) {
        // Resolve society names to IDs if needed, or use society IDs directly
        // For now, if society is in the record, it will be returned.
      }
    } else if (role === "resident") {
      query.resident = id;
    }

    const payments = await EventPayment.find(query)
      .populate(
        "resident",
        "name firstname lastname profileImage wing unit phoneNumber",
      )
      .populate("event", "title date time location")
      .select("-__v -updatedAt -society")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: payments });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { createEventPayment, getEventPayments };
