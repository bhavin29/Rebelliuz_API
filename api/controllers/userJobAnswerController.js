const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFileAnswer = require('../../utils/uploadJobAnswer');
const UserJobAnswer = require('../models/userJobAnswerModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const upload = async (req, res) => {
  try {
    await new uploadFileAnswer(req, res);

    if (req.file == undefined) {
        errMessage = '{ "intro": { "message" : "Please upload a file!"} }';
        return requestHandler.sendError(req,res, 422, 'Please upload a file!',JSON.parse(errMessage));
    }
 /*   if (jobValidation(req))
    {
        errMessage = '{ "intro": { "message" : "Please enter mandatory field."} }';
        return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
    }*/

    UserJobAnswer.findOne({ user_id: global.decoded._id, job_category_id: req.body.job_category_id, job_question_id: req.body.job_question_id},(err,userJobAnswer)=>{
      if (err) throw err;
      if (!userJobAnswer) {
          //insert
          var userjobanswer = new UserJobAnswer();
         
          userjobanswer.user_id = global.decoded._id;
          userjobanswer.video_filename = global.video_filename;
          userjobanswer.job_category_id=req.body.job_category_id;
          userjobanswer.job_question_id=req.body.job_question_id;
          userjobanswer.video_answer_status = 2;

          userjobanswer.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User job answer is not saved!!"} }';
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User job answer save successfully.',200,userjobanswer);
            }
        });
      }
      else if (userJobAnswer) {
          //save and check errors
          var oldvFilename = userJobAnswer.video_filename;

          try {
            fs.unlinkSync(config.general.content_path + "/users/answer/" + oldvFilename)
            //file removed
            } catch(err) {
              console.error(err)
          }
        
          userJobAnswer.video_filename = global.video_filename;
          userJobAnswer.video_answer_status = 2;
          
          userJobAnswer.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User job answer is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user job answer',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User job answer updated successfully.',200,userJobAnswer);
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
    if (req.body.job_question_id == undefined || req.body.job_category_id == undefined ) {
        result = 1;
      }
 };


module.exports = {
  upload
};
