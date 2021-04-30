var mongoose = require('mongoose');
const config = require('../../config/appconfig');
const fs = require('fs');
const BussinesJob = require('../models/bussinesJobModel');
const BussinesJobUserAnswer = require('../models/bussinesJobUserAnswerModel');
const BussinesJobUserComments = require('../models/bussinesJobUserCommentsModel');
const BussinesJobUser = require('../models/bussinesJobUserModel');
const UserJobAnswer = require('../models/userJobAnswerModel');
const JobQuestion = require('../models/master/jobQuestionModel');
const User = require('../models/userModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

add = function(req,res){
  try
  {
 
  if (req.body.rating == undefined || !(req.body.rating >0 && req.body.rating <6))
  {
    errMessage = '{ "rating": { "message" : "Rating should between 1 to 5 only." } }';
    requestHandler.sendError(req,res, 422, 'Validation',JSON.parse(errMessage));
    return;
  }

    BussinesJobUserAnswer.findOne({ bussines_id : req.params.bussinesid, job_category_id : req.body.job_category_id,
    search_user_id : req.body.search_user_id, bussines_user_id :global.decoded._id },(err,bussinesJobUserAnswer)=>{
    if (err) throw err;
    if (!bussinesJobUserAnswer) {
        //insert
        var bussinesjobUseranswer = new BussinesJobUserAnswer();
       
        bussinesjobUseranswer.bussines_id = req.params.bussinesid;
        bussinesjobUseranswer.job_category_id = req.body.job_category_id;
      //  bussinesjobUseranswer.bussines_job_id = req.body.bussines_job_id;
        bussinesjobUseranswer.bussines_user_id = global.decoded._id;
        bussinesjobUseranswer.search_user_id = req.body.search_user_id;
        bussinesjobUseranswer.job_question_id = req.body.job_question_id;
        bussinesjobUseranswer.rating = req.body.rating;
 
        bussinesjobUseranswer.save(function (err) {
          if (err){
            errMessage = '{ "rating": { "message" : "' + err.message + '" } }';
            requestHandler.sendError(req,res, 422, 'Somthing worng with user introduction',JSON.parse(errMessage));
          } else {
            call_overall_rating(req,res,bussinesjobUseranswer);
            }
      });
    }
    else if (bussinesJobUserAnswer) {
 
      bussinesJobUserAnswer.rating = req.body.rating;
      bussinesJobUserAnswer.save(function (err) {
          if (err){
            errMessage = '{ "raintg": { "message" :"' + err.message + '"} }';
            requestHandler.sendError(req,res, 422, 'Somthing worng with rating',JSON.parse(errMessage));
          } else {
            call_overall_rating(req,res,bussinesJobUserAnswer);
          }
        });
   }
  });
  } catch (err) {
    errMessage = { "Rating": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Rating detail.',(errMessage));
  }
}

call_overall_rating = function(req,res,bussinesJobUserAnswer){
BussinesJobUserAnswer.aggregate(
    [
      { "$match": {"bussines_id" : req.params.bussinesid ,"job_category_id" : req.body.job_category_id ,
        "search_user_id" : req.body.search_user_id } },
     {
        $group:
          {
            _id : null,
            total: { $sum: "$rating" },
            count: { $sum: 1 }
          }
      }
    ],function(err, data) {
      if (err)
     {
         errMessage = '{ "User Test": { "message" : "User test is not found"} }';
         requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
     }
     else
     {
      call_count_questions(req,res,bussinesJobUserAnswer,data);
      }
    });
}

call_count_questions = function(req,res,bussinesJobUserAnswer,data){
  JobQuestion.aggregate(
      [
        { "$match": {"job_category_id" : req.body.job_category_id }},
       {
          $group:
            {
              _id : null,
              count: { $sum: 1 }
            }
        }
      ],function(err, questions) {
        if (err)
       {
           errMessage = '{ "Job Question": { "message" : "Job Question is not found"} }';
           requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
       }
       else
       {
        call_count_readbyuser(req,res,bussinesJobUserAnswer,data,questions);
        }
      });
  }
  
  call_count_readbyuser = function(req,res,bussinesJobUserAnswer,data,questions){
    BussinesJobUserAnswer.aggregate(
        [
          { "$match": {"bussines_id" : req.params.bussinesid , "bussines_user_id" : global.decoded._id,
           "job_category_id" : req.body.job_category_id , "search_user_id" : req.body.search_user_id }  },
         {
            $group:
              {
                _id : null,
                total: { $sum: "$rating" },
                count: { $sum: 1 }
              }
          }
        ],function(err, readbyuser) {
          if (err)
         {
             errMessage = '{ "User Test": { "message" : "User test is not found"} }';
             requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
         }
         else
         {
           callupdate_overall_rating(req,res,bussinesJobUserAnswer,data,questions,readbyuser);
          }
        });
    }
  
callupdate_overall_rating = function(req,res,bussinesJobUserAnswer,data,questions,readbyuser){
 
  var avg_rating = req.body.rating;
  if (data.length > 0){
    data[0]["total"] = data[0]["total"] +  Number(req.body.rating);
    data[0]["count"] = data[0]["count"] + 1;
    avg_rating =Math.ceil((data[0]["total"] / data[0]["count"])) ;
  }

  var progress = 0;
  if (questions.length > 0 && readbyuser.length > 0){
    progress =Math.floor (( 100 * readbyuser[0]["count"]) / questions[0]["count"]);
  }

  var myquery = {bussines_id : req.params.bussinesid ,job_category_id : req.body.job_category_id ,
    search_user_id : req.body.search_user_id };

  var newvalues = { $set: {overall_rating: avg_rating, overall_progress: progress } };

  BussinesJobUser.updateOne(myquery,newvalues,(err,bussinesJobUser)=>{
    if (err){
      errMessage = '{ "raintg": { "message" :"' + err.message + '"} }';
      requestHandler.sendError(req,res, 422, 'Somthing worng with raitng',JSON.parse(errMessage));
    } else {
    requestHandler.sendSuccess(res,'Rating save successfully.',200,bussinesJobUserAnswer);
    }
  });
}

addcomments = function(req,res){
try
{
  bussinesJobUserComments = new BussinesJobUserComments();
    bussinesJobUserComments.bussines_id=req.params.bussinesid;
    bussinesJobUserComments.bussines_user_id= global.decoded._id;

    bussinesJobUserComments.job_category_id=req.body.job_category_id;
    bussinesJobUserComments.search_user_id=req.body.search_user_id;
    bussinesJobUserComments.comments=req.body.comments;

    bussinesJobUserComments.save(function (err) {
      if (err){
              errMessage = '{ "intro": { "message" : "Comments  is not saved!!"} }';
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
      } else 
      {
              requestHandler.sendSuccess(res,'Comments save successfully.',200,bussinesJobUserComments);
      }
    });
  } catch (err) {
    errMessage = { "View": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Comments detail',(errMessage));
  }
}

viewcomments = function(req,res){

  BussinesJobUserComments.aggregate([
  {
    $match: {bussines_id: req.params.bussinesid, job_category_id : req.query.job_category_id, 
      search_user_id : req.query.search_user_id}  
  },
  { $sort: { created_on: -1 } },
  {
     $lookup:
    {
      from: "users",
      let: { id: "$bussines_user_id" },
      pipeline: [
        {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1 }  },
               {$match: {$expr:
                    {$and:[ 
                      { $eq: ["$_id", "$uid"]},
                    ]}
                }
        }
      ],
      as: "bussinesuser"
    }
  },
  {
    $unwind: {
        path: "$bussinesuser",
        preserveNullAndEmptyArrays: false
    }
  },
 {  $lookup:{
        from: "storage_files",
        let: { photo_id: "$bussinesuser.photo_id" , cover_photo: "$coverphoto" },
        pipeline: [
          {$project: { storage_path :1, _id: 1,file_id:1 , displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
          {$match: {$expr:
                { $or : 
                  [
                    {$eq: ["$file_id", "$$photo_id"]},
                 //   {$eq: ["$file_id", "$$cover_photo"]},
                  ]
                }
          } 
          }
        ],
        as: "bussinesuserphoto"
      }
      },
      ],function(err, data) {
        if (err)
         {
             errMessage = '{ "User Test": { "message" : "User comments is not found"} }';
             requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
         }
         else
         {
          // callUserTest(req,res,data)
             requestHandler.sendSuccess(res,'User comments result found successfully.',200,data);
         }
      }
  );
}

// View Bussiens Job
view = function (req, res) {
    try{
  
      newUser = new User();

      User.aggregate([
        {
          $match: {_id : mongoose.Types.ObjectId(req.query.search_user_id) }  
        },
        {
          $lookup:
           {
             from: "storage_files",
             let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
             pipeline: [
              {$project: { storage_path :1, _id: 1,file_id:1 , displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
              {$match: {$expr:
                    { $or : 
                      [
                        {$eq: ["$file_id", "$$photo_id"]},
                     //   {$eq: ["$file_id", "$$cover_photo"]},
                      ]
                    }
              } 
              }
            ],
         as: "photo"
           }
        }],function(err, data) {
          if (err)
           {
               errMessage = '{ "User": { "message" : "User  is not found"} }';
               requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
           }
           else
           {
              if(data)
              {
                newUser = data;
              }
              else
              {
                newUser = {};
              }
           }
        }
    );

    callBussinesJob(req,res,newUser);
 
  } catch (err) {
        errMessage = { "View": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'View user job detail',(errMessage));
      }
  };
  
  callBussinesJob = function(req,res){
    BussinesJob.find( {  job_category_id : req.query.job_category_id, bussines_id: req.params.bussinesid }, function (err, bussinesJob) {
      if (err){
        errMessage = '{ "intro": { "message" : "No data found."} }';
        requestHandler.sendError(req,res, 422, 'No data for bussines job',JSON.parse(errMessage));
      } 
      else {
        callBussinesJobQuestion(req,res,newUser,bussinesJob);
      }
    });
  }
  
  callBussinesJobQuestion = function(req,res,newUser,bussinesJob){
        JobQuestion.find({job_category_id : req.query.job_category_id},function (err, jobQuestion) {
            if (err){
              errMessage = '{ "intro": { "message" : "No data found."} }';
              requestHandler.sendError(req,res, 422, 'No data for job questions',JSON.parse(errMessage));
            }
            else
            { 
            callBussinesJobUserAnswer(req,res,newUser,bussinesJob,jobQuestion);
            }
       });  
    }
  
    callBussinesJobUserAnswer = function(req,res,newUser,bussinesJob,jobQuestion){
        BussinesJobUserAnswer.find({ search_user_id : req.query.search_user_id, 
          job_category_id :req.query.job_category_id, bussines_user_id : global.decoded._id },
            function (err, bussinesJobUserAnswer) {
        if (err){
          errMessage = '{ "intro": { "message" : "No data found."} }';
          requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
        } 
        callUserJobAnswer(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer);
   });  
  }
  
  callUserJobAnswer = function(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer){
    UserJobAnswer.find({ user_id : req.query.search_user_id, job_category_id :req.query.job_category_id },
        function (err, userJobAnswer) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for user job',JSON.parse(errMessage));
    } 
    Callcomments(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer);
});  
}

Callcomments = function(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer){
  BussinesJobUserComments.find( { bussines_id: req.params.bussinesid, 
    job_category_id : req.query.job_category_id, search_user_id : req.query.search_user_id }, 
    function (err, bussinesJobUserComments) {
    if (err){
      errMessage = '{ "intro": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for comments',JSON.parse(errMessage));
    } 
    else {
      CallBussinesJobUser(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer,bussinesJobUserComments);
    }
  }).sort({created_on : -1});
}

CallBussinesJobUser = function(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer,bussinesJobUserComments){
  BussinesJobUser.find( { bussines_id: req.params.bussinesid, 
    job_category_id : req.query.job_category_id, search_user_id : req.query.search_user_id }, 
    function (err, bussinesJobUser) {
    if (err){
      errMessage = '{ "bussinesJobUser": { "message" : "No data found."} }';
      requestHandler.sendError(req,res, 422, 'No data for comments',JSON.parse(errMessage));
    } 
    else {
      callJobAnswer(req,res,newUser,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer,bussinesJobUserComments,bussinesJobUser);
    }
  }).sort({created_on : -1});
}



callJobAnswer = function(req,res,newUserData,bussinesJob,jobQuestion,bussinesJobUserAnswer,userJobAnswer,bussinesJobUserComments,bussinesJobUser){
  var bJob = {}; 
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
            jobanswer[j]['rating'] = '';
            
            for (var answer of bussinesJobUserAnswer){
              if (answer.job_category_id == job_id && answer.job_question_id == item._id.toString()){
                console.log(answer.job_question_id);
                console.log(answer.video_filename);
                console.log(answer.video_status);
                jobanswer[j]['rating'] = answer.rating;
              }
            }
  
            for (var useranswer of userJobAnswer){
              if (useranswer.job_category_id == job_id && useranswer.job_question_id == item._id.toString()){
                console.log(useranswer.job_question_id);
                console.log(useranswer.video_filename);
                console.log(useranswer.video_status);
                jobanswer[j]['video_filename'] = useranswer.video_filename;
              }
            }

            j = j+1;
          }
      }
      bJob = JSON.stringify(bussinesJob[i]);
      bJob = JSON.parse(bJob);
      
      bJob['overall'] = JSON.parse(JSON.stringify(bussinesJobUser));
      bJob['jobanswer'] = JSON.parse(JSON.stringify(jobanswer));
      bJob['comments'] = JSON.parse(JSON.stringify(bussinesJobUserComments));
      i=i+1;
    }
    
    udata = {};
    if (newUserData){
    udata = JSON.stringify(newUserData[0]);
    udata = JSON.parse(udata);
    }

    var data = { 
          "userjob" :bJob,
          "userdata" : udata
    };  
  
    requestHandler.sendSuccess(res,'User job detail.',200,data);
  }
  
  module.exports = {
    view,
    addcomments,
    viewcomments,
    add
  };
  