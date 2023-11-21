const config = require('./config')
const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const compress = require('compression')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./../app/schema/schema')
const { logger } = require('../middleware/logger')
const errorHandler = require('../middleware/errHandler')
const corsOptions = require('./corsOptions')

module.exports = function () {
  const app = express()

  app.use(logger)

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress())
  }

  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(bodyParser.json())

  app.use(cookieParser())

  app.use(
    session({
      saveUninitialized: true,
      resave: true,
      secret: config.sessionSecret,
    }),
  )

  app.use(
    '/graphql',
    graphqlHTTP((request, response) => ({
      schema,
      graphiql: process.env.NODE_ENV === 'development',
      context: {
        req: request,
        res: response,
      },
    })),
  )

  app.use(errorHandler)

  return app
}
