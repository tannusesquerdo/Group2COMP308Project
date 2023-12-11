// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TitleSchema = new Schema({
  title: {
      type: String,
      trim: true,
  },
  description: {
      type: String,
      trim: true,
  }
});
const TitleModel = mongoose.model('Title', TitleSchema);
module.exports = TitleModel;