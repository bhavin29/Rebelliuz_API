'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobSchema = new  Schema({
    user_id: { type: String, required:  true },
    bussines_id: { type: String, required:  true },
    location_id : { type: String, required:  true },
    country_id : { type: String, required:  true },
    job_title: { type: String,  required:  true },
    job_category_id: { type: String,  required:  true },
    job_classification_id: { type: String,  required:  true },
    job_experience_id: { type: String, required:  true },
    Job_type_ids: { type: String,  required:  true },
    job_skill_ids: { type: String, required:  true },
    culture_values_ids: { type: String, required:  true },    
    short_description: { type: String, required:  true },
    education: { type: String, required:  true },
    certification: { type: String },
    reference: { type: String },
    visa_status: { type: String },
    expected_salary_start: { type: Number,  required:  true },
    expected_salary_end: { type: Number, required:true } ,
    video_status: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    isactive: { type: Boolean, default: 1 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("bussines_jobs", BussinesJobSchema);
