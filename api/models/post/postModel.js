'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PostSchema = new  Schema({
    user_id: { type: String, trim: true, required:  true },
    text: { type: String, trim: true },
    theme: { type: Number, trim: true ,default:0},
    post_type :{type: Number, trim: true ,default:0},//[1 = Text, 2 = Link, 3 = Theme]
    like_counts: { type: Number, trim: true ,default:0},
    post_Counts: { type: Number, trim: true ,default:0},
    device_id: { type: String, trim: true },
    device_name:{ type: String, trim: true },
    ip_address: { type: String, trim: true },
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

PostSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("posts", PostSchema);
