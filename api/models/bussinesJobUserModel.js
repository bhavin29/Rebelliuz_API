'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobUserSchema = new  Schema({
    bussines_id: { type: String, trim:true, required:  true },
    bussines_job_id: { type: String, trim:true},
    job_category_id: { type: String, trim:true, required:  true },
    search_user_id: { type: String, required:  true },
    search_status: { type: Number, default: 0 },
    overall_rating: { type: Number, default: 0 },
    overall_progress: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

//search_status: 10: Requested, 20: Request Approved, 30: Request Rejected, 40: Shortlisted, 50: Offer, 60: Final Interview, 70: TalentPool 
//overall_rating : sum of rating given on each question by bussines_user_id
//overall_progress: overall view by user on vidoe answers bussines_user_id

module.exports = mongoose.model("bussines_job_users", BussinesJobUserSchema);
