const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const { AuthenticationError, ForbiddenError } = require('apollo-server-express')
const jwtKey = config.secretKey // generate this elsewhere
const jwtExpirySeconds = 30000
const tf = require('@tensorflow/tfjs-node')
const fs = require('fs')
const path = require('path')

const User = require('../models/User')
const Vital = require('../models/Vital')
const DailyVital = require('../models/DailyVital')
const Tip = require('../models/Tip')
const Alert = require('../models/Alert')
const MODEL_URL = require('../hd-model/heart-model.json')
// const WEIGHTS_URL = require('../hd-model/hd-model.bin')

/**************************************************************** getAllUsers ****************************************************************/
const getAllUsers = async () => {
  // Get all users from MongoDB
  const users = await User.find({ roles: 'Patient' }).select('-password').lean()

  // If no users
  if (!users?.length) {
    return new Error('No users found')
  }

  return users
}

/**************************************************************** getAllVital ****************************************************************/
const getAllVital = async () => {
  try {
    // Retrieve all vital records from MongoDB
    const allVitalRecords = await Vital.find().select('-patient').lean().exec()

    // If no vital records
    if (!allVitalRecords?.length) {
      return new Error('No vital records found')
    }

    return allVitalRecords
  } catch (error) {
    throw new Error('Error retrieving all vital records')
  }
}

/**************************************************************** getVitalByPatientId ****************************************************************/
const getVitalByPatientId = async (root, params) => {
  const { patientId } = params

  // Confirm data
  if (!patientId) {
    throw new Error('Please provide valid parameters')
  }

  try {
    // Find vital records by patient ID
    const vitalRecords = await Vital.find({ patient: patientId }).select('-patient').lean().exec()

    // If no vital records
    if (!vitalRecords?.length) {
      return new Error('No vital records found')
    }

    return vitalRecords
  } catch (error) {
    throw new Error('Error retrieving vital records')
  }
}

/**************************************************************** getDailyVitalByPatientId ****************************************************************/
const getDailyVitalByPatientId = async (root, params) => {
  const { patient } = params

  // Confirm data
  if (!patient) {
    throw new Error('Please provide valid parameters')
  }

  try {
    // Find daily vital records by patient ID
    const dailyVitalRecords = await DailyVital.find({ patient: patient })
      .select('-patient')
      .lean()
      .exec()

    return dailyVitalRecords
  } catch (error) {
    throw new Error('Error retrieving daily vital records')
  }
}

/**************************************************************** getAllTip ****************************************************************/
const getAllTip = async () => {
  try {
    // Retrieve all tip records from MongoDB
    const allTipRecords = await Tip.find().select('-_id').lean().exec()

    // If no tip records
    if (!allTipRecords?.length) {
      return new Error('No tip records found')
    }

    return allTipRecords
  } catch (error) {
    throw new Error('Error retrieving all tip records')
  }
}

/**************************************************************** getAlertByPatientId ****************************************************************/
const getAlertByPatientId = async (root, params) => {
  const { patientId } = params

  // Confirm data
  if (!patientId) {
    return new Error('Please provide valid parameters')
  }

  try {
    // Find alert records by patient ID
    const alertRecords = await Alert.find({ patient: patientId }).select('-patient').lean().exec()

    // If no alert records
    if (!alertRecords?.length) {
      return new Error('No alert records found')
    }

    return alertRecords
  } catch (error) {
    return new Error('Error retrieving alert records')
  }
}

/**************************************************************** getAlerts ****************************************************************/
const getAlerts = async () => {

  try {
    // Find alert records by patient ID
    const alertRecords = await Alert.find().select('-patient').lean().exec()

    // If no alert records
    if (!alertRecords?.length) {
      return new Error('No alert records found')
    }

    return alertRecords
  } catch (error) {
    return new Error('Error retrieving alert records')
  }
}


/**************************************************************** createNewUser ****************************************************************/
const createNewUser = async (root, params) => {
  const { email, password, roles, firstName, lastName, gender, dob } = params

  // Confirm data
  if ((!email || !password || !Array.isArray(roles) || !roles.length, !firstName || !lastName)) {
    return new Error('Please provide all required fields')
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ email }).lean().exec()

  if (duplicate) {
    return new AuthenticationError('Duplicate username')
  }

  const userObject = { email, password, roles, firstName, lastName, gender, dob }

  const userModel = new User(userObject)
  const user = await userModel.save()
  if (!user) {
    throw new AuthenticationError('Invalid user data received')
  }
  const token = jwt.sign({ _id: user._id }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpirySeconds,
  })

  return {
    status: 'success',
    message: 'Patient created successfully!',
    data: {
      ...user,
    },
  }
}

/**************************************************************** updateUser ****************************************************************/
const updateUser = async (root, params) => {
  const { userId, email, password, roles, firstName, lastName, gender, dob } = params

  // Confirm data
  if (!userId || (!email && !password && !Array.isArray(roles) && !firstName && !lastName)) {
    throw new Error('Please provide valid update parameters')
  }

  // Check if the user exists
  const existingUser = await User.findById(userId).exec()

  if (!existingUser) {
    throw new Error('User not found')
  }

  // Update user fields if provided
  if (email) {
    // Check for duplicate email
    const duplicate = await User.findOne({ email, _id: { $ne: userId } })
      .lean()
      .exec()

    if (duplicate) {
      throw new Error('Duplicate email')
    }

    existingUser.email = email
  }

  if (password) {
    existingUser.password = password
  }

  if (Array.isArray(roles) && roles.length > 0) {
    existingUser.roles = roles
  }

  if (firstName) {
    existingUser.firstName = firstName
  }

  if (lastName) {
    existingUser.lastName = lastName
  }

  if (gender) {
    existingUser.gender = gender
  }

  if (dob) {
    existingUser.dob = dob
  }

  try {
    const updatedUser = await existingUser.save()
    return updatedUser
  } catch (error) {
    throw new Error('Error updating user')
  }
}

/**************************************************************** deleteUser ****************************************************************/
const deleteUser = async (root, params) => {
  const { userId } = params

  // Confirm data
  if (!userId) {
    throw new Error('Please provide valid parameters')
  }

  // Check if the user exists
  const existingUser = await User.findById(userId).exec()

  if (!existingUser) {
    throw new Error('User not found')
  }

  try {
    await existingUser.remove()
    return 'User deleted successfully'
  } catch (error) {
    throw new Error('Error deleting user')
  }
}

/**************************************************************** createNewVital ****************************************************************/
const createNewVital = async (root, params) => {
  console.log(params)

  const {
    age,
    sex,
    cp,
    trestbps,
    chol,
    fbs,
    restecg,
    thalach,
    exang,
    oldpeak,
    slope,
    ca,
    thal,
    num,
    updateDate,
    patient, // Assuming you pass the patient's ID when creating a new vital
  } = params

  // Confirm data
  // if (
  //   !age ||
  //   !sex ||
  //   !cp ||
  //   !trestbps ||
  //   !chol ||
  //   !fbs ||
  //   !restecg ||
  //   !thalach ||
  //   !exang ||
  //   !oldpeak ||
  //   !slope ||
  //   !ca ||
  //   !thal ||
  //   !num ||
  //   !updateDate ||
  //   !patient
  // ) {
  //   throw new Error('Please provide all required fields')
  // }

  // Check if the patient exists
  const existingPatient = await User.findById(patient).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  const vitalObject = {
    age,
    sex,
    cp,
    trestbps,
    chol,
    fbs,
    restecg,
    thalach,
    exang,
    oldpeak,
    slope,
    ca,
    thal,
    num,
    updateDate,
  }

  const vitalModel = new Vital(vitalObject)

  try {
    vitalModel.patients.push(patient)
    const vital = await vitalModel.save()
    return vital
  } catch (error) {
    throw new Error('Error creating vital data')
  }
}

/**************************************************************** updateVital ****************************************************************/
const updateVital = async (root, params) => {
  const {
    vitalId,
    age,
    sex,
    cp,
    trestbps,
    chol,
    fbs,
    restecg,
    thalach,
    exang,
    oldpeak,
    slope,
    ca,
    thal,
    num,
    updateDate,
    patientId,
  } = params

  // Confirm data
  if (
    !vitalId ||
    (!age &&
      !sex &&
      !cp &&
      !trestbps &&
      !chol &&
      !fbs &&
      !restecg &&
      !thalach &&
      !exang &&
      !oldpeak &&
      !slope &&
      !ca &&
      !thal &&
      !num &&
      !updateDate &&
      !patientId)
  ) {
    throw new Error('Please provide valid update parameters')
  }

  // Check if the vital record exists
  const existingVital = await Vital.findById(vitalId).exec()

  if (!existingVital) {
    throw new Error('Vital record not found')
  }

  // Check if the patient exists
  const existingPatient = await User.findById(patientId).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  // Update vital fields if provided
  if (age) existingVital.age = age
  if (sex) existingVital.sex = sex
  if (cp) existingVital.cp = cp
  if (trestbps) existingVital.trestbps = trestbps
  if (chol) existingVital.chol = chol
  if (fbs) existingVital.fbs = fbs
  if (restecg) existingVital.restecg = restecg
  if (thalach) existingVital.thalach = thalach
  if (exang) existingVital.exang = exang
  if (oldpeak) existingVital.oldpeak = oldpeak
  if (slope) existingVital.slope = slope
  if (ca) existingVital.ca = ca
  if (thal) existingVital.thal = thal
  if (num) existingVital.num = num
  if (updateDate) existingVital.updateDate = updateDate
  if (patientId) existingVital.patient = patientId

  try {
    const updatedVital = await existingVital.save()
    return updatedVital
  } catch (error) {
    throw new Error('Error updating vital record')
  }
}

/**************************************************************** deleteVital ****************************************************************/
const deleteVital = async (root, params) => {
  const { vitalId } = params

  // Confirm data
  if (!vitalId) {
    throw new Error('Please provide valid parameters')
  }

  // Check if the vital record exists
  const existingVital = await Vital.findById(vitalId).exec()

  if (!existingVital) {
    throw new Error('Vital record not found')
  }

  try {
    await existingVital.remove()
    return 'Vital record deleted successfully'
  } catch (error) {
    throw new Error('Error deleting vital record')
  }
}

/**************************************************************** createNewDailyVital ****************************************************************/
const createNewDailyVital = async (root, params) => {
  const { pulseRate, bloodPressure, weight, temperature, respRate, updateDate, patientId } = params

  // Confirm data
  if (
    !pulseRate ||
    !bloodPressure ||
    !weight ||
    !temperature ||
    !respRate ||
    !updateDate ||
    !patientId
  ) {
    throw new Error('Please provide all required fields')
  }

  // Check if the patient exists
  const existingPatient = await User.findById(patientId).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  const dailyVitalObject = {
    pulseRate,
    bloodPressure,
    weight,
    temperature,
    respRate,
    updateDate,
    patient: patientId,
  }

  const dailyVitalModel = new DailyVital(dailyVitalObject)

  try {
    const dailyVital = await dailyVitalModel.save()
    return dailyVital
  } catch (error) {
    throw new Error('Error creating daily vital data')
  }
}

/**************************************************************** updateDailyVital ****************************************************************/
const updateDailyVital = async (root, params) => {
  const {
    dailyVitalId,
    pulseRate,
    bloodPressure,
    weight,
    temperature,
    respRate,
    updateDate,
    patientId,
  } = params

  // Confirm data
  if (
    !dailyVitalId ||
    (!pulseRate &&
      !bloodPressure &&
      !weight &&
      !temperature &&
      !respRate &&
      !updateDate &&
      !patientId)
  ) {
    throw new Error('Please provide valid update parameters')
  }

  // Check if the daily vital record exists
  const existingDailyVital = await DailyVital.findById(dailyVitalId).exec()

  if (!existingDailyVital) {
    throw new Error('Daily vital record not found')
  }

  // Check if the patient exists
  const existingPatient = await User.findById(patientId).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  // Update daily vital fields if provided
  if (pulseRate) existingDailyVital.pulseRate = pulseRate
  if (bloodPressure) existingDailyVital.bloodPressure = bloodPressure
  if (weight) existingDailyVital.weight = weight
  if (temperature) existingDailyVital.temperature = temperature
  if (respRate) existingDailyVital.respRate = respRate
  if (updateDate) existingDailyVital.updateDate = updateDate
  if (patientId) existingDailyVital.patient = patientId

  try {
    const updatedDailyVital = await existingDailyVital.save()
    return updatedDailyVital
  } catch (error) {
    throw new Error('Error updating daily vital record')
  }
}

/**************************************************************** deleteDailyVital ****************************************************************/
const deleteDailyVital = async (root, params) => {
  const { dailyVitalId } = params

  // Confirm data
  if (!dailyVitalId) {
    throw new Error('Please provide valid parameters')
  }

  // Check if the daily vital record exists
  const existingDailyVital = await DailyVital.findById(dailyVitalId).exec()

  if (!existingDailyVital) {
    throw new Error('Daily vital record not found')
  }

  try {
    await existingDailyVital.remove()
    return 'Daily vital record deleted successfully'
  } catch (error) {
    throw new Error('Error deleting daily vital record')
  }
}

/**************************************************************** createNewTip ****************************************************************/
const createNewTip = async (root, params) => {
  const { title, description } = params

  // Confirm data
  if (!title || !description) {
    throw new Error('Please provide all required fields')
  }

  const tipObject = {
    title,
    description,
  }

  const tipModel = new Tip(tipObject)

  try {
    const tip = await tipModel.save()
    return tip
  } catch (error) {
    throw new Error('Error creating tip')
  }
}

/**************************************************************** updateTip ****************************************************************/
const updateTip = async (root, params) => {
  const { tipId, title, description } = params

  // Confirm data
  if (!tipId || (!title && !description)) {
    throw new Error('Please provide valid update parameters')
  }

  // Check if the tip record exists
  const existingTip = await Tip.findById(tipId).exec()

  if (!existingTip) {
    throw new Error('Tip record not found')
  }

  // Update tip fields if provided
  if (title) existingTip.title = title
  if (description) existingTip.description = description

  try {
    const updatedTip = await existingTip.save()
    return updatedTip
  } catch (error) {
    throw new Error('Error updating tip')
  }
}

/**************************************************************** deleteTip ****************************************************************/
const deleteTip = async (root, params) => {
  const { tipId } = params

  // Confirm data
  if (!tipId) {
    throw new Error('Please provide valid parameters')
  }

  // Check if the tip record exists
  const existingTip = await Tip.findById(tipId).exec()

  if (!existingTip) {
    throw new Error('Tip record not found')
  }

  try {
    await existingTip.remove()
    return 'Tip deleted successfully'
  } catch (error) {
    throw new Error('Error deleting tip')
  }
}

/**************************************************************** createNewAlert ****************************************************************/
const createNewAlert = async (root, params) => {
  const { message, address, phone, patient } = params

  // Confirm data
  if (!message || !address || !phone || !patient) {
    throw new Error('Please provide all required fields')
  }

  // Check if the patient exists
  const existingPatient = await User.findById(patient).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  const alertObject = {
    message,
    address,
    phone,
    patient: patient,
  }

  const alertModel = new Alert(alertObject)

  try {
    const alert = await alertModel.save()
    return alert
  } catch (error) {
    throw new Error('Error creating alert')
  }
}

/**************************************************************** updateAlert ****************************************************************/
const updateAlert = async (root, params) => {
  const { alertId, message, address, phone, patientId } = params

  // Confirm data
  if (!alertId || (!message && !address && !phone && !patientId)) {
    throw new Error('Please provide valid update parameters')
  }

  // Check if the alert record exists
  const existingAlert = await Alert.findById(alertId).exec()

  if (!existingAlert) {
    throw new Error('Alert record not found')
  }

  // Check if the patient exists
  const existingPatient = await User.findById(patientId).exec()

  if (!existingPatient) {
    throw new Error('Patient not found')
  }

  // Update alert fields if provided
  if (message) existingAlert.message = message
  if (address) existingAlert.address = address
  if (phone) existingAlert.phone = phone
  if (patientId) existingAlert.patient = patientId

  try {
    const updatedAlert = await existingAlert.save()
    return updatedAlert
  } catch (error) {
    throw new Error('Error updating alert')
  }
}

/**************************************************************** deleteAlert ****************************************************************/
const deleteAlert = async (root, params) => {
  const { alertId } = params

  // Confirm data
  if (!alertId) {
    throw new Error('Please provide valid parameters')
  }

  // Check if the alert record exists
  const existingAlert = await Alert.findById(alertId).exec()

  if (!existingAlert) {
    throw new Error('Alert record not found')
  }

  try {
    await existingAlert.remove()
    return 'Alert deleted successfully'
  } catch (error) {
    throw new Error('Error deleting alert')
  }
}

const prediction = async (root, params) => {
  const { id } = params

  // Get User
  const user = await User.findById(id).exec()

  if (user) {
    const vitals = await Vital.findOne({ patients: [user._id] }).exec()

    const model = await tf.loadLayersModel(tf.io.fileSystem('hd-model/heart-model.json'))

    const data = [
      vitals.age,
      vitals.sex,
      vitals.cp,
      vitals.trestbps,
      vitals.chol,
      vitals.fbs,
      vitals.restecg,
      vitals.thalach,
      vitals.exang,
      vitals.oldpeak,
      vitals.slope,
      vitals.ca,
      vitals.thal,
    ]
    const input = tf.tensor2d(data, [1, data.length])
    const prediction = model.predict(input)

    const output = prediction.dataSync()

    vitals.num = output[0] > 0.5 ? 1 : 0
    await vitals.save()
    return output[0]
  } else {
    throw new Error('User not found')
  }
}

const authenticate = async (root, args, context) => {
  const { req, res } = context
  // Get credentials from request
  const email = args.email
  const password = args.password

  try {
    // find the user with the given email
    const user = await User.findOne({ email })

    if (!user) {
      // User not found
      return {
        status: 'error',
        message: 'User not found!',
        data: null,
      }
    }

    // compare passwords
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (passwordMatch) {
      const token = jwt.sign({ id: user._id }, jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtExpirySeconds,
      })

      res.cookie('token', token, {
        maxAge: jwtExpirySeconds * 1000,
        httpOnly: true,
      })

      req.user = user

      // Return the user data and token
      return {
        status: 'success',
        message: 'User authenticated successfully!',
        data: {
          token,
          user,
        },
      }
    } else {
      // Invalid password
      return {
        status: 'error',
        message: 'Invalid email/password!',
        data: null,
      }
    }
  } catch (error) {
    // Handle any other errors
    console.error('Authentication error:', error)
    return {
      status: 'error',
      message: 'Internal server error',
      data: null,
    }
  }
}

const isSignedIn = async (root, args, context) => {
  const { req, res } = context

  try {
    // Obtain the session token from the requests cookies
    const token = req.cookies.token

    // If the cookie is not set, return 'auth'
    if (!token) {
      return {
        status: 'error',
        message: 'No token provided!',
        data: null,
      }
    }

    // Verify the JWT token
    const payload = await jwt.verify(token, jwtKey)

    // Token is valid, return the user information
    return {
      status: 'success',
      message: 'Token valid!',
      data: {
        user: {},
        token,
      },
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // The JWT is unauthorized, return a 401 error
      return {
        status: 'error',
        message: 'Unauthorized',
        data: null,
      }
    }

    // Otherwise, return a bad request error
    console.error('Error in isSignedIn:', error)
    return {
      status: 'error',
      message: 'Bad Request',
      data: null,
    }
  }
}

module.exports = {
  getAllUsers,
  getAllVital,
  getVitalByPatientId,
  getDailyVitalByPatientId,
  getAllTip,
  getAlertByPatientId,
  getAlerts,
  createNewUser,
  updateUser,
  deleteUser,
  createNewVital,
  updateVital,
  deleteVital,
  createNewDailyVital,
  updateDailyVital,
  deleteDailyVital,
  createNewTip,
  updateTip,
  deleteTip,
  createNewAlert,
  updateAlert,
  deleteAlert,
  prediction,
  authenticate,
  isSignedIn,
}
