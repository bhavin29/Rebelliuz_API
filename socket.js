const User = require('./api/models/userModel')
const jwt = require('jsonwebtoken')

module.exports = (io) => {
  console.log('io' + io.req)
  io.on('connection', (socket) => {
    console.log('Sokcet 1connection')
    if (io.req) {
      console.log('Sokcet 2')
      socket.broadcast.emit('friend-login-status', { user_id: io.req.userId })
      addSocketIdInDB(socket.id, io.req.userId)
      console.log('Sokcet 3')

      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });


      socket.on('disconnect', () => {
        console.log('Sokcet 4 disconnect')
        socket.broadcast.emit('friend-logout-status', {
          user_id: io.req.userId,
        })
        console.log('Sokcet 5')
        io.req.userId = null
      })
    }
  })
}

async function addSocketIdInDB(socket_id, user_id) {
  const user = await User.findById(user_id)
  console.log('Sokcet 6')
  if (socket_id) {
    console.log('Sokcet 7 ')
    user.socketId = socket_id
  }
  await user.save()
}
