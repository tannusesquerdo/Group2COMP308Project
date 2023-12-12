// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AlertSchema = new Schema({
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
const AlertModel = mongoose.model('Alert', AlertSchema);
module.exports = AlertModel;