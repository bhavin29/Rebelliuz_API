'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  UserTestSchema = new  Schema({
    user_id: { type: String, unique: true, trim: true, required:  true },
    test_question_id: { type: String, unique: true, trim: true, required:  true },
    answer1: { type: Boolean,  trim: true, required:  true },
    answer2: { type: Boolean,  trim: true, required:  true },
    answer3: { type: Boolean,  trim: true, required:  true },
    answer4: { type: Boolean,  trim: true, required:  true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

// Create and export User model
module.exports = mongoose.model("user_tests", UserTestSchema);
