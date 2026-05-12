const mongoose = require("mongoose");

const importantNumberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: { type: String, required: true },
  work: {
    type: String,
    required: true,
  },
  society: { type: mongoose.Schema.Types.ObjectId, ref: "Society" },
});

module.exports = mongoose.model("ImportantNumber", importantNumberSchema);
