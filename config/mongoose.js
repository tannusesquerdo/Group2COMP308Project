const config = require('./config')
const mongoose = require('mongoose')

const connectDB = async () => {
  const conn = await mongoose.connect(config.db)

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
}

module.exports = connectDB
