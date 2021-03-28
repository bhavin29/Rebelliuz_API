'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  JobQuestionSchema = mongoose.Schema;

// Create Schema add properties
const  JobQuestionSchema = new  Schema({
    job_category_id: { type: String,  required:  true },
    question: { type: String,  required:  true },
    short_question: { type: String, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, required:true } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("job_type", JobQuestionSchema);
