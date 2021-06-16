const User = require('../../api/models/userModel');
const CreateNotification = require("../CreateNotification")

module.exports = async ({ req, key, data, notif_body }) => {
  const connection = await User.findById(global.decoded._id).populate("connections")


  connection.connections.forEach(async user => {
    if (user.socketId) {
      req.io.to(user.socketId).emit(key, { data })
      if (notif_body) {
        let notification = await CreateNotification({ user: user._id, body: notif_body })
        req.io.to(user.socketId).emit("Notification", { data: notification })
      }
    }
  })
}