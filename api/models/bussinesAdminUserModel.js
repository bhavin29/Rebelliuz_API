'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  BussinesAdminUserSchema = new  Schema({
    bussines_id: { type: String, required:  true },
    bussines_user_id: { type: String, required:  true },
    role: { type: Number, required:  true },
    isactive: { type: Boolean, default: 1 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});

BussinesAdminUserSchema.plugin(aggregatePaginate);


//role : 1: HR, 2: Panaliest

// Create and export User model
module.exports = mongoose.model("bussines_admin_users", BussinesAdminUserSchema);
