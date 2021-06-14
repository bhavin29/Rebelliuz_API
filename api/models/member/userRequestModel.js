const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('user_request', UserRequestSchema)
