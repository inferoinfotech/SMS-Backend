const { Resident, Maintenance } = require("../models");
const { maintenanceSchema } = require("../joi");
const Razorpay = require("razorpay");
const moment = require("moment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Maintenance Records
exports.createMaintenance = async (req, res) => {
  try {
    const { error } = maintenanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const societyId = req.society?._id;

    const residents = await Resident.find({ isDeleted: false, society: societyId });

    const maintenanceRecords = residents.map((resident) => ({
      amount: req.body.maintenanceAmount,
      maintenanceAmount: req.body.maintenanceAmount,
      penaltyAmount: req.body.penaltyAmount || 0,
      maintenanceDueDate: req.body.maintenanceDueDate,
      penaltyAppliedAfterDays: req.body.penaltyAppliedAfterDays,
      residentId: resident._id,
      society: societyId,
      createdBy: req.admin._id,
      isExtraAmountAdded: false,
    }));

    await Maintenance.insertMany(maintenanceRecords);

    res.status(201).json({ message: "Maintenance records created successfully", records: maintenanceRecords });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    res.status(500).json({ message: "Error creating maintenance", error });
  }
};

// Get Maintenance Records
exports.getMaintenance = async (req, res) => {
  try {
    const filter = { isDeleted: false };

    // Filter by society based on the logged-in user
    if (req.resident) {
      filter.residentId = req.resident._id;
      filter.society = req.resident.society;
    } else if (req.society) {
      filter.society = req.society._id;
    }

    const maintenanceRecords = await Maintenance.find(filter)
      .populate("residentId")
      .populate("society");

    // Process maintenance records
    const processedRecords = maintenanceRecords.map((record) => {
      const currentDate = moment();
      const dueDate = moment(record.maintenanceDueDate);
      const penaltyStartDate = dueDate.add(record.penaltyAppliedAfterDays, "days");

      if (currentDate.isAfter(penaltyStartDate) && record.penaltyAppliedAfterDays !== 0) {
        const penalty = record.penaltyAmount || 200;
        record.amount = record.maintenanceAmount + penalty;
        record.penaltyAmount = penalty;
      } else {
        record.amount = record.maintenanceAmount;
        record.penaltyAmount = 0;
      }

      return record;
    });

    res.status(200).json({
      message: "Maintenance records fetched successfully",
      records: processedRecords,
    });
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    res.status(500).json({ message: "Error fetching maintenance", error });
  }
};

// Get Single Maintenance Record
exports.getMaintenanceOne = async (req, res) => {
  try {
    const filter = { _id: req.params.id, isDeleted: false };

    if (req.resident) {
      filter.residentId = req.resident._id;
      filter.society = req.resident.society;
    } else if (req.society) {
      filter.society = req.society._id;
    }

    const maintenance = await Maintenance.findOne(filter)
      .populate("residentId")
      .populate("society");

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    res.status(200).json({ message: "Maintenance record fetched successfully", record: maintenance });
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    res.status(500).json({ message: "Error fetching maintenance", error });
  }
};

// Get Completed Maintenance Invoices
exports.getInvoicesforMaintenance = async (req, res) => {
  try {
    const filter = { status: "Done", isDeleted: false };

    if (req.resident) {
      filter.society = req.resident.society;
    } else if (req.society) {
      filter.society = req.society._id;
    }

    const completedMaintenanceRecords = await Maintenance.find(filter)
      .populate("residentId")
      .populate("society");

    res.status(200).json({
      success: true,
      message: "Completed maintenance records fetched successfully",
      records: completedMaintenanceRecords,
    });
  } catch (error) {
    console.error("Error fetching completed maintenance records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching completed maintenance records",
      error,
    });
  }
};

// Get Invoice By ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Maintenance record ID is required",
      });
    }

    const filter = { _id: id, isDeleted: false };

    if (req.resident) {
      filter.society = req.resident.society;
    } else if (req.society) {
      filter.society = req.society._id;
    }

    const maintenanceRecord = await Maintenance.findOne(filter)
      .populate("residentId")
      .populate("society");

    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance record fetched successfully",
      record: maintenanceRecord,
    });
  } catch (error) {
    console.error("Error fetching maintenance record by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching maintenance record by ID",
      error,
    });
  }
};

// Update Maintenance Status
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { maintenanceId, paymentType } = req.body;

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      maintenanceId,
      { status: "Done", paymentType },
      { new: true }
    );

    if (!updatedMaintenance) {
      return res.status(404).json({ success: false, message: "Maintenance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      record: updatedMaintenance,
    });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    res.status(500).json({ success: false, message: "Error updating maintenance record", error });
  }
};

// exports.approveCashPayment = async (req, res) => {
//   try {
//     const { maintenanceId:notificationID, approved } = req.body;
//     const adminId = req.admin._id;

//     // Find the notification first
//     const notification = await Notification.findById(notificationID)
//     console.log("----------------notification-----------", notification);
//       .populate('receiver')
//       .populate('sender');

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Notification not found' });
//     }

//     if (notification.type !== 'MAINTENANCE_PAYMENT') {
//       return res.status(400).json({ success: false, message: 'This is not a maintenance payment notification' });
//     }

//     if (notification.status !== 'Pending') {
//       return res.status(400).json({ success: false, message: 'Payment is already processed' });
//     }

//     // Update notification status
//     notification.status = approved ? 'Done' : 'Rejected';
//     notification.title = approved ? 'Your Message has been Approved' : 'Your Cash Payment has been Rejected'
//     await notification.save();
    
//      //create notification for the resident
//      const statusNotification = new Notification({
//       sender: adminId,
//       senderModel: 'Admin', 
//       receiver: resident._id,
//       receiverModel: 'Resident',
//       type: 'PAYMENT_STATUS',
//       title: `Cash Payment ${approved ? 'Approved' : 'Rejected'}`,
//       message: `Your cash payment request has been ${approved ? 'approved' : 'rejected'}`,
//       announcementId: notification.announcementId,
//       paymentType: 'Cash',
//       status: approved ? 'Done' : 'Rejected'
//     });
//     await statusNotification.save();
//     console.log(statusNotification,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< this status notification will be created");


//     res.status(200).json({
//       success: true,
//       message: `Maintenance cash payment ${approved ? 'approved' : 'rejected'} successfully`,
//       notification,
//     });
//   } catch (error) {
//     console.error('Error handling maintenance cash payment approval:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error handling maintenance cash payment approval', 
//       error: error.message 
//     });
//   }
// };

exports.approveCashPayment = async (req, res) => {
  try {
    const { maintenanceId: notificationID, approved } = req.body;
    const adminId = req.admin._id;

    // Find the notification first
    const notification = await Notification.findById(notificationID);
    console.log("----------------notification-----------", notification);
      // .populate('receiver')
      // .populate('sender');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // if (notification.type !== 'MAINTENANCE_PAYMENT') {
    if (notification.type !== 'MAINTENANCE') {

      return res.status(400).json({ success: false, message: 'This is not a maintenance payment notification' });
    }

    if (notification.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Payment is already processed' });
    }

    // Update notification status
    notification.status = approved ? 'Done' : 'Rejected';
    notification.title = approved ? 'Your Message has been Approved' : 'Your Cash Payment has been Rejected';
    await notification.save();

    // Update the corresponding maintenance status to 'Done' if approved
    if (approved) {
      await Maintenance.findByIdAndUpdate(notification.maintenanceId, { status: 'Done' }); // {{ edit_1 }}
    }

    // Create notification for the resident
    const statusNotification = new Notification({
      sender: adminId,
      senderModel: 'Admin', 
      receiver: notification.receiver._id, // Ensure you have the correct resident ID
      receiverModel: 'Resident',
      type: 'PAYMENT_STATUS',
      title: `Cash Payment ${approved ? 'Approved' : 'Rejected'}`,
      message: `Your cash payment request has been ${approved ? 'approved' : 'rejected'}`,
      maintenanceId: notification.maintenanceId,
      paymentType: 'Cash',
      status: approved ? 'Done' : 'Rejected'
    });
    await statusNotification.save();
    console.log(statusNotification, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< this status notification will be created");

    res.status(200).json({
      success: true,
      message: `Maintenance cash payment ${approved ? 'approved' : 'rejected'} successfully`,
      notification,
    });
  } catch (error) {
    console.error('Error handling maintenance cash payment approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error handling maintenance cash payment approval', 
      error: error.message 
    });
  }
};

exports.updateMaintenanceStatusDone = async (req, res) => {
  try {
    const { maintenanceId, status } = req.body;
    const maintenance = await Maintenance.findByIdAndUpdate(maintenanceId, { status }, { new: true });
    res.status(200).json({ success: true, message: 'Maintenance status updated successfully', maintenance });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ success: false, message: 'Error updating maintenance status', error: error.message });
  }
};