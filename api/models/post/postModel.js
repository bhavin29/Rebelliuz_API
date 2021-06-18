'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PostSchema = new  Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      content: {
        type: String,
        trim: true,
      },
      body: {
        feelings: {
          type: String,
          trim: true,
        },
        with: [
          {
            type: Schema.Types.ObjectId,
            ref: 'users',
          },
        ],
        at: {
          type: String,
          trim: true,
        },
        date: String,
      },
      image: String,
      isProfilePost: {
        type: Boolean,
        default: false,
      },
  
      profilePostData: {
        coverImage: String,
        profileImage: String,
      },
  
      privacy: {
        type: String,
        enum: ['Only me', 'Public'],
        default: 'Public',
      },
  
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
      ],
  
      hearts: [
        {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
      ],
    },
    { timestamps: true },
  )
  PostSchema.plugin(aggregatePaginate);
// Create and export User model
module.exports = mongoose.model("posts", PostSchema);
