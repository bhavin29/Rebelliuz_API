'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobUserAnswerSchema = new  Schema({
    bussines_id: { type: String, required:  true },
    job_category_id: { type: String, required:  true },
    bussines_job_id: { type: String },
    bussines_user_id: { type: String, required:  true },
    search_user_id: { type: String, required:  true },
    job_question_id: { type: String, required:  true },
    rating: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

//Rating: 1:Unacceptable, 2: Needs Improvement, 3: Meets Expectation, 4: Exceeds Expectation, 5: Outstanding 
//overall_rating : sum of rating given on each question bu bussines_user_id
//overall_progress: overall view by user on vidoe answers

module.exports = mongoose.model("bussines_job_user_answers", BussinesJobUserAnswerSchema);
