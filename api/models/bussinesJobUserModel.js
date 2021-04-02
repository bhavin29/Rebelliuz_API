'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobUserSchema = new  Schema({
    bussines_id: { type: String, required:  true },
    bussines_job_id: { type: String, required:  true },
    job_category_id: { type: String, required:  true },
    search_user_id: { type: String, required:  true },
    search_status: { type: Number, default: 0 },
    overall_rating: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// search_status: 1: Requested, 2: RequestApproved, 3: RequestRejected, 3: Shortlisted, 4: Offer, 5: Final Interview, 6: TalentPool 
//overall_rating : sum of rating given on each question bu bussines_user_id
//overall_progress: overall view by user on vidoe answers

module.exports = mongoose.model("bussines_job_users", BussinesJobUserSchema);
