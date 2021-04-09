const config = require('../../config/appconfig');
const fs = require('fs');
const BussinesAdminUser = require('../models/bussinesAdminUserModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


// View Bussines Admin User
const view = function (req, res) {
    try
    {
        BussinesAdminUser.find({ bussines_id: req.params.bussinesid }, function (err, BussinesAdminUser) {
        if (err)
        {
            errMessage = '{ "Bussines Admin User": { "message" : "' + err.message +' "} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Bussines admin user found successfully.',200,BussinesAdminUser);
        }
    });
    } catch (err) {
    errMessage = { "Bussines Admin User GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//add/update Bussines Admin User
const add = async (req, res) => {
    try {
      if (jobValidation(req))
      {
          errMessage = '{ "Bussines Admin User": { "message" : "Please enter mandatory field."} }';
          return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
      }
    
      BussinesAdminUser.findOne({ bussines_id: req.params.bussinesid, bussines_user_id : req.body.bussines_user_id,role: req.body.role},
        (err,bussinesAdminUser)=>{
        if (err){
            errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is not saved!!"} }';
            requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
        }
        if (!bussinesAdminUser) {
            //insert
            var bussinesAdminUser = new BussinesAdminUser();
            
            bussinesAdminUser.bussines_id=req.params.bussinesid;
            bussinesAdminUser.bussines_user_id=req.body.bussines_user_id;
            bussinesAdminUser.role=req.body.role;
            
    
            bussinesAdminUser.save(function (err) {
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
            
                if(req.query.isactive == undefined)
                {
                    errMessage = '{ "Bussines Admin User": { "message" : "Bussines admin user is already exists!!"} }';
                    requestHandler.sendError(req,res, 422, 'bussines admin user already exists.',JSON.parse(errMessage));
                }
                else{
                    bussinesAdminUser.isactive = req.query.isactive;
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

    jobValidation = function (req){
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
      