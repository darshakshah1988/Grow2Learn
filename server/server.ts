require('dotenv').config()

import app from './app'
import connection from './connection'

import './routes/public'
import './routes/admin'
import './routes/student'
import './routes/rest'
import './routes/mentor'
import { PORT } from './constants'
import { Logger } from './logger'

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(PORT);
    Logger.info(`headway started @ ${(new Date()).toLocaleString()}\nhttps://stagegrow.herokuapp.com:${PORT}\n`)
  })
  // const io = require('socket.io').listen(server, {
  //   path: '/headway'
  // })
  // const student = io.of('/socket/student')
  // student.on('connect', socket => {
  //   Logger.info(`Student with email ${socket.handshake.query.email} connected...`)
  //   socket.on('notify-student', () => {
  //     io.binary(false).emit('update-student')
  //   })
    
  //   socket.on('disconnect', reason => {
  //     Logger.info(`Student with email ${socket.handshake.query.email} disconnected...`)
  //   })
  // })
}

const debug = async () => {
}

connection.sync().then(() => {
  // debug()
  startServer()
})
