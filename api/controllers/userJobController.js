const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../utils/uploadJobCV.js');
const UserJob = require('../models/userJobModel');
const UserJobAnswer = require('../models/userJobAnswerModel');
const JobQuestion = require('../models/master/jobQuestionModel');
const JobCategory = require('../models/master/jobCategoryModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const upload = async (req, res) => {
  try {
    await new uploadFile(req, res);

   /* if (req.file == undefined) {
        errMessage = '{ "intro": { "message" : "Please upload a file!"} }';
        return requestHandler.sendError(req,res, 422, 'Please upload a file!',JSON.parse(errMessage));
    }*/

    // if (jobValidation(req))
    // {
    //     errMessage = '{ "intro": { "message" : "Please enter mandatory field."} }';
    //     return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
    // }

    UserJob.findOne({ user_id: global.decoded._id, job_category_id: req.body.job_category_id},(err,userJob)=>{
      if (err) throw err;
      if (!userJob) {
          //insert
          var userjob = new UserJob();
         
          userjob.user_id = global.decoded._id;
          // userjob.cv_filename = global.cv_filename;

          userjob.job_category_id=req.body.job_category_id;
          userjob.job_classification_id=req.body.job_classification_id;
          userjob.job_experience_id=req.body.job_experience_id;
          userjob.job_type_ids=req.body.job_type_ids;
          userjob.job_skill_ids=req.body.job_skill_ids;
          userjob.short_description=req.body.short_description;
          userjob.expected_salary_start=req.body.expected_salary_start;
          userjob.expected_salary_end=req.body.expected_salary_end;
          userjob.culture_values_id=req.body.culture_values_id;

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

           if(req.body.job_type_ids != undefined) 
            userJob.job_type_ids=req.body.job_type_ids;

           if( req.body.job_skill_ids != undefined) 
            userJob.job_skill_ids=req.body.job_skill_ids;

           if( req.body.short_description != undefined) 
            userJob.short_description=req.body.short_description;

           if( req.body.expected_salary_start != undefined) 
            userJob.expected_salary_start=req.body.expected_salary_start;

           if(req.body.expected_salary_end != undefined)
            userJob.expected_salary_end=req.body.expected_salary_end;

            if(req.body.culture_values_id != undefined)
            userJob.culture_values_id=req.body.culture_values_id;

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
        req.body.job_experience_id == undefined || req.body.job_type_ids == undefined ||  req.body.job_skills_ids == undefined ||  
        req.body.short_description == undefined ||  req.body.expected_salary_start == undefined || req.body.expected_salary_end == undefined )
         {
        result = 1;
      }
 };

// View User Intro
view = function (req, res) {
  try{
    callvUserJob(req,res);
  } catch (err) {
      errMessage = { "View": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'View user job detail',(errMessage));
    }
};

callvUserJob = function(req,res){
 /* UserJob.find( { user_id: global.decoded._id}, function (err, userJob) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
    } 
    else {
      callvJobQuestion(req,res,userJob);
      //callvJobCategory(req,res,userJob);
    }
  });*/


  UserJob.aggregate([
    {
      $match: {user_id: global.decoded._id}
    },
    {
      $lookup:
       {
         from: "job_categories",
         let: { id: "$job_category_id" },
         pipeline: [
           {$project: {_id: 1, jobcategory_name:1, jid: {"$toObjectId": "$$id"} }  },
                  {$match: {$expr:
                       {$and:[ 
                         { $eq: ["$_id", "$jid"]},
                       ]}
                   }
           }
         ],
         as: "job_category"
       }
     },
      {
        $unwind: {
            path: "$job_category",
            preserveNullAndEmptyArrays: true
        }
      },
    ],function(err, data) {
      if (err)
       {
           errMessage = '{ "User job": { "message" : "User job is not found"} }';
           requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
       }
       else
       {
        callvJobQuestion(req,res,data);
       }
    }
  );
}

callvJobQuestion = function(req,res,userJob){
        JobQuestion.find({isactive : 1},function (err, jobQuestion) {
          if (err){
            errMessage = '{ "intro": { "message" : "No data found."} }';
            requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
          } 
          callvUserJobAnswer(req,res,userJob,jobQuestion);
     });  
  }

callvUserJobAnswer = function(req,res,userJob,jobQuestion){
    UserJobAnswer.find({ user_id : global.decoded._id },function (err, userJobAnswer) {
      if (err){
        errMessage = '{ "intro": { "message" : "No data found."} }';
        requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
      } 
      callvJobAnswer(req,res,userJob,jobQuestion,userJobAnswer);
 });  
}

callvJobAnswer = function(req,res,userJob,jobQuestion,userJobAnswer){
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
              console.log(answer.job_question_id);
              console.log(answer.video_filename);
              console.log(answer.video_status);
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
  upload,
  view
};
