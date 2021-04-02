'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserReferenceSchema = new  Schema({
    owner_id: { type: String, required:  true },
    user_id: { type: String, required:  true },
    title: { type: String,  required:  true },
    pros: { type: String,  required:  true },
    cons: { type: String, required:  true },
    description: { type: String,  required:  true },
    rating: { type: Number, required:  true },
    recommended: { type: Boolean, default: 0 },
    useful_count: { type: Number, default: 0 },
    funny_count: { type: Number, default: 0 },
    cool_count: { type: Number, default: 0 },
    featured: { type: Boolean, default: 0 },
    verified: { type: Boolean, default: 0 },
    like_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
    view_count: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

UserReferenceSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("user_reference", UserReferenceSchema);
