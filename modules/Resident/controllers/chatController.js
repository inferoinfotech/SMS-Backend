// const { Chat } = require("../models")

const Message = require("../models/Chat");
const cloudinary = require("../../utils/cloudinary");
const fs = require("fs");

// exports.createNewRoom = async (userData) => {
//     try {
//         let chatRoom = await Chat.findOne({ user1: { $in: Object.values(userData) }, user2: { $in: Object.values(userData) } })
//         if (!chatRoom) {
//             chatRoom = await Chat.create({
//                 user1: userData.user1,
//                 user2: userData.user2,
//                 contents: []
//             })
//         }
//         return chatRoom
//     } catch (error) {
//         console.log("error while create room for chat");
//     }
// }

// exports.createMessage = async (newMessageRecieve) => {
//     try {
//       let chatRoom = await Chat.findOne({ _id: newMessageRecieve.id });
//       if (!chatRoom) {
//         return null;
//       }
  
//       const newMessage = {
//         content: newMessageRecieve.content,
//         contentType: newMessageRecieve?.contentType || "string",
//         date: Date.now().toString(),
//         sender: newMessageRecieve.sender // Add sender ID
//       };
  
//       chatRoom.contents.push(newMessage);
//       await chatRoom.save();
  
//       return newMessage;
//     } catch (error) {
//       console.log("Error while creating message:", error);
//       throw error;
//     }
//   };

const unlinkFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error("Failed to delete local file:", err);
        reject(err);
      } else {
        console.log("Local file deleted successfully:", path);
        resolve();
      }
    });
  });
};

exports.handleMessage = async (req, res) => {
  console.log("MMMMMMMMMMMM:", req.file);
  
  const { senderId, receiverId, message } = req.body;
  const file = req.file;
  try {
    let mediaUrl = null;
    if (file) {
      console.log(file.path);
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
      });
      mediaUrl = result.secure_url;
      
      try {
        await unlinkFile(file.path);
      } catch (unlinkError) {
        console.error("Failed to delete local file:", unlinkError);
        // Continue execution even if unlink fails
      }
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || null,
      mediaUrl,
    });
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    console.error("Error in handleMessage:", error);
    res.status(500).json({ message: "Failed to handle the message" });
  }
};

exports.getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve chat history" });
  }
};
