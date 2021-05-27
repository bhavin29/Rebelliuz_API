var fs = require('fs');
const Mailer = require('../../utils/Mailer');
var mongoose = require('mongoose');
const config = require('../../config/appconfig');
const BussinesJobUser = require('../models/bussinesJobUserModel');
const BussinesJob = require('../models/bussinesJobModel');
const Users = require('../models/userModel');
const Bussines = require('../models/bussinesModel');
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
      
  if (!(req.body.search_status == 0 || req.body.search_status == 10 || req.body.search_status == 20 ||
        req.body.search_status == 30 || req.body.search_status == 40 ||
        req.body.search_status == 50 || req.body.search_status == 60 ||
        req.body.search_status == 70  ))
  {
        errMessage = '{ "Search status": { "message" : "Status is out of range"} }';
        return requestHandler.sendError(req,res, 422, 'Please enter correct status.',JSON.parse(errMessage));
  }

  BussinesJobUser.findOne({ bussines_id: req.params.bussinesid, 
    job_category_id : req.body.job_category_id,search_user_id: req.body.search_user_id},
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
          if (req.body.search_status == 10)
              mailing(req.body.search_user_id,req.params.bussinesid);

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
            if (req.body.search_status == 10)
                mailing(req.body.search_user_id,req.params.bussinesid);

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
  if ( req.body.job_category_id == undefined ||  req.params.bussinesid == undefined ||  
         req.body.search_user_id == undefined ||  req.body.search_status == undefined )
   {
      result = 1;
    }
    return result;
};
      
// View 
const view = function (req, res) {
try
{
  let status = 0;  
  if(req.query.status != undefined)
        status = req.query.status; 

  if (!(status == 0 ||status == 10 || status == 20 || status == 30 || status == 40 ||
          status == 50 || status == 60 || status == 70  ))
    {
        errMessage = '{ "Search status": { "message" : "Status is out of range."} }';
        return requestHandler.sendError(req,res, 422, 'Please enter correct status.',JSON.parse(errMessage));
    }

    BussinesJobUser.aggregate( [
      {
        $match: { bussines_id:req.params.bussinesid, 
          job_category_id : req.query.job_category_id }
      },
      {
        $group: {
           _id: "$search_status",
           count: { $sum: 1 }
        }
      },
    ],function(err, jobCount) {
      if (err)
     {
         errMessage = '{ "User Test": { "message" : "User test is not found"} }';
         requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
     }
     else
     {
      callSearch(req,res,status,jobCount);
    }
    });


  } catch (err) {
        errMessage = { "Bussines job GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};

//common search
function callSearch(req,res,status,jobCount) {
  if (status>0){    
    callSearchbyStatusData(req,res,status,jobCount)      
  }
  else {
    var bJobUser = [];
    //       $or: [ { search_status: { $gt: 31 } }, { search_status: 0 } ] },

    BussinesJobUser.find( { bussines_id:req.params.bussinesid, 
      job_category_id : req.query.job_category_id,  search_status:  { $gt: 31 } }
    , {search_user_id : 1 , _id:0}, 
    function (err, businessJobUser) {
      if (err) {}
      else
      {
        json_data = JSON.parse(JSON.stringify(businessJobUser));
        bJobUser = json_data.map(x=>x.search_user_id)

        callSearchData(req,res,bJobUser,jobCount);
      }
    });
  }
}

//Serch user for status 
callSearchbyStatusData = function(req,res,status,jobCount){
let search_status = parseInt(status); 
let match =
     { "bussines_id": req.params.bussinesid, job_category_id : req.query.job_category_id } ;

const lookupvalue_1 = 
{
  from: "bussines_job_users",
  let: {  job_category_id: "$job_category_id", s : parseInt(status)},
  pipeline: [
     { $match:
        { $expr:
           { $and:
              [
                { $eq: [ "$job_category_id",  "$$job_category_id" ] },
                { $eq: [ "$search_status",  search_status ] },
                { $eq: [ "$bussines_id",  req.params.bussinesid ] },
              ]
           }
        }
     },
     {$project:{user_id:"$search_user_id","_id": 1, "search_status": 1, "overall_rating":1, "overall_progress":1, 
     "created_by":1, "created_on": 1, "bussines_id": 1, "job_category_id":1, "__v": 1}},
  ],
  as: "user_job"
};

let lookupvalue_1_unwind = {   $unwind:"$user_job" };
               
let lookupvalue_2 =
{
  from: "users",
  let: { id: "$user_job.user_id" },
  pipeline: [
           {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1, first_name:1,last_name:1, gender:1,user_id:1 , location:1}  },
           {$match: {$expr:  {$and:[ { $eq: ["$_id", "$uid"]}, ]}} },
  ],
  as: "userdata"
};
let lookupvalue_2_1unwind = {   $unwind:"$user_job" };

let lookupvalue_2_1 = 
            {
              from: "user_jobs",
              let: { b_user_id : "$user_id", culture_values_ids:{$ifNull: [{ "$split": [ "$culture_values_ids", "," ] },[] ]},},
              pipeline: [
             
                {$match: {$expr: {$and:[  { $eq: ["$user_id", "$$b_user_id"]}, ]} } },
                  {
                    "$group": {
                       _id: null,
                       count: { $sum: 1 }
                    }},
                    {"$project" : { "Values" : { "$multiply" : ["$count", 25]}}},
                  ],
              as: "culture_values"
            };


let lookupvalue_2_unwind = {   $unwind:"$userdata" };

let lookupvalue_3 =
  {
    from: "storage_files",
    let: { photo_id: "$userdata.photo_id" , cover_photo: "$coverphoto" },
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
    as: "userphoto"
  };


  let lookupvalue_2_1_unwind = {
    $unwind: {
        path: "$userphoto",
        preserveNullAndEmptyArrays: true
    }
  };

  let lookupvalue_3_1 =
  {
        from: "bussines_job_users",
        let: { id: "$userdata.uid" },
        pipeline: [
          {$project: {_id: 1, search_user_id:1 ,search_status:1,bussines_id:1,job_category_id:1 }  },
                {$match: {$expr:
                      {$and:[ 
                        { $eq:  ["$search_user_id", {"$toString" : "$$id" } ]},
                        { $eq : [ "$bussines_id", req.params.bussinesid ]},
                        { $eq : [ "$job_category_id" , req.query.job_category_id]}
                      ]}
                  }
          }
        ],
        as: "search_status"
     };
 



let lookupvalue_3_unwind = {   $unwind:"$userphoto" };

let lookupvalue_4 =
{
      from: "user_experiences",
      let: { id: "$userdata.user_id" },
      pipeline: [
        {$project: {_id: 1, owner_id:1, title:1, location:1, company:1,fromyear:1, frommonth:1, toyear:1, tomonth:1  }  },
              {$match: {$expr:
                    {$or:[ 
                      { $eq: ["$owner_id", "$$id"]},
                    ]}
                }
        }
      ],
      as: "experince"
   };

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
    aggregate_options.push(lookupvalue_2_1unwind);
    aggregate_options.push({$lookup : lookupvalue_2_1});
    aggregate_options.push(lookupvalue_2_unwind);
    aggregate_options.push({$lookup : lookupvalue_3});

    aggregate_options.push(lookupvalue_2_1_unwind);
    aggregate_options.push({$lookup : lookupvalue_3_1});

    aggregate_options.push(lookupvalue_3_unwind);
    aggregate_options.push({$lookup : lookupvalue_4});
    
  try
    {
      const myAggregate = BussinesJob.aggregate(aggregate_options);
      var bJob = {}; 

      BussinesJob.aggregatePaginate(myAggregate,options,function (err, JobCategory) {
            if (err)
            {
                errMessage = '{ "Bussines user job": { "message" : "Bussiens user job result not found!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else if (JobCategory.totalResults > 0)
            {
              bJob = JSON.stringify(JobCategory);
              bJob = JSON.parse(bJob);
              
              bJob['jobCounts'] = JSON.parse(JSON.stringify(jobCount));
          
              requestHandler.sendSuccess(res,'Bussiens user job result found successfully',200,bJob);
            }
            else
            {
              bJob = JSON.stringify(JobCategory);
              bJob = JSON.parse(bJob);
              
              bJob['jobCounts'] = JSON.parse(JSON.stringify(jobCount));
              requestHandler.sendSuccess(res,'Bussiens user job no data found',200,bJob);
            }
        });
    }   
    catch (err) {
        errMessage = { "Bussines user job GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//saerch if status = 0
callSearchData = function(req,res,bJobUser,jobCount){
  let match = { "bussines_id": req.params.bussinesid, job_category_id : req.query.job_category_id }
  
  let lookupvalue_1 = 
              {
                from: "user_jobs",
                let: { bj_user_id : "user_id", user_job_category_id: "$job_category_id", user_job_classification_id : "$job_classification_id", 
                        user_job_experience_id : "$job_experience_id",user_Job_type_ids : "$Job_type_ids",user_job_skill_ids : "$job_skill_ids"},
                pipeline: [
                   { $match: { $expr:{ $and:  [
                              { $eq: [ "$job_category_id",  "$$user_job_category_id" ] },
                              { $not: { $in: [ "$user_id",  bJobUser ] }},
                            ] } } },
                ],
                as: "user_job"
              };
  
  let lookupvalue_2_unwind = {   $unwind:"$user_job" };

  let lookupvalue_2 = 
              {
                from: "user_jobs",
                let: { b_user_id : "$user_id", culture_values_ids:{$ifNull: [{ "$split": [ "$culture_values_ids", "," ] },[] ]},},
                pipeline: [
               
                  {$match: {$expr: {$and:[  { $eq: ["$user_id", "$$b_user_id"]}, ]} } },
                    {
                      "$group": {
                         _id: null,
                         count: { $sum: 1 }
                      }},
                      {"$project" : { "Values" : { "$multiply" : ["$count", 25]}}},
                    ],
                as: "culture_values"
              };

  
  let lookupvalue_3_unwind = {   $unwind:"$user_job" };
            
                 
  let lookupvalue_3 =
    {
      from: "users",
      let: { id: "$user_job.user_id" },
      pipeline: [
      {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1, first_name:1,last_name:1, gender:1,user_id:1 , location:1}  },
        {$match: {$expr: {$and:[  { $eq: ["$_id", "$uid"]}, ]} } },
      ],
      as: "userdata"
    };
      
  let lookupvalue_4_unwind = {   $unwind:"$userdata" };

  let lookupvalue_4 =
    {
      from: "storage_files",
      let: { photo_id: "$userdata.photo_id" , cover_photo: "$coverphoto" },
      pipeline: [
        {$project: { storage_path :1,"userdata.uid" :1, _id: 1,file_id:1 , displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
        {$match: {$expr:
          { $or : 
            [
            {$eq: ["$file_id", "$$photo_id"]},
            ]
          }
        } 
        }
      ],
      as: "userphoto"
    };
      
  //let lookupvalue_5_unwind = {   $unwind:"$userphoto" };
  
  let lookupvalue_5_unwind = {
    $unwind: {
        path: "$userphoto",
        preserveNullAndEmptyArrays: true
    }
  };

  let lookupvalue_5 =
  {
        from: "bussines_job_users",
        let: { id: "$userdata.uid" },
        pipeline: [
          {$project: {_id: 1, search_user_id:1 ,search_status:1,bussines_id:1,job_category_id:1 }  },
                {$match: {$expr:
                      {$and:[ 
                        { $eq:  ["$search_user_id", {"$toString" : "$$id" } ]},
                        { $eq : [ "$bussines_id", req.params.bussinesid ]},
                        { $eq : [ "$job_category_id" , req.query.job_category_id]}
                      ]}
                  }
          }
        ],
        as: "search_status"
     };
  
  let lookupvalue_6_unwind = {
    $unwind: {
        path: "$userphoto",
        preserveNullAndEmptyArrays: true
    }
  };
  
  let lookupvalue_6 =
  {
        from: "user_experiences",
        let: { id: "$userdata.user_id" },
        pipeline: [
          {$project: {_id: 1, owner_id:1, title:1, location:1, company:1,fromyear:1, frommonth:1, toyear:1, tomonth:1  }  },
                {$match: {$expr:
                      {$or:[ 
                        { $eq: ["$owner_id", "$$id"]},
                      ]}
                  }
          }
        ],
        as: "experince"
     };
  
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

      aggregate_options.push(lookupvalue_2_unwind);
      aggregate_options.push({$lookup : lookupvalue_2});

      aggregate_options.push(lookupvalue_3_unwind);
      aggregate_options.push({$lookup : lookupvalue_3});

      aggregate_options.push(lookupvalue_4_unwind);
      aggregate_options.push({$lookup : lookupvalue_4});
      
      aggregate_options.push(lookupvalue_5_unwind);
      aggregate_options.push({$lookup : lookupvalue_5});
      
      aggregate_options.push(lookupvalue_6_unwind);
      aggregate_options.push({$lookup : lookupvalue_6});
      
    try
      {
        const myAggregate = BussinesJob.aggregate(aggregate_options);
  
        BussinesJob.aggregatePaginate(myAggregate,options,function (err, JobCategory) {
              if (err)
              {
                  errMessage = '{ "Bussines user job": { "message" : "Bussiens user job result not found!!"} }';
                  requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
              }
              else if(JobCategory)
              {
                bJob = JSON.stringify(JobCategory);
                bJob = JSON.parse(bJob);
                
                bJob['jobCounts'] = JSON.parse(JSON.stringify(jobCount));
                requestHandler.sendSuccess(res,'Bussiens user job result found successfully',200,bJob);
              }
              else {
                bJob = JSON.stringify(JobCategory);
                bJob = JSON.parse(bJob);
                
                bJob['jobCounts'] = JSON.parse(JSON.stringify(jobCount));
                 requestHandler.sendSuccess(res,'Bussiens user job result not found',200,bJob);
                }

          });
      }   
      catch (err) {
          errMessage = { "Job Category GET": { "message" : err.message } };
          requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
      }
};

function mailing(userid,bussinesid){

  var template = fs.readFileSync(config.general.content_path + '\\HTML_Template\\User_Review_Request.html',{encoding:'utf-8'});
  template = template.replace(/(\r\n|\n|\r)/gm, "");

//  template = template.replace('@username@',users_data[0].last_name + ' ' + users_data[0].first_name);
//  template = template.replace('@Bussinesname@',bussines_data[0].title);

  Mailer.sendEmail ({from:'b@b.com',to: config.mailer.to_mail , bcc: config.mailer.bcc_mail, subject: 'You have new job request', html: template});
}

module.exports = {
add,
view
};
    


