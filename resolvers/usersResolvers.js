const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const jwtKey = config.secretKey // generate this elsewhere
const jwtExpirySeconds = 3000

const User = require('../models/User')

const getAllUsers = async () => {
  // Get all users from MongoDB
  const users = await User.find().select('-password').lean()

  // If no users
  if (!users?.length) {
    return new Error('No users found')
  }

  return users
}

const createNewUser = async (root, params) => {
  const { email, password, roles, firstName, lastName } = params

  // Confirm data
  if ((!email || !password || !Array.isArray(roles) || !roles.length, !firstName || !lastName)) {
    return new Error('Please provide all required fields')
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ email }).lean().exec()

  if (duplicate) {
    return new Error('Duplicate username')
  }

  const userObject = { email, password, roles, firstName, lastName }

  const userModel = new User(userObject)
  const user = await userModel.save()
  if (!user) {
    throw new Error('Invalid user data received')
  }
  return user
}

module.exports = {
  getAllUsers,
  createNewUser,
}
