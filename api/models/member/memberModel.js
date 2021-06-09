'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  MemberSchema = new  Schema({
    user_id: { type: String, trim: true, required:  true },
    follow_user_id: { type: String, trim: true, required:  true },
    status: { type: Number, trim:true, required:true } ,  // [ Requested = 1 , Accepted = 2 , Rejected = 3 , Block = 4]
    device_id: { type: String, trim: true },
    device_name:{ type: String, trim: true },
    ip_address: { type: String, trim: true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

MemberSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("members", MemberSchema);
