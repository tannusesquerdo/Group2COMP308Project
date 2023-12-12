// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TipSchema = new Schema({
  title: {
      type: String,
      trim: true,
  },
  description: {
      type: String,
      trim: true,
  }
});
const TipModel = mongoose.model('Tip', TipSchema);
module.exports = TipModel;