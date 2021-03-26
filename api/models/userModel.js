'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");

// Import bcryptjs - for password hashing
const  bcrypt = require('bcryptjs');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserSchema = new  Schema({
    email: {type:String,unique:true,lovercase:true,trim:true,required:true} ,
    createdOn: {type:  Date,default:  Date.now},
    user_id: { type :  Number , default: null },
    username: { type :  String  , default: null },
    displayname: { type :  String  , default: null },
    photo_id: { type :  Number , default: null },
    status: { type :  String , default: null },
    status_date: { type :  Date , default: null },
    password: { type :  String ,required:true , default: null },
    hash_password: {type:String, default: null },
    salt: { type :  String  , default: null },
    locale: { type :  String   , default: null },
    language: { type :  String  , default: null },
    timezone: { type :  String  , default: null },
    search: { type :  Number  , default: null },
    show_profileviewers: { type :  Number , default: null },
   level_id: { type :  Number  , default: null },
    invites_used: { type :  Number  , default: null },
    extra_invites: { type :  Number  , default: null },
    enabled: { type :  Number  , default: null },
    verified: { type :  Number  , default: null },
    approved: { type :  Number  , default: null },
    creation_date: { type :  Date,default:  Date.now , default: null },
    creation_ip: { type :  String , default: null },
    modified_date: { type :  Date , default: null },
    lastlogin_date: { type :  Date , default: null },
    lastlogin_ip: { type :  String , default: null },
    update_date: { type :  Number , default: null },
    member_count: { type :  Number  , default: null },
    view_count: { type :  Number  , default: null },
    comment_count: { type :  Number  , default: null },
    like_count: { type :  Number  , default: null },
    coverphoto: { type :  Number  , default: null },
    coverphotoparams: { type :  String , default: null },
    view_privacy: { type :  String  , default: 'everyone'},
    disable_email: { type :  Number  , default: null },
    disable_adminemail: { type :  Number  , default: null },
    last_password_reset: { type :  Date , default: null },
    last_login_attempt: { type :  Date , default: null },
    login_attempt_count: { type :  Number  , default: null },
    lastLoginDate: { type :  String   , default: 'everyone' },
    lastUpdateDate: { type :  String   , default: 'everyone' },
    inviteeName: { type :  String   , default: 'everyone'  },
    profileType: { type :  String   , default: 'everyone'},
    memberLevel: { type :  String   , default: 'everyone'},
   profileViews: { type :  String   , default: 'everyone' },
    joinedDate: { type :  String   , default: 'everyone' },
    friendsCount: { type :  String   , default: 'everyone' },
    donotsellinfo: { type :  Number  , default: null },
    mention: { type :  String  , default: null },
    phone_number: { type :  String  , default: null },
    country_code: { type :  String , default: null },
    enable_verification: { type :  Number , default: null },
    cover_video: { type :  Number  , default: null },
    follow_count: { type :  Number  , default: null },
    location: { type :  String, default: null },
    rating: { type :  Number , default: null },
    user_verified: { type :  Number  , default: null },
 });

//Create a Schema method to compare password 
UserSchema.methods.comparePassword = function(password){
return  bcrypt.compareSync(password, this.hash_password);
}

// Create and export User model
module.exports = mongoose.model("users", UserSchema);
