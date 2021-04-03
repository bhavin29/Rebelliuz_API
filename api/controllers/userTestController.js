const _ = require('lodash');
const UserTestUpload = require('../models/userTestUploadModel');
const UserTest = require('../models/userTestModel');
const Test = require('../models/master/testModel');
const config = require('../../config/appconfig');
const fs = require('fs');
const uploadTest = require('../../utils/uploadTest.js');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

var resources = {
    test_title: "$test_title"
};

//upload and save/update user intro
exports.addupload = async (req, res) => {
  try {
    await new uploadTest(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    UserTestUpload.findOne({ user_id: global.decoded._id, test_title : req.body.test_title},(err,userTestUpload)=>{
      if (err) {
        errMessage = '{ "test": { "message" : "User test file is not saved!!"} }';
        requestHandler.sendError(req,res, 422, 'Somthing worng with user introduction',JSON.parse(errMessage));
      }
      if (!userTestUpload) {
          //insert
          var usertestUpload = new UserTestUpload();
         
          usertestUpload.user_id = global.decoded._id;
          usertestUpload.test_title = req.body.test_title;
          usertestUpload.test_filename = global.test_filename;

          usertestUpload.save(function (err) {
            if (err){
              errMessage = '{ "test": { "message" : "User test file is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user test',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User test file save successfully.',200,usertestUpload);
            }
        });
      }
      else if (userTestUpload) {
          //save and check errors
          var oldvFilename = userTestUpload.test_filename;
 
          try {
            fs.unlinkSync(config.general.content_path + "/users/test/" + oldvFilename)
            //file removed
            } catch(err) {
              console.error(err)
          }
          userTestUpload.test_filename = global.test_filename;

          if (req.body.test_title !=undefined)
          userTestUpload.test_title = req.body.test_title;

          userTestUpload.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User test file is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user introduction',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User test file update successfully.',200,userTestUpload);
            }
          });
     }
  });
  
  } catch (err) {
    errMessage = { "Fileupload": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Could not upload the file',(errMessage));
  }
};

exports.index = async function (req, res) {
   
 /*       UserTest.aggregate([
        {
            $lookup:{
            from: 'tests',
            localField: 'test_id',
            foreignField: '_id',
            as: 'userTest'
            }
        }],function(err, data) {*/



          Test.aggregate([  
 //           { "$match": { "user_id": global.decoded._id } },
            { "$addFields": { "_id": { "$toString": "$_id" }}},
            {
               $lookup:{
                from: 'test_questions',
                localField: '_id',
                foreignField: 'test_id',
                as: 'TestQuestionResult'
                }
              }
/*              ,
                { "$unwind": "$TestQuestionResult" },
                {
                    "$lookup": {
                        "from": "test",
                        "localField": "test_id",
                        "foreignField": "_id",
                        "as": "userTestResult"
                    }
            }*/
          ],function(err, data) {
             if (err)
            {
                errMessage = '{ "User Test": { "message" : "User test is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
              callUserTest(req,res,data)
              //  requestHandler.sendSuccess(res,'User test found successfully.',200,data);
            }
        });      
};

callUserTest = function(req,res,userTestResult){
  UserTest.find({ user_id : global.decoded._id },function (err, userTest) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
    } 
    callUserTestAnswer(req,res,userTestResult,userTest);
  });  
}

callUserTestAnswer = function(req,res,userTestResult,userTest){
  var testanswer=[];
  var i=0,j=0,k=0;

  for (var item of userTestResult){
    j=0;
  //  var a = item['TestQuestionResult'];
    for (var a of item['TestQuestionResult']){
      questoin_id = a._id;
 
      testanswer =[];
      testanswer = a; 
      testanswer = JSON.stringify(testanswer);
      testanswer = JSON.parse(testanswer);
      testanswer['answer1'] = false;
      testanswer['answer2'] = false;
      testanswer['answer3'] = false;
      testanswer['answer4'] = false;
 
      K=0;
      for (var userrow of userTest){
 
        if (questoin_id == userrow.test_question_id){
            testanswer['answer1'] = userrow.answer1;
            testanswer['answer2'] = userrow.answer2;
            testanswer['answer3'] = userrow.answer3;
            testanswer['answer4'] = userrow.answer4;
          }
        K=K=1;
    }
    userTestResult[i]['TestQuestionResult'][j] =JSON.parse(JSON.stringify(testanswer));  
    j=j+1;
  }
  i=i+1;
}

var data = { 
      "usertest" :userTestResult
};  

requestHandler.sendSuccess(res,'User test detail.',200,data);
}






//For creating new User Test
exports.add = function (req, res) {
    try
        {
            UserTest.findOne({ user_id: global.decoded._id, test_id : req.body.test_id,test_question_id : req.body.test_question_id },(err,userTest)=>{
        if (err) {
            errMessage = '{ "intro": { "message" : "User reference is not saved!!"} }';
            requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
        }
        if (!userTest) {
            //insert
            
         var usertest = new UserTest();
         usertest.user_id = global.decoded._id;
         usertest.test_id = req.body.test_id;
         usertest.test_question_id = req.body.test_question_id;
         usertest.answer1 = req.body.answer1;
         usertest.answer2 = req.body.answer2;
         usertest.answer3 = req.body.answer3;
         usertest.answer4 = req.body.answer4;
         usertest.isactive = req.body.isactive;
    
        //Save and check error
        usertest.save(function (err) {
            if (err)
            {
                errMessage = '{ "User Test": { "message" : "User test is not save"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'User test save successfully.',200,usertest);
            }
        });
    }
    else if (userTest) {
        
        if(req.body.title != undefined)
            userTest.answer1 = req.body.answer1;

        if(req.body.pros != undefined)
            userTest.answer2 = req.body.answer2;

        if(req.body.cons != undefined)
            userTest.answer3 = req.body.answer3;

        if(req.body.description != undefined)
            userTest.answer4 = req.body.answer4;

        userTest.save(function (err) {
            if (err){
              errMessage = '{ "reference": { "message" : "User test is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user job',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User test updated successfully.',200,userTest);
            }
          });
     }
    });    
    } catch (err) {
        errMessage = { "User Test POST": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

