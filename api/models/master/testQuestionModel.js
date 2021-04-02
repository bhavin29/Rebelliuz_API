'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  TestQuestionSchema = new  Schema({
    test_id: { type: String, unique: true, trim: true, required:  true },
    question: { type: String,  trim: true, required:  true },
    option1: { type: String,  trim: true, required:  true },
    option2: { type: String,  trim: true, required:  true },
    option3: { type: String,  trim: true, required:  true },
    option4: { type: String,  trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default: 1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

TestQuestionSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("test_questions", TestQuestionSchema);
