'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  JobTypeSchema = mongoose.Schema;

// Create Schema add properties
const  JobTypeSchema = new  Schema({
    jobtype_name: { type: String, unique: true, trim: true, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, required:true } ,
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: Date, default: Date.now }
});

// Create and export User model
module.exports = mongoose.model("job_type", JobTypeSchema);
