const config = require('../../config/appconfig');
const fs = require('fs');
const User = require('../models/userModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View User Email
exports.view = function (req, res) {
    try
    {
        User.findOne({ email: req.params.emailId }, function (err, User) {
        if (err)
        {
            errMessage = '{ "User Email": { "message" : "User email is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else if (User)
        {
            requestHandler.sendSuccess(res,'User email found successfully.',200,User);
        }
        else
        {
            errMessage = '{ "User Email": { "message" : "User email is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
        }
    });
    } catch (err) {
    errMessage = { "User Email GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};