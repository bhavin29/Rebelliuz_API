var fs = require('fs');
jwt = require('jsonwebtoken'),
bcrypt = require('bcryptjs');
const config = require('../../config/appconfig');
const RequestHandler = require('../../utils/RequestHandler');
const Mailer = require('../../utils/Mailer');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
var mongoose = require('mongoose');

const User = require("../models/userModel");
const Bussines = require("../models/bussinesModel");
const UserIntro = require("../models/userIntroModel");
const accessTokenSecret = 'vasturebelliuzhsepur';
const BusinessUser = require("../models/bussinesModel");
const StorageFile = require("../models/storageFileModel");


exports.signIn = (req, res) => {
    try{
    if (req.query.username == undefined || req.query.username == '')
    {
        errMessage = '{ "Sign in": { "message" : "Parameter missing."} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' ,JSON.parse(errMessage));
    }
    else {

        let isUserId = Number.isInteger(parseInt(req.query.username));
            let matchValue=0;

            if (isUserId == true)
            {
                matchValue = { user_id : parseInt(req.query.username) };
            }
            else
            {
                matchValue = {username: new RegExp(req.query.username , "i")};
            }

            User.aggregate([
            {
              $match: matchValue 
            },
            {  $lookup:{
                  from: "storage_files",
                  let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                  pipeline: [
                    {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                    {$match: {$expr:
                          { $or : 
                            [
                              {$eq: ["$file_id", "$$photo_id"]},
                           //   {$eq: ["$file_id", "$$cover_photo"]},
                            ]
                          }
                    } 
                    }
                  ],
                  as: "userphoto"
                }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                 },
                {  $lookup:{
                    from: "user_intros",
                    let: { email: "$email"  },
                    pipeline: [
                      {$project: {  _id: 1 , vFilename:1 ,email:1 } },
                      {$match: {$expr:
                            { $or : 
                              [
                                { $eq: ["$email", "$$email"]},
                              ]
                            }
                      } 
                      }
                    ],
                    as: "userintro"
                  }
                  },
                    ],function(err, data) {
                  if (err)
                   {
                       errMessage = '{ "User sign in": { "message" : "User is not found"} }';
                       requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                   }
                   else if (data.length == 0)
                   {
                    errMessage = '{ "User sign in": { "message" : "User is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
                   }
                    else
                   {
                    var sign = '';
                       if (data.length > 0 ) {
                        sign =  jwt.sign({ email: data[0].email, displayname : data[0].displayname, _id: data[0]._id }, accessTokenSecret);
                        Bussines.aggregate([
                          {
                            $match:{ owner_id : data[0].user_id } 
                          },
                          {  $lookup:{
                            from: "bussines_jobs",
                            let: { id: "$_id"  },
                            pipeline: [
                         //   {$project : { bid : { "$toString" : "$id" } }},  
                            {$match: {$expr: {$eq: [ {"toObjectId" : "$bussines_id"} , "$id" ]}}}
                            ],
                            as: "bussinesjobs"
                            }
                          },
                     /*     {
                            $unwind: {
                                path: "$bussines_jobs",
                                preserveNullAndEmptyArrays: true
                            }
                         },*/
                          {  $lookup:{
                            from: "storage_files",
                            let: { photo_id: "$photo_id" , cover_photo: "$bussines.cover" },
                            pipeline: [
                              {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                              {$match: {$expr:
                                    { $or : 
                                      [
                                        {$eq: ["$file_id", "$$photo_id"]},
                                     //   {$eq: ["$file_id", "$$cover_photo"]},
                                      ]
                                    }
                              } 
                              }
                            ],
                            as: "bussinesphoto"
                          },
                          }],function(err, bussines) {
                        if (err)
                         {
                             errMessage = '{ "User sign in": { "message" : "User is not found"} }';
                             requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                         }
                         else
                        {
                          data = { 
                            "access_token" : sign ,
                            "refresh_token" : "",
                            "expire_time" : "2d",
                            "user" : data,
                            "bussines" : bussines,
                          }; 
                          mailing(data);
                          requestHandler.sendSuccess(res,'User result found successfully.',200,data);
                        }
                      });
                    }
            }
          });
        }
    } catch (err) {
        errMessage = { "SignIn": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'User Signin',(errMessage));
      }
};

// User Register function
exports.loginRequired = (req, res, next) => {
    if (req.user) {
    res.json({ message: 'Authorized User, Action Successful!'});
    next();
        } else {
    res.status(401).json({ message: 'Unauthorized user!' });
        }
};

// authenticate JWT
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// NOT IN USE
// User Register function
exports.register =async (req, res) => {
    try{
        let { user_type, first_name, last_name, email,company_name,company_phone,password } = req.body

        if(!user_type)
        {
          errMessage = '{ "Register": { "register" : "Please select profile type"} }';
          requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
        }
        else if(user_type == 1 )
        {
          if (userRegisterValidation(req,user_type) ) {
            errMessage = '{ "Register": { "register" : "Please add mandatory fields value."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
          }
          else
          {

            const checkDuplecateEmail = await User.findOne({email : email});
            if (checkDuplecateEmail) {
              errMessage = '{ "Register": { "message" : "'+ email +' is already registerd."} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                  const user_id =await User.find().sort({user_id:-1}).limit(1);
                  var newUser = new User();
                  newUser.user_id = user_id[0].user_id + 1;
                  newUser.username = email;
                  newUser.displayname = first_name +' '+last_name;
                  newUser.password =  password;
                  newUser.hash_password =  bcrypt.hashSync(password, 10);
                  newUser.user_type = user_type;
                  newUser.first_name = first_name;
                  newUser.last_name = last_name;
                  newUser.email = email;

                  newUser.save((err, user) => {
                    if (err) {
                        errMessage = '{ "register": { "message" : "Smothing went worng."} }';
                        requestHandler.sendError(req,res, 422, err.message,JSON.parse(errMessage));
                    }

                        sign =  jwt.sign({ email: user.email, displayname : user.displayname, _id: user._id }, accessTokenSecret);
                        
                        var newUserResponse = {
                          _id : user._id,
                          user_id : user.user_id,
                          username : user.username,
                          displayname : user.displayname,
                          connections : user.connections,
                          socketId : user.socketId,
                          item_id : user.item_id,
                          user_type : user.user_type,
                          first_name : user.first_name,
                          last_name : user.last_name,
                          gender : user.gender,
                          facebook_id : user.facebook_id,
                          linkedin_id : user.linkedin_id,
                          google_id : user.google_id,
                          profile_status : user.profile_status,
                          email : user.email,
                          birthdate : user.birthdate
                        };

                        data = { 
                          "access_token" : sign ,
                          "user" : newUserResponse,
                          "bussines" : {},
                        }; 
                        requestHandler.sendSuccess(res,'User successfully register.',200,(data));

                    });
            }
          }
        }
        else if(user_type == 2 )
        {
          if (userRegisterValidation(req,user_type)){
            errMessage = '{ "Register": { "register" : "Please add mandatory fields value."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
          }
          else
          {
            const checkDuplecateEmail = await User.findOne({email : email});
            const checkDuplecateCompanyName = await Bussines.findOne({title : company_name});
            const checkDuplecateCompanyPhone = await Bussines.findOne({page_contact_phone : company_phone});

            if (checkDuplecateEmail) {
              errMessage = '{ "Register": { "message" : "'+ email +' is already registerd."} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else if(checkDuplecateCompanyName)
            {
              errMessage = '{ "Register": { "message" : "'+ company_name +' is already registerd."} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else if(checkDuplecateCompanyPhone)
            {
              errMessage = '{ "Register": { "message" : "'+ company_phone +' is already registerd."} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                const user_id = await User.find().sort({user_id:-1}).limit(1);
                var newUser = new User();
                newUser.user_id = user_id[0].user_id + 1;
                newUser.username = email;
                newUser.displayname = first_name +' '+last_name;
                newUser.password =  password;
                newUser.hash_password =  bcrypt.hashSync(password, 10);
                newUser.user_type = user_type;
                newUser.first_name = first_name;
                newUser.last_name = last_name;
                newUser.email = email;
              
                newUser.save((err, user) => {
                    if (err) {
                        errMessage = '{ "register": { "message" : "Smothing went worng."} }';
                        requestHandler.sendError(req,res, 422, err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        var newBussines = new Bussines();
                        newBussines.owner_id = user.user_id;
                        newBussines.title = company_name;
                        newBussines.page_contact_name = company_name;
                        newBussines.page_contact_phone = company_phone;
                    
                        newBussines.save((err, bussines) => {
                          if (err) {
                              errMessage = '{ "register": { "message" : "Smothing went worng."} }';
                              requestHandler.sendError(req,res, 422, err.message,JSON.parse(errMessage));
                          }
                          else
                          {

                            sign =  jwt.sign({ email: user.email, displayname : user.displayname, _id: user._id }, accessTokenSecret);

                            var newUserResponse = {
                              _id : user._id,
                              user_id : user.user_id,
                              username : user.username,
                              displayname : user.displayname,
                              connections : user.connections,
                              socketId : user.socketId,
                              item_id : user.item_id,
                              user_type : user.user_type,
                              first_name : user.first_name,
                              last_name : user.last_name,
                              gender : user.gender,
                              facebook_id : user.facebook_id,
                              linkedin_id : user.linkedin_id,
                              google_id : user.google_id,
                              profile_status : user.profile_status,
                              email : user.email,
                              birthdate : user.birthdate
                            };
    
                            var newBussinesResponse = {
                              page_id : bussines.page_id,
                              owner_id : bussines.owner_id,
                              title : bussines.title,
                              description : bussines.description,
                              custom_url : bussines.custom_url,
                              category_id : bussines.category_id,
                              photo_id : bussines.photo_id,
                              cover : bussines.cover,
                              page_contact_name : bussines.page_contact_name,
                              page_contact_phone : bussines.page_contact_phone,
                              seo_keywords : bussines.seo_keywords,
                              business_location : bussines.business_location,
                              business_city : bussines.business_city,
                              business_state : bussines.business_state,
                              business_zipcode : bussines.business_zipcode,
                              business_country : bussines.business_country,
                              business_latitude : bussines.business_latitude,
                              business_longitude : bussines.business_longitude,
                              _id : bussines._id,
                            };

                            data = { 
                              "access_token" : sign ,
                              "user" : newUserResponse,
                              "bussines" : newBussinesResponse,
                            }; 

                              requestHandler.sendSuccess(res,'User successfully register.',200,(data));
                          }
                        });
                    }
                  });
            }
          }
        }
    } catch (err) {
        errMessage = { "Register": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'User Registration',(errMessage));
      }
};

userRegisterValidation = function (req,type){
    var result = 0;
    if ( req.body.first_name == undefined ||  req.body.first_name.trim().length === 0 )
    {
      result = 1;
    }
    else if ( req.body.last_name == undefined ||  req.body.last_name.trim().length === 0 )
    {
      result = 1;
    }
    else if ( req.body.email == undefined ||  req.body.email.trim().length === 0 )
    {
      result = 1;
    }
    else if ( req.body.password == undefined ||  req.body.password.trim().length === 0 )
    {
      result = 1;
    }
    else if ( (req.body.company_name == undefined ||  req.body.company_name.trim().length === 0) && type == 2 )
    {
      result = 1;
    }
    else if ( (req.body.company_phone == undefined ||  req.body.company_phone.trim().length === 0) && type == 2 )
    {
      result = 1;
    }
    return result;
};

function mailing(user){
  var template = fs.readFileSync(config.general.content_path + '\\HTML_Template\\Welcome.html',{encoding:'utf-8'});
 // var template = fs.readFileSync(config.general.content_path + '//HTML_Template//Welcome.html',{encoding:'utf-8'});
  
  template = template.replace(/(\r\n|\n|\r)/gm, "");
  template = template.replace('@username@',user.user[0].last_name + ' ' + user.user[0].first_name);
 
  Mailer.sendEmail ({from:'b@b.com',to: config.mailer.to_mail , bcc: config.mailer.bcc_mail, subject: 'Welcome again!!!', html: template});
}
