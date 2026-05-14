const Chat = require("../models/chat.model");
const Auth = require("../models/auth.model");

// Fetch Community Forum messages (Group Chat)
const getChatHistory = async (req: any, res: any) => {
  try {
    const { societyId } = req.query;

    if (!societyId) {
      return res.status(400).json({ success: false, message: "Society ID is required" });
    }

    const messages = await Chat.find({ society: societyId, receiver: null })
      .populate("sender", "name firstname lastname profileImage")
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({ success: true, messages });
  } catch (error: any) {
    console.error("Get Chat History Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Personal (1-to-1) chat history
const getPersonalChatHistory = async (req: any, res: any) => {
  try {
    const { otherUserId } = req.query;
    const userId = req.user.id || req.user._id;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate("sender", "name firstname lastname profileImage")
      .populate("receiver", "name firstname lastname profileImage")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
  } catch (error: any) {
    console.error("Get Personal Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of society members for the chat sidebar
const getSocietyMembers = async (req: any, res: any) => {
  try {
    const { societyId } = req.query;
    const userId = req.user.id || req.user._id;

    if (!societyId) {
      return res.status(400).json({ success: false, message: "Society ID is required" });
    }

    // Find all users in the same society, excluding the current user, guards, and blank users
    const members = await Auth.find({ 
      society: societyId, 
      _id: { $ne: userId },
      role: { $ne: "guard" },
      firstname: { $exists: true, $ne: "" }
    }).select("name firstname lastname profileImage role residentStatus wing unit");

    return res.status(200).json({ success: true, members });
  } catch (error: any) {
    console.error("Get Society Members Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadFile = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let fileType = "image";
    if (req.file.mimetype.includes("pdf")) fileType = "pdf";
    else if (req.file.mimetype.includes("audio")) fileType = "audio";

    return res.status(200).json({
      success: true,
      fileUrl: req.file.path,
      fileType: fileType,
    });
  } catch (error: any) {
    console.error("Chat Upload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getChatHistory, 
  getPersonalChatHistory, 
  getSocietyMembers,
  uploadFile
};
