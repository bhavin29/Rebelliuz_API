const config = require('../../config/appconfig');
const UserReference = require('../models/userReferenceModel');
const User = require('../models/userModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const { ObjectId } = require('bson');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//add/edit user reference
add = function (req, res) {
 try {
        UserReference.findOne({ owner_id: global.decoded._id, user_id : req.body.user_id },(err,userReference)=>{
      if (err) {
        errMessage = '{ "intro": { "message" : "User reference is not saved!!"} }';
        requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
      }
      if (!userReference) {
          //insert
          var userreference = new UserReference();
           
          userreference.owner_id = global.decoded._id;
          userreference.user_id = req.body.user_id;
          userreference.relationship_id = req.body.relationship_id;
          userreference.title = req.body.title;
          userreference.pros = req.body.pros;
          userreference.cons = req.body.cons;
          userreference.description = req.body.description;
          userreference.rating = req.body.rating;
          userreference.recommended = req.body.recommended;

          userreference.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User reference is not saved!!"} }';
              requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User refernce save successfully.',200,userreference);
            }
        });
      }
      else if (userReference) {
        
        if(req.body.title != undefined)
                userReference.title = req.body.title;

        if(req.body.pros != undefined)
                userReference.pros = req.body.pros;

        if(req.body.cons != undefined)
                userReference.cons = req.body.cons;

        if(req.body.description != undefined)
                userReference.description = req.body.description;

        if(req.body.rating != undefined)
                userReference.rating = req.body.rating;

        if(req.body.recommended != undefined)
                userReference.recommended = req.body.recommended;

        if(req.body.relationship_id != undefined)
        userReference.relationship_id = req.body.relationship_id;
 
        userReference.save(function (err) {
            if (err){
              errMessage = '{ "reference": { "message" : "User reference is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user job:' + err.message,JSON.parse(errMessage));
            } else {
              requestHandler.sendSuccess(res,'User reference updated successfully.',200,userReference);
            }
          });
     }
  });
  
  } catch (err) {
    errMessage = { "User Reference": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Something went worng.',(errMessage));
  }
};

// View User Reference
view = function (req, res) {
 
  if (req.query.ownerid == undefined || req.query.ownerid =='')
  {
    errMessage = '{ "User reference": { "message" : "Please enter owner id"} }';
    requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
  }
  else
  {
    let match = { owner_id : req.query.ownerid};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
      if (req.query.recommendedtext)
    {
        match.recommended = {$regex: req.query.recommendedtext, $options: 'i'};
    } 

    if (req.query.rating)
    {
        match.rating = {$regex: req.query.rating, $options: 'i'};
    } 

    UserReference.aggregate([
     {
         $lookup:
            {
              from: "users",
              let: { id: "$user_id" },
              pipeline: [
                {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1  }  },
                {$match: {$expr: {$eq: ["$_id", "$uid"]}}}
              ],
              as: "userdata"
            }
          },
          {   $unwind:"$userdata" },
          {
              $lookup:{
                from: "storage_files",
                let: { photo_id: "$userdata.photo_id" , cover_photo: "$userdata.coverphoto" },
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
}


// View User Reference
view123 = function (req, res) {

  if (req.query.ownerid == undefined || req.query.ownerid =='')
  {
    errMessage = '{ "User reference": { "message" : "Please enter owner id"} }';
    requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
  }
  else
  {
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
            docs: 'userreference'
        }
     };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = { owner_id : req.query.ownerid};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
      if (req.query.recommendedtext)
    {
        match.recommended = {$regex: req.query.recommendedtext, $options: 'i'};
    } 

    if (req.query.rating)
    {
        match.rating = {$regex: req.query.rating, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
   
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"rating": sortOrder}});
 
    aggregate_options.push({ "$addFields": { "user_id": { "$toString": "$user_id" }}});
     aggregate_options.push(
    {
      $lookup:{
       from: 'users',
       localField:  'user_id',
       foreignField: '_id' ,
       as: 'Users'
       }
     });



    // Set up the aggregation
    const myAggregate = UserReference.aggregate(aggregate_options);

    try
    {
      UserReference.aggregatePaginate(myAggregate,options,function (err, userReference) {
            if (err)
            {
                errMessage = '{ "User reference": { "message" : "User reference is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
              requestHandler.sendSuccess(res,'User reference found successfully.',200,userReference);
             // addusers(req,res,userReference);
            }
        });
    }   
    catch (err) {
        errMessage = { "User Reference GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
   }
 };

addusers = function(req,res,userReference){
  
  User.aggregate([  
    //           { "$match": { "user_id": global.decoded._id } },
               { "$addFields": { "_id": { "$toString": "$_id" }}},
               {
                  $lookup:{
                   from: userReference,//'test_questions',
                   localField: '_id',
                   foreignField: 'user_id',
                   as: 'UserReference'
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
                   requestHandler.sendSuccess(res,'User test found successfully.',200,data);
               }
           });      
  }

 remove = function (req, res) {
  try
    {
      UserReference.deleteOne({ owner_id: global.decoded._id, user_id : req.body.user_id },function (err, userReference) {
        if (err)
        {
            errMessage = '{ "User reference": { "message" : "User reference is not delete data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'User reference deleted successfully.',200,userReference);
        }
    });
    }   
    catch (err) {
        errMessage = { "User Reference DELETE": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

module.exports = {
  add,
  view,
  remove
};
