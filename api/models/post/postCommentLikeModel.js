'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PostCommentLikeSchema = new  Schema({
    post_comments_id: { type: String, trim: true, required:  true },
    user_id: { type: String, trim: true , required:  true},
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

PostCommentLikeSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("post_comments_likes", PostCommentLikeSchema);
