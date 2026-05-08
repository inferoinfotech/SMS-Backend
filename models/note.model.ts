const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
