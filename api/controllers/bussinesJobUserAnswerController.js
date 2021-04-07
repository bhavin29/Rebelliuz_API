/*

GET:
    job_category_id
    search_user_id
    bussines_id
    bussines_user_Id
    response:
        job [
            "jobanswer"[
                {

                }
            ]
            "comments"[
            {

            }
            ]
        ]
GET: 
 /bussiensid/comments 
    job_category_id
    search_user_id

POST:
 /read [ to track overall progress]
 /rating  
 /comments
*/

const config = require('../../config/appconfig');
const fs = require('fs');
const BussinesJob = require('../models/bussinesJobModel');
const BussinesJobUserAnswer = require('../models/bussinesJobUserAnswerModel');
const JobQuestion = require('../models/master/jobQuestionModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View User Intro
view = function (req, res) {
    try{
        callBussinesJob(req,res);
    } catch (err) {
        errMessage = { "View": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'View user job detail',(errMessage));
      }
  };
  
  callBussinesJob = function(req,res){
    BussinesJob.find( { bussines_id: req.params.bussinesid, job_category_id : req.body.job_category_id }, function (err, bussinesJob) {
      if (err){
        errMessage = '{ "intro": { "message" : "No data found."} }';
        requestHandler.sendError(req,res, 422, 'No data for bussines job',JSON.parse(errMessage));
      } 
      else {
        callJobQuestion(req,res,bussinesJob);
      }
    });
  }
  
  callJobQuestion = function(req,res,bussinesJob){
        JobQuestion.find({job_category_id : req.body.job_category_id},function (err, jobQuestion) {
            if (err){
              errMessage = '{ "intro": { "message" : "No data found."} }';
              requestHandler.sendError(req,res, 422, 'No data for job questions',JSON.parse(errMessage));
            } 
            callBussinesJobUserAnswer(req,res,bussinesJob,jobQuestion);
       });  
    }
  
    callBussinesJobUserAnswer = function(req,res,bussinesJob,jobQuestion){
        BussinesJobUserAnswer.find({ user_id : req.body.search_user_id, job_category_id :req.body.job_category_id, 
            bussines_user_id : global.decoded._id },
            function (err, bussinesJobUserAnswer) {
        if (err){
          errMessage = '{ "intro": { "message" : "No data found."} }';
          requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
        } 
        callJobAnswer(req,res,bussinesJob,jobQuestion,bussinesJobUserAnswer);
   });  
  }
  
  callJobAnswer = function(req,res,bussinesJob,jobQuestion,bussinesJobUserAnswer){
      var jobanswer=[];
      var i=0,j=0;
  
      for (var item of bussinesJob){
  
        const job_id = bussinesJob[i].job_category_id;
        j=0;
        jobanswer=[];
        for (var item of jobQuestion){
          if (item.job_category_id == job_id)
          {
            jobanswer[j] = item; 
            jobanswer[j] = JSON.stringify(jobanswer[j]);
            jobanswer[j] = JSON.parse(jobanswer[j]);
            jobanswer[j]['video_filename'] = '';
            
            for (var answer of bussinesJobUserAnswer){
              if (answer.job_category_id == job_id && answer.job_question_id == item._id.toString()){
                console.log(answer.job_question_id);
                console.log(answer.video_filename);
                console.log(answer.video_status);
                jobanswer[j]['video_filename'] = answer.video_filename;
              }
            }
  
          j = j+1;
          }
      }
  
      bussinesJob[i] = JSON.stringify(bussinesJob[i]);
      bussinesJob[i] = JSON.parse(bussinesJob[i]);
      bussinesJob[i]['jobanswer'] = JSON.parse(JSON.stringify(jobanswer));
        
      i=i+1;
    }
    
    var data = { 
          "userjob" :bussinesJob
    };  
  
    requestHandler.sendSuccess(res,'User job detail.',200,data);
  }
  
  module.exports = {
    view
  };
  