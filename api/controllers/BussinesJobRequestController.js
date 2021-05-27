var mongoose = require('mongoose');
const config = require('../../config/appconfig');
const fs = require('fs');
const BussinesJobUser = require('../models/bussinesJobUserModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View 
view = function (req, res) {
    
  //  let match = { "bussines_id": req.params.bussinesid,  "search_status" : {$in : [20,30]}  }
    let match = { "bussines_id": req.params.bussinesid }
  
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
                  from: "users",
                  let: {  search_user_id: "$search_user_id"},
                  pipeline: [
                      {$project : { u_id :  {"$toObjectId": "$$search_user_id"},_id: 1,user_id:1,last_name: 1,first_name: 1,photo_id: 1,cover: 1,location: 1}},
                     { $match:  { $expr: { $and: [  { $eq: [ "$_id",  "$u_id" ] }, ] }  }  },
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
                         as: "user_photo"
                       }
                       },
                       {  
                        $lookup:{
                            from: "user_experiences",
                            let: { user_id: "$user_id" },
                             pipeline: [
                              {$match: {$expr:
                                { $or : 
                                  [
                                    {$eq: ["$owner_id", "$$user_id"]}, ,
                                  ]
                                }
                          } 
                          }
                         ],
                          as: "user_experience"
                        }
                        },
               ],
                  as: "users"
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
    
   try
    {
      const myAggregate = BussinesJobUser.aggregate(aggregate_options);
   
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
    view
};
  