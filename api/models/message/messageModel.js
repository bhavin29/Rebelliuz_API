'use strict';

// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
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

  MessageSchema.plugin(aggregatePaginate);
// Create and export User model
module.exports = mongoose.model("messages", MessageSchema);
