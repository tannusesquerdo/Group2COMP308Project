const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      default: 'Patient',
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
})

UserSchema.pre('save', function (next) {
  //hash the password before saving it
  this.password = bcrypt.hashSync(this.password, 10)
  next()
})

UserSchema.methods.authenticate = function (password) {
  //compare the hashed password of the database
  //with the hashed version of the password the user enters
  return this.password === bcrypt.hashSync(password, 10)
}

module.exports = mongoose.model('User', UserSchema)
