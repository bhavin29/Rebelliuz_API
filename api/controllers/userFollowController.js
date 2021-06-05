const config = require('../../config/appconfig');
const fs = require('fs');
const UserFollow = require('../models/userFollowModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View UserFollow 
exports.view = function (req, res) {
    try
    {
           var errMessage = '';
            let aggregate_options = [];

            //PAGINATION
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
        
            //set the options for pagination
            const options = {
                page, limit,
                collation: {locale: 'en'},
                customLabels: {
                    totalDocs: 'UserFollows',
                    docs: 'userFollows'
                }
            };

            var condition = [];
                a =  {user_id: global.decoded._id};
                condition.push(a);
                b =  {follow_user_id: global.decoded._id};
                condition.push(b);
          
            let match = {$or : condition };

            let queryConvertUserId = {
                user_id:{
                    $toObjectId:"$user_id"
                },status:1,follow_user_id:1,root_path:1
            };

            let query ={
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "usersList"
             };

             let photoquery ={
                from: "storage_files",
                localField: "usersList.photo_id",
                foreignField: "file_id",
                as: "userphoto"
            };
            
            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;

            //aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$project: queryConvertUserId});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({ "$unwind": "$usersList" });
            aggregate_options.push({$lookup: photoquery});
            aggregate_options.push({$sort: {"status": sortOrder}});
            const myAggregate = UserFollow.aggregate(aggregate_options);

            UserFollow.aggregatePaginate(myAggregate,options,function (err, userFollow) {
                if (err)
                {
                    errMessage = '{ "UserFollow": { "message" : "Follow user  is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (userFollow.UserFollows >0)
                {
                    requestHandler.sendSuccess(res,'Follow user found successfully.',200,userFollow);
                }
                else
                {
                    errMessage = '{ "UserFollow": { "message" : "Follow user is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
    errMessage = { "UserFollow GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new Location
exports.add = function (req, res) {
    try
        {

            UserFollow.findOne({ user_id: global.decoded._id,follow_user_id :req.body.follow_user_id},
            (err,userFollow)=>{
            if (err){
                errMessage = '{ "UserFollow": { "message" : "UserFollow user is not saved!!"} }';
                requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            }
            if (!userFollow) {
                //insert
                var userFollow = new UserFollow();
                userFollow.user_id =global.decoded._id;
                userFollow.follow_user_id = req.body.follow_user_id;
                userFollow.status = req.body.status;
    
                //Save and check error
                    userFollow.save(function (err) {
                    if (err)
                    {
                        errMessage = '{ "UserFollow": { "message" : "UserFollow is not save"} }';
                        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        requestHandler.sendSuccess(res,'UserFollow save successfully.',200,userFollow);
                    }
                    });
                }
                else if (userFollow) {
                    
                    userFollow.status = req.body.status;

                    userFollow.save(function (err) {
                    if (err){
                           errMessage = '{ "UserFollow": { "message" : "UserFollow user is not saved!!"} }';
                                    requestHandler.sendError(req,res, 422, 'Somthing worng with bussines admin user',JSON.parse(errMessage));
                            } else {
                                    requestHandler.sendSuccess(res,'Bussines admin user updated successfully.',200,userFollow);
                            }
                    });
               }
           });
        } catch (err) {
        errMessage = { "UserFollow GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};