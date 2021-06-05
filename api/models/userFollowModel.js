'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserFollowSchema = new  Schema({
    user_id: { type: String, trim: true, required:  true },
    follow_user_id: { type: String, trim: true, required:  true },
    status: { type: Number, trim:true, required:true } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

UserFollowSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("user_follow", UserFollowSchema);
