const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../utils/uploadJobCV.js');
const UserJob = require('../models/userJobModel');
const JobQuestion = require('../models/master/jobQuestionModel');
//const UserJob = require('../models/userJobModel');
//const db = require('../models');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const upload = async (req, res) => {
  try {
    await new uploadFile(req, res);

    if (req.file == undefined) {
        errMessage = '{ "intro": { "message" : "Please upload a file!"} }';
        return requestHandler.sendError(req,res, 422, 'Please upload a file!',JSON.parse(errMessage));
    }
    if (jobValidation(req))
    {
        errMessage = '{ "intro": { "message" : "Please enter mandatory field."} }';
        return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
    }

    UserJob.findOne({ user_id: global.decoded._id, job_category_id: req.body.job_category_id},(err,userJob)=>{
      if (err) throw err;
      if (!userJob) {
          //insert
          var userjob = new UserJob();
         
          userjob.user_id = global.decoded._id;
          userjob.cv_filename = global.cv_filename;

          userjob.job_category_id=req.body.job_category_id;
          userjob.job_classification_id=req.body.job_classification_id;
          userjob.job_experience_id=req.body.job_experience_id;
          userjob.Job_type_ids=req.body.Job_type_ids;
          userjob.job_skill_ids=req.body.job_skill_ids;
          userjob.short_description=req.body.short_description;
          userjob.expected_salary_start=req.body.expected_salary_start;
          userjob.expected_salary_end=req.body.expected_salary_end;

          userjob.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User job is not saved!!"} }';
            //  requestHandler.sendError(req,res, 422, 'Somthing worng with user job',JSON.parse(errMessage));
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User job save successfully.',200,userjob);
            }
        });
      }
      else if (userJob) {
          //save and check errors
          var oldvFilename = userJob.cv_filename;

          try {
            fs.unlinkSync(config.general.content_path + "/users/jobcv/" + oldvFilename)
            //file removed
            } catch(err) {
              console.error(err)
          }
        
          userJob.cv_filename = global.cv_filename;

           if( req.body.job_classification_id != undefined) 
             userJob.job_classification_id=req.body.job_classification_id;

           if( req.body.job_experience_id != undefined) 
             userJob.job_experience_id=req.body.job_experience_id;

           if(req.body.Job_type_ids != undefined) 
            userJob.Job_type_ids=req.body.Job_type_ids;

           if( req.body.job_skills_ids != undefined) 
            userJob.job_skill_ids=req.body.job_skill_ids;

           if( req.body.short_description != undefined) 
            userJob.short_description=req.body.short_description;

           if( req.body.expected_salary_start != undefined) 
            userJob.expected_salary_start=req.body.expected_salary_start;

           if(req.body.expected_salary_end != undefined)
            userJob.expected_salary_end=req.body.expected_salary_end;

            if(req.body.isactive != undefined)
            userJob.isactive=req.body.isactive;

            userJob.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User job is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user job',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User job updated successfully.',200,userJob);
            }
          });
     }
  });
  
  } catch (err) {
    errMessage = { "Fileupload": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Could not upload the file',(errMessage));
  }
};

jobValidation = function (req){

    var result = 0;
    if (req.body.job_id == undefined || req.body.job_category_id == undefined ||  req.body.job_classification_id == undefined ||  
        req.body.job_experience_id == undefined || req.body.Job_type_ids == undefined ||  req.body.job_skills_ids == undefined ||  
        req.body.short_description == undefined ||  req.body.expected_salary_start == undefined || req.body.expected_salary_end == undefined )
         {
        result = 1;
      }
 };


// View User Intro
view = function (req, res) {
  try{
   jq = new JobQuestion();
   var uj = new UserJob();
   
   UserJob = callUserJob();
console.log(UserJob);
 
} catch (err) {
  errMessage = { "View": { "message" : err.message } };
  requestHandler.sendError(req,res, 500, 'View user job detail',(errMessage));
}
};

callUserJob = function(){
  UserJob.find( { user_id: global.decoded._id}, function (err, userJob) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
    } 
    else {
      return userJob;
      //callJobQuestion(req,res,userJob);
    }
  });
}


callJobQuestion = function(req,res,userJob){
        JobQuestion.find(function (err, jobQuestion) {
          if (err){
            errMessage = '{ "intro": { "message" : "No data found."} }';
            requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
          } 
          callJobAnswer(req,res,userJob,jobQuestion);
     });  
  }

callJobAnswer = function(req,res,userJob,jobQuestion)
{

  userJob[0] = JSON.stringify(userJob[0]);
  userJob[0] = JSON.parse(userJob[0]);
  userJob[0]['jobanswer'] = JSON.parse(JSON.stringify(jobQuestion));

  userJob[1] = JSON.stringify(userJob[1]);
  userJob[1] = JSON.parse(userJob[1]);
  userJob[1]['jobanswer'] = JSON.parse(JSON.stringify(jobQuestion));

  var data = { 
    "userjob" :userJob
  };  

  //////
  requestHandler.sendSuccess(res,'User job detail.',200,data);

}

/*
view = function (req, res) {

var mongoose = require('mongoose');
var db = mongoose.connection;

var Schema = mongoose.Schema;

//db.on('error', console.error);

db.once('open', function () {

console.log("db connect");

var collectionOne = [];
var collectionTwo = [];

  if(!err) {
      console.log("We are connected");
    }

    db.collection("user_job", function(err, collection) {
      collection.find().sort({order_num: 1}).toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          for (i=0; i<result.length; i++) {
            collectionOne[i] = result[i];
          }
        }
      });

      db.collection("job_question", function(err, collection) {
        collection.find().sort({order_num: 1}).toArray(function(err, result) {
          if (err) {
            throw err;
          } else {
            for (i=0; i<result.length; i++) {
              collectionTwo[i] = result[i];
            }
          }
        });
      });
      
      var data = 
      {
        "c1" : collectionOne,
        "c2" : collectionTwo

      }
      requestHandler.sendSuccess(res,'User job detail.',200,data);
    });


});



}
*/

module.exports = {
  upload,
  view
};
