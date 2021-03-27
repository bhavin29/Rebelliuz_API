'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  JobCategorySchema = mongoose.Schema;

// Create Schema add properties
const  JobCategorySchema = new  Schema({
    jobcategory_name: { type: String, unique: true, trim: true, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, required:true } ,
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: Date, default: Date.now }
});

// Create and export User model
module.exports = mongoose.model("job_category", JobCategorySchema);
