const { Resident, Announcement, Admin, DeviceToken, Notification, Maintenance } = require('../models');
const { announcementSchema } = require('../joi');

async function ensureDeviceTokenExists(userId, userModel) {
  try {
    const existingToken = await DeviceToken.findOne({ userId });
    
    if (!existingToken && process.env.NODE_ENV === 'development') {
      const defaultToken = new DeviceToken({
        userId,
        userModel,
        token: `default_token_${userId}`,
        deviceType: 'web'
      });
      await defaultToken.save();
      console.log('Created default device token for testing:', defaultToken);
      return true;
    }
    return !!existingToken;
  } catch (error) {
    console.error('Error ensuring device token:', error);
    return false;
  }
}
// Add Announcements
exports.addAnnouncement = async (req, res) => {
  try {
    const { error } = announcementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const participatorId = Date.now().toString();

    const residents = await Resident.find({ isDeleted: false });
    const announcementRecords = residents.map(resident => ({
      Announcement_type: req.body.Announcement_type, // true for Event, false for Activity
      Announcement_title: req.body.Announcement_title,
      description: req.body.description || '',
      date: req.body.date,
      time: req.body.time || null,
      amount: req.body.amount,
      residentId: resident._id,
      society: resident.society,
      participatorId,
      isDeleted: false,
    }));

    await Announcement.insertMany(announcementRecords);

    res.status(201).json({ message: 'Announcement records added successfully', records: announcementRecords });
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({ message: 'Error adding announcement', error: error.message });
  }
};

// Get All Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const filter = { isDeleted: false, society: req.society._id };

    if (req.resident) {filter.residentId = req.resident._id;}

    const announcements = await Announcement.find(filter)
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

// Get Announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      isDeleted: false,
      residentId: req.resident?._id,
    })
      .populate('residentId')
      .populate('society');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ message: 'Error fetching announcement details', error: error.message });
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { Announcement_type, Announcement_title, description, amount, date, time } = req.body;

    const updatedAnnouncement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false},
      {
        Announcement_type,
        Announcement_title,
        description,
        date,
        time,
        amount,
      },
      { new: true }
    )
      .populate('residentId')
      .populate('society');

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ message: 'Error updating announcement details', error: error.message });
  }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully', announcement });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
};

// Fetch Event Participator Records
exports.eventParticipatorRecords = async (req, res) => {
  try {
    const { participatorId } = req.query;

    if (!participatorId) {
      return res.status(400).json({ message: "participatorId query parameter is required" });
    }

    const filter = { 
      status: "Done", 
      Announcement_type: true,
      participatorId
    };

    const records = await Announcement.find(filter)
      .populate("residentId")
      .populate("society");

    const count = records.length;

    if (count === 0) {
      return res.status(404).json({ message: "No event participator records found with the specified participatorId" });
    }

    // Include participatorId in the response
    const recordsWithParticipatorId = records.map(record => ({
      ...record.toObject(), // Convert Mongoose document to plain object
      participatorId: record.participatorId // Include participatorId 
    }));

    res.status(200).json({
      message: "Event participator records fetched successfully",
      count,
      records: recordsWithParticipatorId,
    });
  } catch (error) {
    console.error("Error fetching event participator records:", error);
    res.status(500).json({ message: "Error fetching event participator records", error: error.message });
  }
};

exports.activityParticipatorRecords = async (req, res) => {
  try {
    const { participatorId } = req.query;

    if (!participatorId) {
      return res.status(400).json({ message: "participatorId query parameter is required" });
    }

    const filter = { 
      status: "Done", 
      Announcement_type: false,
      participatorId
    };

    const records = await Announcement.find(filter)
      .populate("residentId")
      .populate("society");

    const count = records.length;

    if (count === 0) {
      return res.status(404).json({ message: "No activity participator records found with the specified participatorId" });
    }

    // Include participatorId in the response
    const recordsWithParticipatorId = records.map(record => ({
      ...record.toObject(), // Convert Mongoose document to plain object
      participatorId: record.participatorId // Include participatorId
    }));

    res.status(200).json({
      message: "Activity participator records fetched successfully",
      count,
      records: recordsWithParticipatorId,
    });
  } catch (error) {
    console.error("Error fetching activity participator records:", error);
    res.status(500).json({ message: "Error fetching activity participator records", error: error.message });
  }
};

// Fetch Completed Announcements (Invoices)
exports.getInvoicesforAnnouncement = async (req, res) => {
  try {
    const filter = { society:req.society._id, status: 'Done', isDeleted: false };
    const completedAnnouncementRecords = await Announcement.find(filter)
      .populate('residentId')
      .populate('society');

    res.status(200).json({
      success: true,
      message: 'Completed announcement records fetched successfully',
      records: completedAnnouncementRecords,
    });
  } catch (error) {
    console.error('Error fetching completed announcement records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed announcement records',
      error,
    });
  }
};

// Fetch Invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Announcement record ID is required',
      });
    }

    const announcementRecord = await Announcement.findById(id)
      .populate('residentId')
      .populate('society');

    if (!announcementRecord) {
      return res.status(404).json({
        success: false,
        message: 'Announcement record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement record fetched successfully',
      record: announcementRecord,
    });
  } catch (error) {
    console.error('Error fetching announcement record by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement record by ID',
      error,
    });
  }
};

exports.notifyAdminsOnCashPayment = async (req, res) => {
  try {
    const { announcementId } = req.body;

    const announcement = await Announcement.findById(announcementId).populate('residentId');
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (announcement.status === 'Done') {
      return res.status(400).json({ success: false, message: 'Payment already marked as completed' });
    }

    // Fetch admin device tokens from the database
    const admins = await Admin.find({}, { deviceToken: 1, _id: 0 });
    const tokens = admins.map(admin => admin.deviceToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({ success: false, message: 'No admin tokens available' });
    }

    // Send notification to admins
    const title = 'Cash Payment Selected';
    const body = `Resident ${announcement.residentId.name} has selected Cash payment.`;
    const data = {
      announcementId: announcement._id.toString(),
      residentName: announcement.residentId.name,
    };

    const notificationResponse = await sendNotification(tokens, title, body, data);

    res.status(200).json({
      success: true,
      message: 'Admins notified successfully',
      notificationResponse,
    });
  } catch (error) {
    console.error('Error notifying admins:', error.message);
    res.status(500).json({ success: false, message: 'Error notifying admins', error: error.message });
  }
};

// exports.approveCashPayment = async (req, res) => {
//   try {
//     const { announcementId:notificationID, approved, } = req.body;
//     const adminId = req.admin._id;

//     // Find the notification first
//     const notification = await Notification.findById(notificationID)
//     console.log("----------------notification-----------",notification);

//     //notificationId -> announcementID -> Status update

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Notification not found' });
//     }

//     if (notification.type !== 'PAYMENT') {
//       return res.status(400).json({ success: false, message: 'This is not a payment notification' });
//     }

//     if (notification.status !== 'Pending') {
//       return res.status(400).json({ success: false, message: 'Payment is already processed' });
//     }

//     // Update notification status
//     notification.status = approved ? 'Done' : 'Rejected';
//     notification.title = approved ? 'Your Payment has been Approved' : 'Your Cash Payment has been Rejected'
    
//     await notification.save();
//     const resident = await Resident.findById(notification.sender);


//     //create notification for the resident
//     const statusNotification = new Notification({
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
//       message: `Cash payment ${approved ? 'approved' : 'rejected'} successfully`,
//       notification,
//     });
//   } catch (error) {
//     console.error('Error handling cash payment approval:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error handling cash payment approval', 
//       error: error.message 
//     });
//   }
// };

exports.approveCashPayment = async (req, res) => {
  try {
    const { announcementId: notificationID, approved } = req.body;
    const adminId = req.admin._id;

    // Find the notification first
    const notification = await Notification.findById(notificationID);
    console.log("----------------notification-----------", notification);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.type !== 'PAYMENT') {
      return res.status(400).json({ success: false, message: 'This is not a payment notification' });
    }

    if (notification.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Payment is already processed' });
    }

    // Update notification status
    notification.status = approved ? 'Done' : 'Rejected';
    notification.title = approved ? 'Your Payment has been Approved' : 'Your Cash Payment has been Rejected';
    
    await notification.save();
    const resident = await Resident.findById(notification.sender);

    // Update the corresponding announcement status to 'Done' if approved
    if (approved && notification.announcementId) {
      await Announcement.findByIdAndUpdate(notification.announcementId, { status: 'Done' }); // {{ edit_1 }}
    }

    else if (approved && notification.maintenanceId) {
      await Maintenance.findByIdAndUpdate(notification.maintenanceId, { status: 'Done' });
    }
    else if (!approved && notification.announcementId) {
      await Announcement.findByIdAndUpdate(notification.announcementId, { status: 'Rejected' }); 
    }
    else if (!approved && notification.maintenanceId) {
      await Maintenance.findByIdAndUpdate(notification.maintenanceId, { status: 'Rejected' });
    }

    // Create notification for the resident
    const statusNotification = new Notification({
      sender: adminId,
      senderModel: 'Admin', 
      receiver: resident._id,
      receiverModel: 'Resident',
      type: 'PAYMENT_STATUS',
      title: `Cash Payment ${approved ? 'Approved' : 'Rejected'}`,
      message: `Your cash payment request has been ${approved ? 'approved' : 'rejected'}`,
      announcementId: notification.announcementId,
      paymentType: 'Cash',
      status: approved ? 'Done' : 'Rejected'
    });
    await statusNotification.save();
    console.log(statusNotification, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< this status notification will be created");

    res.status(200).json({
      success: true,
      message: `Cash payment ${approved ? 'approved' : 'rejected'} successfully`,
      notification,
    });
  } catch (error) {
    console.error('Error handling cash payment approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error handling cash payment approval', 
      error: error.message 
    });
  }
};

// exports.approveCashPayment = async (req, res) => {
//   try {
//     const { announcementId, approved } = req.body;
//     const adminId = req.admin._id;


//     // Find the notification first
//     // const notification = await Notification.findById(announcementId)

//     const notification = await Announcement.findById(announcementId)


//     console.log("AnnouncementID----------",notification);

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Notification not found' });
//     }

//     if (notification.type !== 'PAYMENT') {
//       return res.status(400).json({ success: false, message: 'This is not a payment notification' });
//     }

//     if (notification.status !== 'Pending') {
//       return res.status(400).json({ success: false, message: 'Payment is already processed' });
//     }

//     // Update notification status
//     notification.status = approved ? 'Done' : 'Rejected';
//     notification.title = approved ? 'Your Payment has been Approved' : 'Your Cash Payment has been Rejected';
    
//     // Set paymentType to 'Cash' when approved
//     if (approved) {
//       notification.paymentType = 'Cash'; // {{ edit_1 }}
//     }
    
//     await notification.save();
//     const resident = await Resident.findById(notification.sender);

//     // Create notification for the resident
//     const statusNotification = new Notification({
//       sender: adminId,
//       senderModel: 'Admin', 
//       receiver: resident._id,
//       receiverModel: 'Resident',
//       type: 'PAYMENT_STATUS',
//       title: `Cash Payment ${approved ? 'Approved' : 'Rejected'}`,
//       message: `Your cash payment request has been ${approved ? 'approved' : 'rejected'}`,
//       announcementId: notification.announcementId,
//       paymentType: 'Cash', // {{ edit_2 }}
//       status: approved ? 'Done' : 'Rejected'
//     });
//     await statusNotification.save();
//     console.log(statusNotification,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< this status notification will be created");

//     res.status(200).json({
//       success: true,
//       message: `Cash payment ${approved ? 'approved' : 'rejected'} successfully`,
//       notification,
//     });
//   } catch (error) {
//     console.error('Error handling cash payment approval:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error handling cash payment approval', 
//       error: error.message 
//     });
//   }
// };



exports.updateAnnouncementStatus = async (req, res) => {
  try {
    const { announcementId, status } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(announcementId, { status }, { new: true });
    res.status(200).json({ success: true, message: 'Announcement status updated successfully', announcement });
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({ success: false, message: 'Error updating announcement status', error: error.message });
  }
};