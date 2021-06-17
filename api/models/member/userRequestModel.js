const mongoose = require('mongoose')

const Schema = mongoose.Schema
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

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
UserRequestSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('user_request', UserRequestSchema)
