'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserJobSchema = new  Schema({
    user_id: { type: String, required:  true },
    job_category_id: { type: String,  required:  true },
    job_classification_id: { type: String,  required:  true },
    job_experience_id: { type: String, required:  true },
    Job_type_ids: { type: String,  required:  true },
    job_skill_ids: { type: String, required:  true },
    short_description: { type: String, required:  true },
    cv_filename: { type: String, unique: true, trim: true, required:  true },
    expected_salary_start: { type: Number,  required:  true },
    expected_salary_end: { type: Number, required:true } ,
    video_status: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    isactive: { type: Boolean, default: 1 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

//video_status : 1 - pending 2 - partial ,3- completed


// Create and export User Job model
module.exports = mongoose.model("user_job", UserJobSchema);
