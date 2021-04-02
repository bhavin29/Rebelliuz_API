'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobUserReviewSchema = new  Schema({
    bussines_id: { type: String, required:  true },
    bussines_job_id: { type: String, required:  true },
    job_category_id: { type: String, required:  true },
    bussines_user_id: { type: String, required:  true },
    overall_progress: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

module.exports = mongoose.model("bussines_job_user_review", BussinesJobUserReviewSchema);
