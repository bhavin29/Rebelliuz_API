'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  UserPackageLimitSchema = new  Schema({
    user_id: { type: String, trim: true, required:  true },
    module: { type: Number, trim: true, required:  true },
    limit: { type: Number, trim: true, required:  true },
    created_on: { type: Date, default: Date.now },
});

// Create and export User model
module.exports = mongoose.model("user_package_limits", UserPackageLimitSchema);
