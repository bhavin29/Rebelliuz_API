jwt = require('jsonwebtoken'),
bcrypt = require('bcryptjs');
const config = require('../../config/appconfig');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
var mongoose = require('mongoose');

const User = require("../models/userModel");
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
                 {   
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                    },
                  {  $lookup:{
                      from: "bussineses",
                      let: { user_id: "$user_id"  },
                      pipeline: [
                        {$project: {  _id: 1 ,owner_id:1 ,title:1,description:1, location:1,page_id:1,photo_id:1,cover:1 } },
                        {$match: {$expr:
                              { $and : 
                                [
                                  { $eq: ["$owner_id", "$$user_id"]},
                                ]
                              }
                        } 
                        }
                      ],
                      as: "bussines"
                    }
                    },
                    {  $unwind: {
                        path: "$bussines",
                        preserveNullAndEmptyArrays: true
                    }
                     },
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
                       if (data.length > 0 )
                        sign =  jwt.sign({ email: data[0].email, displayname : data[0].displayname, _id: data[0]._id }, accessTokenSecret);
  
                        data = { 
                            "access_token" : sign ,
                            "refresh_token" : "",
                            "expire_time" : "2d",
                            "user" : data,
                        }; 

                        requestHandler.sendSuccess(res,'User result found successfully.',200,data);

                    }
                }
            );
            }    
    } catch (err) {
        errMessage = { "SignIn": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'User Signin',(errMessage));
      }
};
        
// User Sign function
    exports.signIn123 = (req, res) => {
try{

    var a = RegExp("\b" + req.query.username + "\b" , "i") ;
    User.findOne({
         username: new RegExp(req.query.username , "i") 
       }, (err, user) => {
        if (err) throw err;
            if (!user) {
                errMessage = '{ "password": { "message" : "The username is not valid."} }';
                requestHandler.sendError(req,res, 422, 'Authentication failed. username not found.',JSON.parse(errMessage));
            }
            else if (user) {
              /*  if (!user.comparePassword(req.body.password)) {  
                    errMessage = '{ "password": { "message" : "The password is not valid."} }';
                    requestHandler.sendError(req,res, 422, 'Authentication failed. Wrong password.',JSON.parse(errMessage));
                } else {*/
           // }
           GetUserPhoto(req,res,user);
       }
    });
  } catch (err) {
    errMessage = { "SignIn": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'User Signin',(errMessage));
  }
};


GetUserPhoto  = function(req,res,user){
   
    StorageFile.findOne({file_id: (parseInt(user.photo_id)) },
      (err, storagefile) => {
       if (err) throw err;
       GetUserIntro(req,res,user,storagefile);
      });
}    

GetUserIntro = function(req,res,user,storagefile){
    var sign =  jwt.sign({ email: user.email, displayname : user.displayname, _id: user._id }, accessTokenSecret);

    UserIntro.findOne({ email: user.email},(err, userintro)=>{
        if (err){
            data = { 
                "access_token" : sign ,
                "refresh_token" : "",
                "expire_time" : "2d",
                "user" : user,
                "bussines_id":[]
            }; 
            requestHandler.sendSuccess(res,'User successfully logged in.',200,(data));
        }
        else
        {
            if(userintro)
            {
                newuserintro = userintro;
            }
            else
            {
                newuserintro = {};
            }

            user = JSON.stringify(user);
            user = JSON.parse(user);
            user['userphoto'] = JSON.parse(JSON.stringify(storagefile));
            user['userintro'] = JSON.parse(JSON.stringify(newuserintro));
            
            GetBusiness(req,res,sign,user);
        }
    });
}

GetBusiness =function(req,res,sign,user){
try
{
    BusinessUser.find( { owner_id: user.user_id}, 
        function (err, businessUser) {
            var data ;
        if (err){
            data = { 
                "access_token" : sign ,
                "refresh_token" : "",
                "expire_time" : "2d",
                "user" : user,
                "bussines":[]
            }; 
        } 
        else {
            data = { 
                "access_token" : sign ,
                "refresh_token" : "",
                "expire_time" : "2d",
                "user" : user,
                "bussines":businessUser
            }; 
        }
        requestHandler.sendSuccess(res,'User successfully logged in.',200,(data));
      });
} catch (err) {
    errMessage = { "SignIn": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'User Signin',(errMessage));
  }
}

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
    