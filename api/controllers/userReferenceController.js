var mongoose = require('mongoose');
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
          //userreference.pros = req.body.pros;
          //userreference.cons = req.body.cons;
          userreference.description = req.body.description;
          //userreference.rating = req.body.rating;
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

        /*if(req.body.pros != undefined)
                userReference.pros = req.body.pros;

        if(req.body.cons != undefined)
                userReference.cons = req.body.cons;*/

        if(req.body.description != undefined)
                userReference.description = req.body.description;

        /*if(req.body.rating != undefined)
                userReference.rating = req.body.rating;*/

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
 
  var validation =0;
  if ( req.query.userid == undefined || req.query.userid =='')
  {
    if (req.query.ownerid == undefined || req.query.ownerid =='')
    {
      validation =1;
    }
  }

  if (validation===1){
    errMessage = '{ "User reference": { "message" : "Please enter user id/owner id"} }';
    requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
  }
  else
  {
    let match = { user_id : req.query.userid};

    if (req.query.recommendedtext)
    {
        match.recommended = {$regex: req.query.recommendedtext, $options: 'i'};
    } 

    if (req.query.rating)
    {
        match.rating = {$regex: req.query.rating, $options: 'i'};
    } 

    if (req.query.userid)
    {
      reference_match =  {user_id : req.query.userid};  
    }
    else if (req.query.ownerid)
    {
      reference_match =  {owner_id : req.query.ownerid};  
    }

    UserReference.aggregate([
          {
            $match: reference_match
          },
          {
            $lookup:
             {
               from: "reference_relationships",
               let: { id: "$relationship_id" },
               pipeline: [
                 {$project: {user_id:1,_id: 1, rid: {"$toObjectId": "$$id"}, relationship_name:1 }  },
                        {$match: {$expr:
                             {$and:[ 
                               { $eq: ["$_id", "$rid"]},
                             ]}
                         }
                 }
               ],
               as: "ReferenceRelationship"
             }
           },
            /*        {   $unwind:"$ReferenceRelationship" },*/
            {
              $unwind: {
                  path: "$ReferenceRelationship",
                  preserveNullAndEmptyArrays: false
              }
            },
           {
           $lookup:
            {
              from: "users",
              let: { id: "$user_id" , username : "$username", user_id : "$user_id"},
              pipeline: [
                {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, first_name:1,last_name:1,
                              username:  {$ifNull: [ "$username" , "$user_id" ]},
                             coverphoto:1,owner_id:1 }  },
                       {$match: {$expr:
                            {$and:[ 
                              { $eq: ["$_id", "$uid"]},
                            ]}
                        }
                }
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
                as: "userphoto"
              }
              },
                {   $unwind:"$userdata" },
                {
                  $lookup:
                   {
                     from: "users",
                     let: { id: "$owner_id" },
                     pipeline: [
                       {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1 }  },
                              {$match: {$expr:
                                   {$and:[ 
                                     { $eq: ["$_id", "$uid"]},
                                   ]}
                               }
                       }
                     ],
                     as: "ownerdata"
                   }
                 },
                 {   $unwind:"$ownerdata" },
                 {
                     $lookup:{
                       from: "storage_files",
                       let: { photo_id: "$ownerdata.photo_id" , cover_photo: "$ownerdata.coverphoto" },
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
                       as: "ownerphoto"
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
                  // callUserTest(req,res,data)

                  
                     requestHandler.sendSuccess(res,'User reference result found successfully.',200,data);
                 }
              }
      );
        }
}

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
      if (req.query.reference_id == undefined || req.query.reference_id =='')
      {
        errMessage = '{ "User reference": { "message" : "Please enter reference id"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
      }
      else
     {     
      UserReference.deleteOne({ _id : mongoose.Types.ObjectId(req.query.reference_id) },function (err, userReference) {
        if (err)
        {
            errMessage = '{ "User reference": { "message" : "User reference is not delete data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
          if (userReference.deletedCount >0)
          {
            requestHandler.sendSuccess(res,'User reference deleted successfully.',200,userReference);
          }
          else
          {
            errMessage = '{ "User reference": { "message" : "User reference is not found"} }';
            requestHandler.sendError(req,res, 422, 'User refernce not deleted ',JSON.parse(errMessage));

          }
        }
    });
    } 
  }  
    catch (err) {
        errMessage = { "User Reference DELETE": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

// View User Reference
view123 = function (req, res) {
 
  if (req.query.ownerid == undefined || req.query.ownerid =='')
  {
    errMessage = '{ "User reference": { "message" : "Please enter owner id"} }';
    requestHandler.sendError(req,res, 422, 'Somthing went worng: ',JSON.parse(errMessage));
  }
  else
  {
    let sort = '', startRow=0, endRow=5;

    const query = [ 
      {
        $match: {owner_id : req.query.ownerid}  
      },
      {
        $lookup:
         {
           from: "reference_relationships",
           let: { id: "$relationship_id" },
           pipeline: [
             {$project: {_id: 1, rid: {"$toObjectId": "$$id"}, relationship_name:1 }  },
                    {$match: {$expr:
                         {$and:[ 
                           { $eq: ["$_id", "$rid"]},
                         ]}
                     }
             }
           ],
           as: "ReferenceRelationship"
         }
       },
       {   $unwind:"$ReferenceRelationship" },
       {
       $lookup:
        {
          from: "users",
          let: { id: "$user_id" },
          pipeline: [
            {$project: {_id: 1, uid: {"$toObjectId": "$$id"}, displayname:1, photo_id:1, coverphoto:1,owner_id:1 }  },
                   {$match: {$expr:
                        {$and:[ 
                          { $eq: ["$_id", "$uid"]},
                        ]}
                    }
            }
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
      },
    ]

    if (sort) {
      // maybe we want to sort by blog title or something
      query.push({ $sort: sort })
    }
  
    query.push(
      { $group: {
        _id: null,
        // get a count of every result that matches until now
        count: { $sum: 1 },
        // keep our results for the next operation
        results: { $push: '$$ROOT' }
      } },
      // and finally trim the results to within the range given by start/endRow
      { $project: {
        count: 1,
        rows: { $slice: ['$results', startRow, endRow] }
      } }
    )
      
    UserReference.aggregate(query,function(err, data) {
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


module.exports = {
  add,
  view,
  remove
};
