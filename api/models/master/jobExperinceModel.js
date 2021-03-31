'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  JobExperinceSchema = new  Schema({
    jobexperince_name: { type: String, unique: true, trim: true, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default: 1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

JobExperinceSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("job_experince", JobExperinceSchema);
