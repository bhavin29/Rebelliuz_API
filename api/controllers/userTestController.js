var mongoose = require('mongoose');
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

exports.indexupload = async function (req, res) {
  let aggregate_options = [];

  //PAGINATION
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;

  //set the options for pagination
  const options = {
      page, limit,
      collation: {locale: 'en'},
      customLabels: {
          totalDocs: 'testupload',
          docs: 'user_test_uploads'
      }
  };
  
  //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
  let match = {};

  //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
  if (req.query.searchText)
  {
      match.test_title = {$regex: req.query.searchText, $options: 'i'};
  } 

  aggregate_options.push({$match: match});
  
  //SORTING -- THIRD STAGE
  let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
  aggregate_options.push({$sort: {"test_title": sortOrder}});

  // Set up the aggregation
  const myAggregate = UserTestUpload.aggregate(aggregate_options);

  try
  {
    UserTestUpload.aggregatePaginate(myAggregate,options,function (err, Country) {
          if (err)
          {
              errMessage = '{ "Test upload": { "message" : "Test upload is not getting data!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
          }
          else
          {
              requestHandler.sendSuccess(res,'Test data successfully.',200,Country);
          }
      });
  }   
      catch (err) {
      errMessage = { "CouTest upload GET": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
  }
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
              requestHandler.sendError(req,res, 422, 'Somthing worng with user test:' + err.message,JSON.parse(errMessage));
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
      testanswer['answer'] = '';
      testanswer['start_range'] = 0;
      testanswer['end_range'] = 0;
 
      K=0;
      for (var userrow of userTest){
 
        if (questoin_id == userrow.test_question_id){
            testanswer['answer'] = userrow.answer;

            if (userrow.answer == 1)
            {
              testanswer['start_range'] = 0;
              testanswer['end_range'] = 25;
            }
            else if (userrow.answer == 2)
            {
              testanswer['start_range'] = 26;
              testanswer['end_range'] = 50;
            }
            else if (userrow.answer == 3)
            {
              testanswer['start_range'] = 51;
              testanswer['end_range'] = 75;
            }
            else if (userrow.answer == 4)
            {
              testanswer['start_range'] = 76;
              testanswer['end_range'] = 10;
            }
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
            errMessage = '{ "Test": { "message" : "User reference is not saved!!"} }';
            requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
        }
        if (!userTest) {
            //insert
            
         var usertest = new UserTest();
         usertest.user_id = global.decoded._id;
         usertest.test_id = req.body.test_id;
         usertest.test_question_id = req.body.test_question_id;
         usertest.answer = req.body.answer ;
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
            userTest.title = req.body.title;

        if(req.body.pros != undefined)
            userTest.pros = req.body.pros;

        if(req.body.cons != undefined)
            userTest.cons = req.body.cons;

        if(req.body.description != undefined)
            userTest.description = req.body.description;

        if(req.body.answer != undefined)
            userTest.answer = req.body.answer;
    
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

exports.deleteupload = function (req, res) {
  try
    {

      UserTestUpload.deleteOne({ _id : mongoose.Types.ObjectId(req.params.id) },function (err, userTestUpload) {
        if (err)
        {
            errMessage = '{ "User test ": { "message" : "User test is not delete data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
         /* try {
            fs.unlinkSync(config.general.content_path + "/test/" + userTestUpload.test_filename)
            //file removed
            } catch(err) {
              console.error(err)
          }*/
          if (userTestUpload.deletedCount == 1){
            requestHandler.sendSuccess(res,'User test deleted successfully.',200,userTestUpload);
          }
          else
          {
            errMessage = '{ "User test ": { "message" : "User test is not found!!"} }';
            requestHandler.sendError(req,res, 422, 'No data found',JSON.parse(errMessage));
          }
        }
    });
    }   
    catch (err) {
        errMessage = { "User Test Upload DELETE": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };
