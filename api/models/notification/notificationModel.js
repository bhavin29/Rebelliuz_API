const { Schema, model } = require("mongoose")


const notificationSchema = new Schema({
    body: {
        type: String,
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
    }

}, { timestamps: true })


module.exports = model("notification",notificationSchema)