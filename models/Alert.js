// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VitalSchema = new Schema({
  message: {
      type: String,
      trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }
});
const VitalModel = mongoose.model('Vital', VitalSchema);
module.exports = VitalModel;