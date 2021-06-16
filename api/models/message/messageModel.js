'use strict';

// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  MessageSchema = new  Schema(
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      receiver: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      body: {
        type: Object,
        required: true,
      },
    },
    { timestamps: true },
  );

// Create and export User model
module.exports = mongoose.model("messages", MessageSchema);
