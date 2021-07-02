const config = require('../../config/appconfig');
const fs = require('fs');

const uploadFileAnswer = require('../../utils/uploadJobAnswer');
const UserJobAnswer = require('../models/userJobAnswerModel');
const UserJob = require('../models/userJobModel');
const JobQuestion = require('../models/master/jobQuestionModel');

const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const auth = require('../../utils/auth');

//upload and save/update user answer
const upload = async (req, res) => {
  try {

    await new uploadFileAnswer(req, res, function (err) {
      if (err) {
      }

      if (req.file == undefined) {
          errMessage = '{ "intro": { "message" : "Please upload a file!"} }';
          return requestHandler.sendError(req,res, 422, 'Please upload a file!',JSON.parse(errMessage));
      }

      const tokenFromHeader = auth.getJwtToken(req);
      const user = jwt.decode(tokenFromHeader);
	  
      UserJobAnswer.findOne({ user_id: user._id, job_category_id: req.body.job_category_id, job_question_id: req.body.job_question_id},(err,userJobAnswer)=>{
        if (err) throw err;
        if (!userJobAnswer) {
            //insert
            var userjobanswer = new UserJobAnswer();
          
            userjobanswer.user_id = user._id;
            userjobanswer.video_filename = req.file.filename;
            userjobanswer.job_category_id=req.body.job_category_id;
            userjobanswer.job_question_id=req.body.job_question_id;
            userjobanswer.video_answer_status = 2;

            userjobanswer.save(function (err) {
              if (err){
                errMessage = '{ "intro": { "message" : "User job answer is not saved!!"} }';
                requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
              } else {
                callAnsUserJob(req,res);
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
          
            userJobAnswer.video_filename = req.file.filename;
            userJobAnswer.video_answer_status = 2;

            userJobAnswer.save(function (err) {
              if (err){
                errMessage = '{ "intro": { "message" : "User job answer is not saved!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing worng with user job answer',JSON.parse(errMessage));
              } else {
                callAnsUserJob(req,res);
              }
            });
      }
    });
  })  
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

 callAnsUserJob = function(req,res){
    UserJob.find( { user_id: global.decoded._id}, function (err, userJob) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
    } 
    else {
      callAnsJobQuestion(req,res,userJob);
    }
  });
}

callAnsJobQuestion = function(req,res,userJob){
        JobQuestion.find({ job_category_id : req.body.job_category_id },function (err, jobQuestion) {
          if (err){
            errMessage = '{ "intro": { "message" : "No data found."} }';
            requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
          } 
          callAnsUserJobAnswer(req,res,userJob,jobQuestion);
     });  
  }

callAnsUserJobAnswer = function(req,res,userJob,jobQuestion){
    UserJobAnswer.find({ user_id : global.decoded._id },function (err, userJobAnswer) {
      if (err){
        errMessage = '{ "intro": { "message" : "No data found."} }';
        requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
      } 
      callAnsJobAnswer(req,res,userJob,jobQuestion,userJobAnswer);
 });  
}

callAnsJobAnswer = function(req,res,userJob,jobQuestion,userJobAnswer){
    var jobanswer=[];
    var i=0,j=0;

    for (var item of userJob){

      const job_id = userJob[i].job_category_id;
      j=0;
      jobanswer=[];
      for (var item of jobQuestion){
        if (item.job_category_id == job_id)
        {
          jobanswer[j] = item; 
          jobanswer[j] = JSON.stringify(jobanswer[j]);
          jobanswer[j] = JSON.parse(jobanswer[j]);
          jobanswer[j]['video_filename'] = '';
          jobanswer[j]['video_answer_status'] = 1;
          
          for (var answer of userJobAnswer){
            if (answer.job_category_id == job_id && answer.job_question_id == item._id.toString()){
              jobanswer[j]['video_filename'] = answer.video_filename;
              jobanswer[j]['video_answer_status'] = answer.video_answer_status;
            }
          }

        j = j+1;
        }
    }

    userJob[i] = JSON.stringify(userJob[i]);
    userJob[i] = JSON.parse(userJob[i]);
    userJob[i]['jobanswer'] = JSON.parse(JSON.stringify(jobanswer));
      
    i=i+1;
  }
  
  var data = { 
        "userjob" :userJob
  };  
  requestHandler.sendSuccess(res,'User job detail.',200,data);
}

module.exports = {
  upload
};
