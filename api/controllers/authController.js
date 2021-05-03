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
exports.register = (req, res) => {
    try{
        let newUser = new User(req.body);
            newUser.hash_password =   bcrypt.hashSync(req.body.password, 10); // req.body.password;
        newUser.save((err, user) => {
        if (err) {
            errMessage = '{ "register": { "message" : "Smothing went worng."} }';
            requestHandler.sendError(req,res, 422, err.message,JSON.parse(errMessage));
        }
        requestHandler.sendSuccess(res,'User register sucessfully in.',200,(user));
        });
    
    } catch (err) {
        errMessage = { "Register": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'User Registration',(errMessage));
      }
};

function mailing(user){
  var template = fs.readFileSync(config.general.content_path + '\\HTML_Template\\Welcome.html',{encoding:'utf-8'});
  
  template = template.replace(/(\r\n|\n|\r)/gm, "");
  template = template.replace('@username@',user.user[0].last_name + ' ' + user.user[0].first_name);
 
  Mailer.sendEmail ({from:'b@b.com',to: config.mailer.to_mail , bcc: config.mailer.bcc_mail, subject: 'Welcome again!!!', html: template});
}
