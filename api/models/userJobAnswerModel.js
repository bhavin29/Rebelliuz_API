'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserJobAnswerSchema = new  Schema({
    user_id: { type: String, required:  true },
    job_category_id: { type: String,  required:  true },
    job_question_id: { type: String,  required:  true },
    video_filename: { type: String, unique: true, trim: true, required:  true },
    video_old_filename: { type: String },
    video_status: { type: Number, default: 1 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User Job model
module.exports = mongoose.model("user_job_answer", UserJobAnswerSchema);
