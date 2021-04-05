/*
// search_status: 1: Requested, 2: RequestApproved, 3: RequestRejected, 3: Shortlisted, 4: Offer, 5: Final Interview, 6: TalentPool 
//overall_rating : sum of rating given on each question bu bussines_user_id
//overall_progress: overall view by user on vido
*/
const BussinesJobUser = require('../models/bussinesJobUserModel');
const BussinesJob = require('../models/bussinesJobModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//add/update bussines job for user
const add = async (req, res) => {
try {
  if (jobValidation(req))
  {
      errMessage = '{ "Search status": { "message" : "Please enter mandatory field."} }';
      return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
  }
      
  if (!(req.body.search_status >= 1 & req.body.search_status<= 6))
  {
        errMessage = '{ "Search status": { "message" : "Status is out of range"} }';
        return requestHandler.sendError(req,res, 422, 'Please enter correct status.',JSON.parse(errMessage));
  }

  BussinesJobUser.findOne({ bussines_id: req.params.bussinesid, job_category_id : req.body.job_category_id,search_user_id: req.body.search_user_id},
    (err,bussinesJobUser)=>{
    if (err){
        errMessage = '{ "Search status": { "message" : "Bussines user job is not saved!!"} }';
        requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
    }
    if (!bussinesJobUser) {
        //insert
        var bussinesjobuser = new BussinesJobUser();
        
        bussinesjobuser.bussines_id=req.params.bussinesid;
        bussinesjobuser.bussines_job_id=req.body.bussines_job_id;
        bussinesjobuser.job_category_id=req.body.job_category_id;
        bussinesjobuser.search_user_id = req.body.search_user_id;
        bussinesjobuser.search_status = req.body.search_status;

        bussinesjobuser.save(function (err) {
        if (err){
                errMessage = '{ "intro": { "message" : "Bussines use job  is not saved!!"} }';
                requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
        } else 
        {
                requestHandler.sendSuccess(res,'Bussines use job save successfully.',200,bussinesjobuser);
        }
        });
        }
        else if (bussinesJobUser) {
        
                bussinesJobUser.search_status = req.body.search_status;
        
        bussinesJobUser.save(function (err) {
        if (err){
                errMessage = '{ "Search": { "message" : "Bussines user job is not saved!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing worng with bussines user job',JSON.parse(errMessage));
        } else {
                requestHandler.sendSuccess(res,'Bussines user job updated successfully.',200,bussinesJobUser);
        }
        });
   }
   });
} catch (err) {
  errMessage = { "Search": { "message" : err.message } };
  requestHandler.sendError(req,res, 500, 'Smothing went wrong.',(errMessage));
}
};
      
jobValidation = function (req){
  var result = 0;
  if ( req.body.job_category_id == undefined ||  req.params.bussinesid == undefined ||  req.body.bussines_job_id == undefined
         || req.body.search_user_id == undefined ||  req.body.search_status == undefined )
   {
      result = 1;
    }
    return result;
};
      
// View 
const view = function (req, res) {
try
{
var status = 0;  
if(req.query.status != undefined){
        status = req.query.status; 

        if (!(status >= 1 & status<= 6))
        {
        errMessage = '{ "Search status": { "message" : "Status is out of range."} }';
        return requestHandler.sendError(req,res, 422, 'Please enter correct status.',JSON.parse(errMessage));
        }
}

if (status>0){          
        BussinesJobUser.find({bussines_id : req.params.bussinesid, search_status : status}, function (err, bussinesjob) {
        if (err)
        {
                errMessage = '{ "Bussines user Job": { "message" : "Bussines user job is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
                requestHandler.sendSuccess(res,'Bussines user job found successfully.',200,bussinesjob);
        }
        });
}
else {

//find the all best march with the user_job fr this bussinesid and return the user list        
// culture_values_id: { type: String, required:  true },    
BussinesJob.aggregate([
        { "$match": { "bussines_id": req.params.bussinesid, job_category_id : req.body.job_category_id } },
        {
           $lookup:
              {
                from: "user_jobs",
                let: { user_job_category_id: "$job_category_id", user_job_classification_id : "$job_classification_id", 
                        user_job_experience_id : "$job_experience_id",user_Job_type_ids : "$Job_type_ids",user_job_skill_ids : "$job_skill_ids"},
                pipeline: [
                   { $match:
                      { $expr:
                         { $and:
                            [
                              { $eq: [ "$job_category_id",  "$$user_job_category_id" ] },
                              { $eq: [ "$job_classification_id",  "$$user_job_classification_id" ] },
                             { $eq: [ "$job_experience_id",  "$$user_job_experience_id" ] },
                        /*      { $in: [ "$Job_type_ids",  "$$user_Job_type_ids" ] },
                              { $in: [ "$job_skill_ids",  "$$user_job_skill_ids" ] },*/
                              //     { $gte: [ "$instock", "$$order_qty" ] }
                            ]
                         }
                      }
                   },
                  // { $project: { stock_item: 0, _id: 0 } }
                ],
                as: "data"
              }
                 }],function(err, data) {
                  if (err)
                   {
                       errMessage = '{ "User Test": { "message" : "User test is not found"} }';
                       requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                   }
                   else
                   {
                    // callUserTest(req,res,data)
                       requestHandler.sendSuccess(res,'Bussiens user job result found successfully.',200,data);
                   }
                }
        );
    }
} catch (err) {
        errMessage = { "Bussines job GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};
    
module.exports = {
add,
view
};
    