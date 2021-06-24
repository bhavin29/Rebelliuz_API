var mongoose = require('mongoose');
const config = require('../../config/appconfig');
const BussinesJobUser = require('../models/bussinesJobUserModel');
const BussinesJob = require('../models/bussinesJobModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View 
add = function (req, res) {
try{
    if (req.body.id == undefined || req.body.id =='')
        requestHandler.sendError(req,res, 422, 'Please enter id','');

    if (req.body.status == undefined || req.body.status =='')
        requestHandler.sendError(req,res, 422, 'Please enter status','');

    if (!(req.body.status == 20 || req.body.status == 30 ))
    {
            errMessage = '{ "Search status": { "message" : "Status is out of range"} }';
            return requestHandler.sendError(req,res, 422, 'Please enter correct status.',JSON.parse(errMessage));
    }
    
      var myquery = {_id : req.body.id  };
    
      var newvalues = { $set: {search_status: req.body.status , approval_status : req.body.status } };
    
      BussinesJobUser.updateOne(myquery,newvalues,(err,bussinesJobUser)=>{
        if (err){
          errMessage = '{ "Status update": { "message" :"' + err.message + '"} }';
          requestHandler.sendError(req,res, 422, 'Somthing worng with raitng',(errMessage));
        } else if (bussinesJobUser.nModified == 0)
        {
            requestHandler.sendError(req,res, 422, 'Somthing went worng, no data is updated','');
        }
        else{
        requestHandler.sendSuccess(res,'Status update successfully.',200,bussinesJobUser);
        }
      })
    } catch (err) {
        errMessage = { "Status Update": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Smothing went wrong.',(errMessage));
      }
};

// View 
view = function (req, res) {
    
 let match = { "search_user_id": global.decoded._id }
  
 let lookupvalue_1 = 
             {
               from: "job_categories",
               let: {  user_job_category_id: "$job_category_id"},
               pipeline: [
                   {$project : { job_id :  {"$toObjectId": "$$user_job_category_id"}, jobcategory_name:1 }},
                  { $match:
                     { $expr:
                        { $and:
                           [
                             { $eq: [ "$_id",  "$job_id" ] },
                           ]
                        }
                     }
                  },
               ],
               as: "job_categories"
             };
 
 let lookupvalue_1_unwind = {   $unwind:"$job_categories" };

 let lookupvalue_2 = 
             {
               from: "bussineses",
               let: {  bussines_id: "$bussines_id"},
               pipeline: [
                   {$project : { b_id :  {"$toObjectId": "$$bussines_id"},_id: 1,page_id: 1,owner_id: 1,title: 1,description: 1,photo_id: 1,cover: 1,location: 1}},
                  { $match:  { $expr: { $and: [  { $eq: [ "$_id",  "$b_id" ] }, ] }  }  },
                  {  
                    $lookup:{
                      from: "storage_files",
                      let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                      pipeline: [
                        {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                        {$match: {$expr:
                              { $or : 
                                [
                                  {$eq: ["$file_id", "$$photo_id"]}, //   {$eq: ["$file_id", "$$cover_photo"]},
                                ]
                              }
                        } 
                        }
                      ],
                      as: "bussines_photo"
                    }
                    }
           ],
               as: "bussineses"
             };
 
 //let lookupvalue_1_unwind = {   $unwind:"$bussineses" };

 let aggregate_options = [];

 //PAGINATION
 let page = parseInt(req.query.page) || 1;
 let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;

 //set the options for pagination
 const options = {
     page, limit,
     collation: {locale: 'en'},
     customLabels: {
         totalDocs: 'totalResults',
         docs: 'data'
     }
 };
 
 aggregate_options.push({$match : match});
 aggregate_options.push({$lookup : lookupvalue_1});
 aggregate_options.push(lookupvalue_1_unwind);
 aggregate_options.push({$lookup : lookupvalue_2});
 /*aggregate_options.push(lookupvalue_2_unwind);
 aggregate_options.push({$lookup : lookupvalue_3});
 aggregate_options.push(lookupvalue_3_unwind);
 aggregate_options.push({$lookup : lookupvalue_4});*/
 
try
 {
   const myAggregate = BussinesJob.aggregate(aggregate_options);

   BussinesJobUser.aggregatePaginate(myAggregate,options,function (err, JobCategory) {
         if (err)
         {
             errMessage = '{ "Bussines user job": { "message" : "Bussiens user job result not found!!"} }';
             requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
         }
         else if (JobCategory.totalResults > 0)
         {
           requestHandler.sendSuccess(res,'Bussiens user job result found successfully',200,JobCategory);
         }
         else
         {
             requestHandler.sendSuccess(res,'Bussiens user job no data found',200,JobCategory);
         }
     });
} catch (err) {
    errMessage = { "Search": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Smothing went wrong.',(errMessage));
  }
};
  


module.exports = {
    add,
    view
};
        

    