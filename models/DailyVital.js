// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DailyVitalSchema = new Schema({
  pulseRate: {
      type: Number,
      trim: true,
  },
  bloodPresure: {
      type: Number,
      trim: true,
  },
  weight: {
      type: Number,
      trim: true
  },
  temperature: {
      type: Number,
      trim: true
  },
  respRate: {
    type: Number,
    trim: true
  },
  updateDate: {
    type: Date,
    trim: true
  },
  patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }
});
const DailyVitalModel = mongoose.model('Vital', DailyVitalSchema);
module.exports = DailyVitalModel;