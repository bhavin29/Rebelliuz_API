'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const BusinessCategorySchema = new  Schema({
    business_category_name: { type: String, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default:1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

BusinessCategorySchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("business_categories", BusinessCategorySchema);
