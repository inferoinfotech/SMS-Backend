const Razorpay = require("razorpay");
const { Maintenance } = require("../../admin/models");
const moment = require('moment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.initiatePayment = async (req, res) => {
  try {
    const { maintenanceId } = req.body;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: "Maintenance record not found" });
    }
    const currentDate = moment();
    const dueDate = moment(maintenance.maintenanceDueDate);
    const penaltyStartDate = dueDate.clone().add(maintenance.penaltyAppliedAfterDays, 'days');
    let amountToBePaid = maintenance.maintenanceAmount;

    // Apply penalty only if the current date is after the penalty start date
    if (currentDate.isAfter(penaltyStartDate)) {
      amountToBePaid += maintenance.penaltyAmount; // Add penalty amount if conditions are met
    }
    // Prepare payment options with the appropriate amount
    const paymentOptions = {
      amount: amountToBePaid * 100, // Convert to smallest currency unit (e.g., paise)
      currency: "INR",
      receipt: `receipt_${maintenanceId}`,
    };
    const paymentOrder = await razorpay.orders.create(paymentOptions);
    res.status(200).json({
      success: true,
      order: {
        ...paymentOrder,
        amount: amountToBePaid, // Return the original amount for clarity
        amount_due: amountToBePaid,
      },
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ success: false, message: "Error initiating payment", error: error.message });
  }
};
exports.handlePaymentCallback = async (req, res) => {
  try {
    const { maintenanceId, razorpayPaymentId } = req.body;
    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: "Maintenance record not found" });
    }
    const generateInvoiceId = () => Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number
    const invoiceId = generateInvoiceId();
    // Update fields on payment completion
    maintenance.status = "Done";
    maintenance.paymentType = "Online";
    maintenance.paymentId = razorpayPaymentId;
    maintenance.invoiceId = invoiceId;
    maintenance.paymentDate = new Date();

  
    await maintenance.save();

    res.status(200).json({ 
        success: true, 
        message: "Payment successful, status updated",
        invoiceId, 
        paymentDate: maintenance.paymentDate 
    });
  } catch (error) {
    console.error("Error handling payment callback:", error);
    res.status(500).json({ message: 'Error handling payment callback', error });
  }
};
exports.handleCashPayment = async (req, res) => {
  try {
    const { maintenanceId } = req.body;
    const residentId = req.resident._id;

    if (!maintenanceId || !residentId) {
      return res.status(400).json({ success: false, message: "Maintenance ID and Resident ID are required" });
    }

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: "Maintenance record not found" });
    }

    if (maintenance.status === "Done") {
      return res.status(400).json({ success: false, message: "Payment already completed for this maintenance" });
    }

    // Update the maintenance with cash payment details
    const generateInvoiceId = () => Math.floor(100000 + Math.random() * 900000);
    const invoiceId = generateInvoiceId();

    maintenance.status = "Pending";
    maintenance.paymentType = "Cash";
    maintenance.invoiceId = invoiceId;
    maintenance.paymentDate = new Date();

    await maintenance.save();

    // Send notification to all admins using sendNotificationToRole
    const notificationTitle = "New Cash Payment Request for Maintenance";
    const notificationBody = `Resident has requested cash payment for maintenance ID: ${maintenance._id}`;
    const notificationData = {
      maintenanceId: maintenance._id.toString(),
      type: 'cash_payment_request'
    };

    // Send notification to all admins using the correct method
    await NotificationService.sendNotificationToRole(
      'Admin',
      notificationTitle,
      notificationBody,
      notificationData
    );

    res.status(200).json({
      success: true,
      message: "Cash payment request recorded for maintenance. Admins notified.",
      invoiceId,
      paymentDate: maintenance.paymentDate,
    });
  } catch (error) {
    console.error("Error handling maintenance cash payment:", error);
    res.status(500).json({ message: "Error handling maintenance cash payment", error: error.message });
  }
};