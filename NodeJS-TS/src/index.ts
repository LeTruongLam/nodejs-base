const express = require('express')

import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
const port = 3000
databaseService.connect()

app.use(express.json())
app.use('/users', usersRouter)

/**
 * Default error handler
 */
app.use(defaultErrorHandler)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
