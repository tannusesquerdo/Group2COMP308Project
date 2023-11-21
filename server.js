require('dotenv').config()

const connectDB = require('./config/mongoose')
const express = require('./config/express')
const PORT = process.env.PORT || 4000

var app = express()

// connect to database
connectDB()

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
