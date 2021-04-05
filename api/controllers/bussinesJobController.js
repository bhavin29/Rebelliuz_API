/*
as per BussinesJobModel
GET may have musltiple jobs. 


GET:
    api/bussines/{bussines_id}
    api/bussines/{bussines_id}?isactive=0
POST
    api/bussines [ manage insert/update]

*/

const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../utils/uploadBussinesJob.js');
const BussinesJob = require('../models/bussinesJobModel');
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
    if (jobValidation(req))
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

          bussinesjob.country_id=req.body.country_id;
          bussinesjob.location_id=req.body.location_id;
          bussinesjob.job_category_id=req.body.job_category_id;
          bussinesjob.job_classification_id=req.body.job_classification_id;
          bussinesjob.job_experience_id=req.body.job_experience_id;
          bussinesjob.Job_type_ids=req.body.Job_type_ids;
          bussinesjob.job_skill_ids=req.body.job_skill_ids;
          bussinesjob.short_description=req.body.short_description;
          bussinesjob.culture_values_ids=req.body.culture_values_ids;
          bussinesjob.education=req.body.education;
          bussinesjob.certification=req.body.certification;
          bussinesjob.expected_salary_start=req.body.expected_salary_start;
          bussinesjob.expected_salary_end=req.body.expected_salary_end;

          bussinesjob.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "Bussines job is not saved!!"} }';
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'Bussines job save successfully.',200,bussinesjob);
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

           if(req.body.Job_type_ids != undefined) 
            bussinesJob.Job_type_ids=req.body.Job_type_ids;

           if( req.body.job_skills_ids != undefined) 
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
              requestHandler.sendError(req,res, 422, 'Somthing worng with bussines job',JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'Bussines job updated successfully.',200,bussinesJob);
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
    if ( req.body.job_category_id == undefined ||  req.body.job_classification_id == undefined ||  
        req.body.job_experience_id == undefined || req.body.Job_type_ids == undefined ||  req.body.job_skills_ids == undefined ||  
        req.body.short_description == undefined ||  req.body.expected_salary_start == undefined || req.body.expected_salary_end == undefined )
         {
        result = 1;
      }
 };

// View 
const view = function (req, res) {
    try
    {
      var active = 1;  
      if(req.query.isactive != undefined)
            active = req.query.isactive 

    BussinesJob.find({bussines_id : req.params.bussinesid, isactive : active}, function (err, bussinesjob) {
        if (err)
        {
            errMessage = '{ "Bussines Job": { "message" : "Bussines job is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Bussines job found successfully.',200,bussinesjob);
        }
    });
    } catch (err) {
    errMessage = { "Bussines job GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

module.exports = {
  upload,
  view
};
