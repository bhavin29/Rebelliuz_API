const UserReference = require('../models/userReferenceModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
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

        userReference.save(function (err) {
            if (err){
              errMessage = '{ "reference": { "message" : "User reference is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user job',JSON.parse(errMessage));
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
    let match = {};

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
                requestHandler.sendSuccess(res,'Got user reference data successfully.',200,userReference);
            }
        });
    }   
    catch (err) {
        errMessage = { "User Reference GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
 };

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
