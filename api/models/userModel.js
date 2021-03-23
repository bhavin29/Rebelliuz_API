'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Import bcryptjs - for password hashing
const  bcrypt = require('bcryptjs');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserSchema = new  Schema({
    fullName: { type:  String, trim:  true,required:  true },
    email: {type:String,unique:true,lovercase:true,trim:true,required:true} ,
    hash_password: {type:String,required:false},
    createdOn: {type:  Date,default:  Date.now}
});

//Create a Schema method to compare password 
UserSchema.methods.comparePassword = function(password){
return  bcrypt.compareSync(password, this.hash_password);
}

// Create and export User model
module.exports = mongoose.model("User", UserSchema);
