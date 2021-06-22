'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Import bcryptjs - for password hashing
const  bcrypt = require('bcryptjs');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  UserSchema = new  Schema({
    email: {type:String,unique:true,lovercase:true,trim:true,required:true} ,
    createdOn: {type:  Date,default:  Date.now},
    user_id: { type :  Number , default: 0 },
    username: { type :  String  , default: '' },
    displayname: { type :  String  , default: '' },
    photo_id: { type :  Number , default: 0 },
    status: { type :  String , default: ''},
    status_date: { type :  Date , default: Date.now  },
    password: { type :  String ,required:true , default: '' },
    hash_password: {type:String, default: '' },
    salt: { type :  String  , default: '' },
    locale: { type :  String   , default: '' },
    language: { type :  String  , default: '' },
    timezone: { type :  String  , default: '' },
    search: { type :  Number  , default: 0 },
    show_profileviewers: { type :  Number , default: 0 },
    level_id: { type :  Number  , default: 0 },
    invites_used: { type :  Number  , default: 0 },
    extra_invites: { type :  Number  , default: 0 },
    enabled: { type :  Number  , default: 0 },
    verified: { type :  Number  , default: 0 },
    approved: { type :  Number  , default: 0 },
    creation_date: { type :  Date, default:  Date.now },
    creation_ip: { type :  String , default: '' },
    modified_date: { type :  Date , default: Date.now },
    lastlogin_date: { type :  Date , default: Date.now },
    lastlogin_ip: { type :  String , default: '' },
    update_date: { type :  Date , default: Date.now },
    member_count: { type :  Number  , default: 0 },
    view_count: { type :  Number  , default: 0 },
    comment_count: { type :  Number  , default: 0 },
    like_count: { type :  Number  , default: 0 },
    coverphoto: { type :  Number  , default: 0 },
    coverphotoparams: { type :  String , default: '' },
    view_privacy: { type :  String  , default: 'everyone'},
    disable_email: { type :  Number  , default: 0 },
    disable_adminemail: { type :  Number  , default: 0 },
    last_password_reset: { type :  Date , default:  Date.now },
    last_login_attempt: { type :  Date , default:  Date.now },
    login_attempt_count: { type :  Number  , default: 0 },
    lastLoginDate: { type :  String   , default: 'everyone' },
    lastUpdateDate: { type :  String   , default: 'everyone' },
    inviteeName: { type :  String   , default: 'everyone'  },
    profileType: { type :  String   , default: 'everyone'},
    memberLevel: { type :  String   , default: 'everyone'},
    profileViews: { type :  String   , default: 'everyone' },
    joinedDate: { type :  String   , default: 'everyone' },
    friendsCount: { type :  String   , default: 'everyone' },
    donotsellinfo: { type :  Number  , default: 0 },
    mention: { type :  String  , default: '' },
    phone_number: { type :  String  , default: ''  },
    country_code: { type :  String , default: ''  },
    enable_verification: { type :  Number , default: 0 },
    cover_video: { type :  Number  , default: 0 },
    follow_count: { type :  Number  , default: 0 },
    location: { type :  String, default: '' },
    rating: { type :  Number , default: 0 },
    user_verified: { type :  Number  , default: 0 },
    connections: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    socketId: {type: String,default: '',},
    item_id:{ type :  Number  , default: 0 },
    profile_type:{ type :  Number  , default: 0 },
    user_type:{ type :  Number  , default: 0 },//[1 = Employee, 2 = Employer]
    first_name:{ type :  String, default: '' },
    last_name:{ type :  String, default: '' },
    gender:{ type :  Number  , default: 0 },//[1 = Male, 2 = FeMale, 3 =]
    facebook_id:{ type :  String, default: '' },
    linkedin_id:{ type :  String, default: '' },
    google_id :{ type :  String, default: '' },
    profile_status:{ type :  Number  , default: 0 },
    birthdate: { type: Date, default: Date.now },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
 });

//Create a Schema method to compare password 
UserSchema.methods.comparePassword = function(password){
return  bcrypt.compareSync(password, this.hash_password);
}

UserSchema.plugin(aggregatePaginate);

// Create and export User model
module.exports = mongoose.model("users", UserSchema);
