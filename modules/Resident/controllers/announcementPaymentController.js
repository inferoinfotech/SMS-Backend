const Razorpay = require("razorpay");
const { Announcement } = require("../../admin/models");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get All Announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find( { society:req.society._id, isDeleted: false } )
      .populate("residentId")
      .populate("society");

    if (announcements.length === 0) {
      return res.status(404).json({ message: "No announcements found" });
    }

    res.status(200).json({
      message: "Announcements fetched successfully",
      announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const { announcementId } = req.body;
    
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement record not found" });
    }
    if (announcement.status === 'Done') {
      return res.status(400).json({ success: false, message: "Payment already completed for this announcement" });
    }

    const currentDate = new Date();
    if (currentDate > announcement.dueDate) {
      return res.status(400).json({ success: false, message: "Payment deadline has passed" });
    }

    const paymentOptions = {
      amount: announcement.amount,
      currency: "INR",
      receipt: `receipt_${announcementId}`,
    };

    const paymentOrder = await razorpay.orders.create(paymentOptions);

    res.status(200).json({ success: true, order: paymentOrder });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: "Error initiating payment", error: error.message });
  }
};

exports.handlePaymentCallback = async (req, res) => {
  try {
    const { announcementId, razorpayPaymentId } = req.body;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement record not found" });
    }

    const generateInvoiceId = () => Math.floor(100000 + Math.random() * 900000);
    const invoiceId = generateInvoiceId();

    announcement.status = "Done";
    announcement.paymentType = "Online";
    announcement.paymentId = razorpayPaymentId;
    announcement.invoiceId = invoiceId;
    announcement.paymentDate = new Date();

    await announcement.save();

    res.status(200).json({ 
        success: true, 
        message: "Payment successful, status updated",
        invoiceId, 
        paymentDate: announcement.paymentDate 
    });
  } catch (error) {
    console.error("Error handling payment callback:", error);
    res.status(500).json({ message: "Error handling payment callback", error: error.message });
  }
};

exports.handleCashPayment = async (req, res) => {
  try {
    const { announcementId } = req.body;
    const residentId = req.resident._id;

    if (!announcementId || !residentId) {
      return res.status(400).json({ success: false, message: "Announcement ID and Resident ID are required" });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement record not found" });
    }

    if (announcement.status === "Done") {
      return res.status(400).json({ success: false, message: "Payment already completed for this announcement" });
    }

    // Update the announcement with cash payment details
    const generateInvoiceId = () => Math.floor(100000 + Math.random() * 900000);
    const invoiceId = generateInvoiceId();

    announcement.status = "Pending";
    announcement.paymentType = "Cash";
    announcement.invoiceId = invoiceId;
    announcement.paymentDate = new Date();

    await announcement.save();

    // // Send notification to all admins using sendNotificationToRole
    // const notificationTitle = "New Cash Payment Request";
    // const notificationBody = `Resident has requested cash payment for ${announcement.Announcement_title}`;
    // const notificationData = {
    //   announcementId: announcement._id.toString(),
    //   type: 'cash_payment_request'
    // };

    // Send notification to all admins using the correct method
    // await NotificationService.sendNotificationToRole(
    //   'Admin',
    //   notificationTitle,
    //   notificationBody,
    //   notificationData
    // );

    res.status(200).json({
      success: true,
      message: "Cash payment request recorded. Admins notified.",
      invoiceId,
      paymentDate: announcement.paymentDate,
    });
  } catch (error) {
    console.error("Error handling cash payment:", error);
    res.status(500).json({ message: "Error handling cash payment", error: error.message });
  }
};