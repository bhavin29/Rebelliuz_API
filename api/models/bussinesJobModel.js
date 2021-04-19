'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesJobSchema = new  Schema({
    user_id: { type: String, required:  true },
    bussines_id: { type: String, required:  true },
    location_id : { type: String, required:  true },
    country_id : { type: String },
    job_category_id: { type: String,  required:  true },
    job_classification_id: { type: String,  required:  true },
    job_experience_id: { type: String },
    job_type_ids: { type: String },
    job_skill_ids: { type: String },
    culture_values_ids: { type: String, required:  true },    
    short_description: { type: String, required:  true },
    short_description_file: { type: String },
    education: { type: String, },
    certification: { type: String },
    expected_salary_start: { type: Number,  required:  true },
    expected_salary_end: { type: Number, required:true } ,
    isactive: { type: Boolean, default: 1 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

BussinesJobSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("bussines_jobs", BussinesJobSchema);
