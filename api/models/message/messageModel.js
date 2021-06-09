'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  MessageSchema = new  Schema({
    to_user_id: { type: String, trim: true, required:  true },
    from_user_id: { type: String, trim: true, required:  true },
    message: { type: String, trim: true },
    link: { type: String, trim: true },
    filename: { type: String, trim: true },
    filetype: { type: String, trim: true },
    resource_type: { type: Number, trim:true, required:true } ,  // [ Text = 1 , Link = 2 , Document = 3 ]
    device_id: { type: String, trim: true },
    device_name:{ type: String, trim: true },
    ip_address: { type: String, trim: true },
    isread: { type: Boolean, trim: true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

MessageSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("messages", MessageSchema);
