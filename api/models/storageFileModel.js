'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  StorageFileSchema = new  Schema({
    file_id : { type: Number , unique: true, trim: true},
    parent_file_id : { type: Number, default :0 },
    type : { type: String ,default :''},
    parent_type : { type: String,default :''},
    parent_id : { type: Number , default :0 },
    user_id : { type: Number, default :0  },
    creation_date : { type: Date, default: Date.now },
    modified_date : { type: Date, default: Date.now },
    service_id : { type: Number, default :0 },
    storage_path : { type: String,default :'' },
    extension : { type: String ,default :''},
    name : { type: String,default :'' },
    mime_major : { type: String ,default :''},
    mime_minor : { type: String ,default :''},
    size : { type: Number, default :0 },
    hash : { type: String,default :'' }
});

// Create and export User model
module.exports = mongoose.model("storage_files", StorageFileSchema);
