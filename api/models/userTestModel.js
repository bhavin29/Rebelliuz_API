'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  UserTestSchema = new  Schema({
    user_id: { type: String, trim: true, required:  true },
    test_id: { type: String, trim: true, required:  true },
    test_question_id: { type: String, trim: true, required:  true },
    answer: { type: Number,  trim: true, required:  true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("user_tests", UserTestSchema);
