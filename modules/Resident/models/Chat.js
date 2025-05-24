// const mongoose = require('mongoose');

// const messageSchema = mongoose.Schema(
//   {
//     content: {
//       type: String,
//       required: true
//     },
//     contentType:{
//       type: String,
//       enum: ['string', 'image'],
//       default: 'string', 
//       required: true
//     },
//     date:{
//       type: String,
//       required: true
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// const chatSchema = mongoose.Schema(
//   {
//     user1: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     user2: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     contents: [messageSchema]
//   },
//   {
//     timestamps: true,
//   }
// );

// const chatModel = mongoose.model('Chat', chatSchema);
// module.exports = chatModel;


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  mediaUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
