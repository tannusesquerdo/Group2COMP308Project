// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VitalSchema = new Schema({
  bodyTemperature: {
      type: Number,
      trim: true,
  },
  heartRate: {
      type: Number,
      trim: true,
  },
  bloodPressure: {
      type: Number,
      trim: true
  },
  respiratoryRate: {
      type: Number,
      trim: true
  },
  patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }
});
const VitalModel = mongoose.model('Vital', VitalSchema);
module.exports = VitalModel;