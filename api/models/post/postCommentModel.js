'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PostCommentSchema = new  Schema({
    post: {
      type: Schema.Types.ObjectId,
      ref: 'posts',
    },
  
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    body: {
      image: String,
      text: {
        type: String,
        trim: true,
      },
    },
  
    likes: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    },
    { timestamps: true }
)

PostCommentSchema.plugin(aggregatePaginate);
// Create and export User model
module.exports = mongoose.model("post_comments", PostCommentSchema);
