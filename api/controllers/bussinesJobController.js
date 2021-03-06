var mongoose = require('mongoose');
const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../utils/uploadBussinesJob.js');
const BussinesJob = require('../models/bussinesJobModel');
const RequestHandler = require('../../utils/RequestHandler');
const JobCategory = require('../models/master/jobCategoryModel');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const upload = async (req, res) => {
  try {
    await new uploadFile(req, res);
    const jobCategoryName =await JobCategory.find({_id : mongoose.Types.ObjectId(req.body.job_category_id)}).limit(1);

   /* if (req.file == undefined) {
        errMessage = '{ "intro": { "message" : "Please upload a file!"} }';
        return requestHandler.sendError(req,res, 422, 'Please upload a file!',JSON.parse(errMessage));
    }*/

    if (jobValidationBussinesJob(req))
    {
        errMessage = '{ "intro": { "message" : "Please enter mandatory field."} }';
        return requestHandler.sendError(req,res, 422, 'Please enter mandatory field.',JSON.parse(errMessage));
    }

    BussinesJob.findOne({ bussines_id: req.params.bussinesid, job_category_id : req.body.job_category_id},(err,bussinesJob)=>{
      if (err) throw err;
      if (!bussinesJob) {
          //insert
          var bussinesjob = new BussinesJob();
         
          bussinesjob.user_id = global.decoded._id;
          bussinesjob.bussines_id=req.params.bussinesid;

          bussinesjob.short_description_file = '';
          if (global.short_description_file != undefined)
              bussinesjob.short_description_file = global.short_description_file;

          if (req.body.country_id == undefined)
              bussinesjob.country_id='';
          else
              bussinesjob.country_id=req.body.country_id;

          if (req.body.job_experience_id == undefined)
              bussinesjob.job_experience_id='';
          else
              bussinesjob.job_experience_id=req.body.job_experience_id;

          if (req.body.job_type_ids == undefined)
              bussinesjob.job_type_ids='';
          else
              bussinesjob.job_type_ids=req.body.job_type_ids;

          if (req.body.job_skill_ids == undefined)
              bussinesjob.job_skill_ids='';
          else
              bussinesjob.job_skill_ids=req.body.job_skill_ids;

          if (req.body.education == undefined)
              bussinesjob.education='';
          else
              bussinesjob.education=req.body.education;

          if (req.body.certification == undefined)
              bussinesjob.certification='';
          else
              bussinesjob.certification=req.body.certification;
 
          bussinesjob.location_id=req.body.location_id;
          bussinesjob.job_category_id=req.body.job_category_id;
          bussinesjob.job_classification_id=req.body.job_classification_id;
          bussinesjob.short_description=req.body.short_description;
          bussinesjob.culture_values_ids=req.body.culture_values_ids;
          bussinesjob.expected_salary_start=req.body.expected_salary_start;
          bussinesjob.expected_salary_end=req.body.expected_salary_end;

          bussinesjob.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "Bussines job is not saved!!"} }';
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            } else {

              var result = JSON.stringify(bussinesjob)
              result = JSON.parse(result)
              result['job_category_name'] = jobCategoryName[0].jobcategory_name
              
              requestHandler.sendSuccess(res,'Bussines job save successfully.',200,result);
            }
        });
      }
      else if (bussinesJob) {
          //save and check errors
          var oldFilename = bussinesJob.short_description_file;

          try {
            fs.unlinkSync(config.general.content_path + "/bussines/job/" + oldFilename)
            //file removed
            } catch(err) {
              console.error(err)
          }
        
          if( req.body.country_id != undefined) 
             bussinesJob.country_id=req.body.country_id;

          if( req.body.location_id != undefined) 
             bussinesJob.location_id=req.body.location_id;

           if( req.body.job_classification_id != undefined) 
             bussinesJob.job_classification_id=req.body.job_classification_id;

           if( req.body.job_experience_id != undefined) 
             bussinesJob.job_experience_id=req.body.job_experience_id;

           if(req.body.job_type_ids != undefined) 
            bussinesJob.job_type_ids=req.body.job_type_ids;

           if( req.body.job_skill_ids != undefined) 
            bussinesJob.job_skill_ids=req.body.job_skill_ids;

            if( req.body.culture_values_ids != undefined) 
            bussinesJob.culture_values_ids=req.body.culture_values_ids;

            if( req.body.short_description != undefined) 
            bussinesJob.short_description=req.body.short_description;

            if( req.body.file != undefined) 
            bussinesJob.short_description_file=global.short_description_file;

            if( req.body.expected_salary_start != undefined) 
            bussinesJob.expected_salary_start=req.body.expected_salary_start;

           if(req.body.expected_salary_end != undefined)
            bussinesJob.expected_salary_end=req.body.expected_salary_end;

            if(req.body.culture_values_id != undefined)
            bussinesJob.culture_values_id=req.body.culture_values_id;

            if(req.body.education != undefined)
            bussinesJob.education=req.body.education;

            if(req.body.certification != undefined)
            bussinesJob.certification=req.body.certification;

            if(req.body.isactive != undefined)
            bussinesJob.isactive=req.body.isactive;

            bussinesJob.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "Bussines job is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with bussines job: ' + err.message,JSON.parse(errMessage));
            } else {


              var result = JSON.stringify(bussinesJob)
              result = JSON.parse(result)
              result['job_category_name'] = jobCategoryName[0].jobcategory_name

              requestHandler.sendSuccess(res,'Bussines job updated successfully.',200,result);
            }
          });
     }
  });
  
  } catch (err) {
    errMessage = { "Fileupload": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Could not upload the file',(errMessage));
  }
};

jobValidationBussinesJob = function (req){

    var result = 0;
    if ( req.body.job_category_id == undefined ||  req.body.job_classification_id == undefined ||  
       // req.body.job_experience_id == undefined || req.body.job_type_ids == undefined ||  
      //  req.body.job_skills_ids == undefined ||  
        req.body.short_description == undefined ||  
        req.body.expected_salary_start == undefined || req.body.expected_salary_end == undefined )
         {
        result = 1;
      }
 };

// Update jobClassification
const update = function (req, res) {
  try
  {
    BussinesJob.findById({  bussines_id : req.params.bussinesid , _id : mongoose.Types.ObjectId(req.query.id), 
      isactive: req.query.isactive }, function (err, bussinesJob) {
        
        bussinesJob.isactive = req.query.isactive;
      //Save and check error
      bussinesJob.save(function (err) {
      if (err)
      {
          errMessage = '{ "Bussines job ": { "message" : "Bussines job is not updated"} }';
          requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
      }
      else
      {
          requestHandler.sendSuccess(res,'Bussines job updated successfully.',200,bussinesJob);
      }
      });
  });
  }
  catch (err) {
  errMessage = { "Job Classification Update": { "message" : err.message } };
  requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
  }
}

const view = function (req, res) {
  try
  {
    var active = true;  
    if(req.query.isactive != undefined)
          active = req.query.isactive 

          BussinesJob.aggregate([
            {
              $match: {bussines_id : req.params.bussinesid} 
            },  
            {
              $lookup:
               {
                 from: "job_categories",
                 let: { jcid: "$job_category_id" },
                 pipeline: [
                  {$project: { jobid: {"$toObjectId": "$$jcid"} , jobcategory_name : 1  }  },
                  {$match: {$expr:
                        { $or : 
                          [
                            {$eq: ["$_id", "$jobid"]},
                          ]
                        }
                  } 
                  }
                ],
             as: "job_categories"
               }
            },
            {
              $unwind: {
                  path: "$job_categories",
                  preserveNullAndEmptyArrays: false
              }
            },
             {
              $lookup:
               {
                 from: "job_types",
                 let: { jtid:{$ifNull: [{ "$split": [ "$job_type_ids", "," ] },[] ]},  },

                 pipeline: [
                  {$project: {  jobtype_name : 1 }  },
                  {$match: {$expr: {$in: [  { "$toString": "$_id" }, "$$jtid"]}}  }
                ],
             as: "job_type"
               }
            },
            {
              $unwind: {
                  path: "$job_categories",
                  preserveNullAndEmptyArrays: false
              }
            },
             {
              $lookup:
               {
                 from: "job_skills",
                 let: { jtid:{$ifNull: [{ "$split": [ "$job_skill_ids", "," ] },[] ]},  },

                 pipeline: [
                  {$project: {  jobskill_name : 1 }  },
                  {$match: {$expr: {$in: [  { "$toString": "$_id" }, "$$jtid"]}}  }
                ],
             as: "job_skills"
               }
            }
          ],function(err, data) {
              if (err)
               {
                   errMessage = '{ "User": { "message" : "Bussines job is not found"} }';
                   requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
               }
               else
               {
                requestHandler.sendSuccess(res,'Bussines job found successfully.',200,data);
              }
            }
  )} catch (err) {
  errMessage = { "Bussines job GET": { "message" : err.message } };
  requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
  }
};


module.exports = {
  upload,
  view,
  update
};
