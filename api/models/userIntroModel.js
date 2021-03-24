'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserIntroSchema = new  Schema({
    userId: { type: String, unique: true, trim: true, required:  true },
    email: { type: String, unique: true, trim: true, required:  true },
    vFilename: { type: String, trim:true, required:true } ,
    createdOn: { type: Date, default: Date.now }
});

// Create and export User model
module.exports = mongoose.model("UserIntro", UserIntroSchema);
