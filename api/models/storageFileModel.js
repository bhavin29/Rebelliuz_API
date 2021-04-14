'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  StorageFileSchema = new  Schema({
    file_id : { type: String , unique: true, trim: true},
    parent_file_id : { type: String },
    type : { type: String },
    parent_type : { type: String },
    parent_id : { type: String },
    user_id : { type: String },
    creation_date : { type: String },
    modified_date : { type: String },
    service_id : { type: String },
    storage_path : { type: String },
    extension : { type: String },
    name : { type: String },
    mime_major : { type: String },
    mime_minor : { type: String },
    size : { type: String },
    hash : { type: String }
});

// Create and export User model
module.exports = mongoose.model("storage_files", StorageFileSchema);
