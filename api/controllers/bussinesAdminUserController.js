const config = require('../../config/appconfig');
const fs = require('fs');
const BussinesAdminUser = require('../models/bussinesAdminUserModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

view = function(req,res){
    
    BussinesAdminUser.aggregate([
    {
      $match: {bussines_id: req.params.bussinesid}  
    },
    {
       $lookup:
      {
        from: "users",
        let: { id: "$bussines_user_id" },
        pipeline: [
          {$project: {_id: 1,isactive:1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1 }  },
                 {$match: {$expr:
                      {$and:[ 
                        { $eq: ["$_id", "$uid"]},
                      ]}
                  }
          }
        ],
        as: "bussinesuser"
      }
    },
    {
      $unwind: {
          path: "$bussinesuser",
          preserveNullAndEmptyArrays: false
      }
    },
    {  $lookup:{
          from: "storage_files",
          let: { photo_id: "$bussinesuser.photo_id" , cover_photo: "$coverphoto" },
          pipeline: [
            {$project: { storage_path :1, _id: 1,file_id:1 , displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
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
          as: "bussinesuserphoto"
        }
        },
        ],function(err, data) {
          if (err)
           {
               errMessage = '{ "Admin user ": { "message" : "User is not found"} }';
               requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
           }
           else
           {
               requestHandler.sendSuccess(res,'Admin user found successfully.',200,data);
           }
        }
    );
  }

//add/update Bussines Admin User
const add = async (req, res) => {
    try {
      if (jobValidationAdminuser(req))
      {
          errMessage = '{ "Bussines Admin User": { "message" : "Please enter mandatory field."} }';
          return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
      }
    
      BussinesAdminUser.findOne({ bussines_id: req.params.bussinesid, 
            bussines_user_id : req.body.bussines_user_id},
        (err,bussinesAdminUser)=>{
        if (err){
            errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is not saved!!"} }';
            requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
        }
        if (!bussinesAdminUser) {
            //insert
            var bussinesadminUser = new BussinesAdminUser();
            
            bussinesadminUser.bussines_id=req.params.bussinesid;
            bussinesadminUser.bussines_user_id=req.body.bussines_user_id;
            bussinesadminUser.role=req.body.role;
            bussinesadminUser.isactive = 1;

            bussinesadminUser.save(function (err) {
              if (err){
                      errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is not saved!!"} }';
                      requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
              } else 
              {
                      requestHandler.sendSuccess(res,'Bussines admin user save successfully.',200,bussinesAdminUser);
              }
              });
            }
            else if (bussinesAdminUser) {
            
                if(req.body.isactive == undefined || !(req.body.isactive == 0 || req.body.isactive ==1))
                {
                    errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is already exists!!"} }';
                    requestHandler.sendError(req,res, 422, 'bussines admin user already exists.',JSON.parse(errMessage));
                }
                else{
                    bussinesAdminUser.isactive = req.body.isactive;
                    bussinesAdminUser.save(function (err) {
                        if (err){
                                errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is not saved!!"} }';
                                requestHandler.sendError(req,res, 422, 'Somthing worng with bussines admin user',JSON.parse(errMessage));
                        } else {
                                requestHandler.sendSuccess(res,'Bussines admin user updated successfully.',200,bussinesAdminUser);
                        }
                    });
                  }
       }
       });
    } catch (err) {
      errMessage = { "Search": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Smothing went wrong.',(errMessage));
    }
    };

    jobValidationAdminuser = function (req){
        var result = 0;
        if ( req.body.bussines_user_id == undefined &&  req.body.role == undefined )
         {
            result = 1;
          }
          return result;
      };

module.exports = {
        view,
        add
      };
      