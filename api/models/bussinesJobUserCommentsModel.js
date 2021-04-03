'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobUserCommentSchema = new  Schema({
    bussines_id: { type: String, required:  true },
    userid_id: { type: String, required:  true },
    bussines_job_id: { type: String, required:  true },
    job_category_id: { type: String, required:  true },
    bussines_user_id: { type: String, required:  true },
    search_user_id: { type: String, required:  true },
    comments: { type: String, required:  true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

module.exports = mongoose.model("bussines_job_user_comments", BussinesJobUserCommentSchema);
