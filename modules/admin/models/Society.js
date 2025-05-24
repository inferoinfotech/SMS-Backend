const mongoose = require('mongoose');

const SocietySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },

});

const Society = mongoose.models.Society || mongoose.model('Society', SocietySchema);
module.exports = Society;
