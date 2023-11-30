// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VitalSchema = new Schema({
  age: {
      type: Number,
      trim: true,
  },
  // sex (1 = male; 0 = female)
  sex: {
      type: Number,
      trim: true,
  },
  // Chest pain (1 = typical angina; 2 = atypical angina; 3 = non-anginal pain; 4 = asymptomatic)
  cp: {
      type: Number,
      trim: true
  },
  // Resting blood pressure
  trestbps: {
      type: Number,
      trim: true
  },
  // Cholestoral
  chol: {
    type: Number,
    trim: true
  },
  // Fasting blood sugar (> 120 mg/dl)  (1 = true; 0 = false)
  fbs: {
    type: Number,
    trim: true
  },
  // Resting Electrocardiographic (0 = normal; 1 = having ST-T wave abnormality; 2 = showing probable or definite left ventricular hypertrophy by Estes' criteria)
  restecg: {
    type: Number,
    trim: true
  },
  // Maximum heart rate achieved
  thalach: {
    type: Number,
    trim: true
  },
  // Exercise induced angina (1 = yes; 0 = no)
  exang: {
    type: Number,
    trim: true
  },
  // ST depression induced by exercise relative to rest
  oldpeak: {
    type: Number,
    trim: true
  },
  // The slope of the peak exercise ST segment (1 = upsloping; 2 = flat; 3 = downsloping)
  slope: {
    type: Number,
    trim: true
  },
  // Number of major vessels (0-3) colored by flourosopy
  ca: {
    type: Number,
    trim: true
  },
  // 3 = normal; 6 = fixed defect; 7 = reversable defect
  thal: {
    type: Number,
    trim: true
  },
  // prediction (0 = < 50% diameter narrowing; 1 = > 50% diameter narrowing)
  num: {
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
const VitalModel = mongoose.model('Vital', VitalSchema);
module.exports = VitalModel;