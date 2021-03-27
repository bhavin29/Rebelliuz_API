'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  JobClassificationSchema = mongoose.Schema;

// Create Schema add properties
const  JobClassificationSchema = new  Schema({
    jobclassification_name: { type: String, unique: true, trim: true, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, required:true } ,
    createdOn: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("job_classification", JobClassificationSchema);
