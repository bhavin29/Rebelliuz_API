'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PostCommentSchema = new  Schema({
    post_id: { type: String, trim: true, required:  true },
    user_id: { type: String, trim: true , required:  true},
    comments: { type: String, trim: true, default: '' },
    post_like_counts: { type: Number, trim: true, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

PostCommentSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("post_comments", PostCommentSchema);
