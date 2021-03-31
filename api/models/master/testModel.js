'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  TestSchema = new  Schema({
    test_title: { type: String, unique: true, trim: true, required:  true },
    test_subtitle: { type: String,  trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default: 1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("tests", TestSchema);
