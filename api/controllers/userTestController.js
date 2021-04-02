const _ = require('lodash');
const UserTest = require('../models/userTestModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

var resources = {
    test_title: "$test_title"
};

exports.index = async function (req, res) {
   
        UserTest.aggregate([
        {
            $lookup:{
            from: 'tests',
            localField: 'test_id',
            foreignField: '_id',
            as: 'userTest'
            }
        }],function(err, data) {
            if (err)
            {
                errMessage = '{ "User Test": { "message" : "User test is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'User test found successfully.',200,data);
            }
        });      
};

//For creating new User Test
exports.add = function (req, res) {
    try
        {
         var userTest = new UserTest();
         userTest.user_id = global.decoded._id;
         userTest.test_id = req.body.test_id;
         userTest.test_question_id = req.body.test_question_id;
         userTest.answer1 = req.body.answer1;
         userTest.answer2 = req.body.answer2;
         userTest.answer3 = req.body.answer3;
         userTest.answer4 = req.body.answer4;
         userTest.isactive = req.body.isactive;
    
        //Save and check error
        userTest.save(function (err) {
            if (err)
            {
                errMessage = '{ "User Test": { "message" : "User test is not save"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'User test save successfully.',200,userTest);
            }
        });
        } catch (err) {
        errMessage = { "User Test GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

