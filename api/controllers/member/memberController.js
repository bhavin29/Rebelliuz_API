const config = require('../../../config/appconfig');
const fs = require('fs');
const Member = require('../../models/member/memberModel');
const User = require('../../models/userModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View Member My Connection
exports.connection = function (req, res) {
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
                    totalDocs: 'Members',
                    docs: 'members'
                }
            };

            var condition = [];
                a =  {user_id: global.decoded._id};
                condition.push(a);
                b =  {follow_user_id: global.decoded._id};
                condition.push(b);
          
            let match = {$or : condition };

            let queryConvertUserId = {
                follow_user_id:{
                    $toObjectId:"$follow_user_id"
                },status:1,user_id:1,root_path:1
            };

            let query ={
                    from: "users",
                    localField: "follow_user_id",
                    foreignField: "_id",
                    as: "usersList"
             };

             let photoquery ={
                from: "storage_files",
                localField: "usersList.photo_id",
                foreignField: "file_id",
                as: "userphoto"
            };
            
            let isread_query={
                  from: "messages",
                  let: {
                    usersIds: '$from_user_id',
                  },
                  pipeline: [
                    {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$user_id', '$$usersIds'] },
                              { $eq: ['$isread', false] },
                            ],
                          },
                        },
                      },
                    { $group: {
                        _id: null,
                        count: { $sum: 1 }
                       } 
                    }
                ],
                as: "isReadStatus"
            };
            

            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;

            aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$project: queryConvertUserId});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({ "$unwind": "$usersList" });
            aggregate_options.push({$lookup: photoquery});
            aggregate_options.push({$lookup: isread_query});
            aggregate_options.push({$unwind:{ path: "$isReadStatus",preserveNullAndEmptyArrays: true}});
            aggregate_options.push({$sort: {"status": sortOrder,"usersList.displayname":sortOrder}});
            const myAggregate = Member.aggregate(aggregate_options);

            Member.aggregatePaginate(myAggregate,options,function (err, member) {
                if (err)
                {
                    errMessage = '{ "Member": { "message" : "Member user  is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (member.Members >0)
                {
                    requestHandler.sendSuccess(res,'Member user found successfully.',200,member);
                }
                else
                {
                    errMessage = '{ "Member": { "message" : "Member user is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
    errMessage = { "Member GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View members My Request
exports.request = function (req, res) {
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
                    totalDocs: 'Members',
                    docs: 'members'
                }
            };

            var condition = [];
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

            aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$project: queryConvertUserId});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({ "$unwind": "$usersList" });
            aggregate_options.push({$lookup: photoquery});
            aggregate_options.push({$sort: {"status": sortOrder,"usersList.displayname":sortOrder}});
            const myAggregate = Member.aggregate(aggregate_options);

            Member.aggregatePaginate(myAggregate,options,function (err, member) {
                if (err)
                {
                    errMessage = '{ "Member": { "message" : "Member user  is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (member.Members >0)
                {
                    requestHandler.sendSuccess(res,'Member user found successfully.',200,member);
                }
                else
                {
                    errMessage = '{ "Member": { "message" : "Member user is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
    errMessage = { "Member GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For add Member
exports.add = function (req, res) {
    try
        {

            Member.findOne({ user_id: global.decoded._id,follow_user_id :req.body.follow_user_id},
            (err,member)=>{
            if (err){
                errMessage = '{ "Member": { "message" : "Member user is not saved!!"} }';
                requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            }
            if (!member) {
                //insert
                var member = new Member();
                member.user_id =global.decoded._id;
                member.follow_user_id = req.body.follow_user_id;
                member.status = req.body.status;
                member.device_id =  '';
                member.device_name ='';
                member.ip_address = '';
                member.created_by = global.decoded._id;

                //Save and check error
                member.save(function (err) {
                    if (err)
                    {
                        errMessage = '{ "Member": { "message" : "Member user is not save"} }';
                        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        requestHandler.sendSuccess(res,'Member user save successfully.',200,member);
                    }
                    });
                }
                else if (member) {
                    
                    member.status = req.body.status;

                    member.save(function (err) {
                    if (err){
                           errMessage = '{ "Member": { "message" : "Member user is not saved!!"} }';
                                    requestHandler.sendError(req,res, 422, 'Somthing worng with bussines admin user',JSON.parse(errMessage));
                            } else {
                                    requestHandler.sendSuccess(res,'Member user updated successfully.',200,member);
                            }
                    });
               }
           });
        } catch (err) {
        errMessage = { "Member GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};

// search member
exports.search = function (req, res) {
    try
    {
        var errMessage = '';
        if ( req.body.searchText == undefined )
        {
            errMessage = '{ "Member": { "message" : "Enter search "} }';
        }
        else if ( req.body.searchText == '')
        {
            errMessage = '{ "Member": { "message" : "Enter data in search field"} }';
        }
        
        if (errMessage !='')
        {
            requestHandler.sendError(req,res, 422, 'Somthing went worng',JSON.parse(errMessage));
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
                    totalDocs: 'Members',
                    docs: 'members'
                }
            };

            var condition = [];
            if ( req.body.searchText != '' && req.body.searchText !=undefined ){ 
                a =  {email: {'$regex': '^' + req.body.searchText, '$options': 'i'}};
                condition.push(a);
            }
            if ( req.body.searchText != '' && req.body.searchText !=undefined ){ 
                b =  {displayname: new RegExp(req.body.searchText,"i") };
                condition.push(b);
            }
            if ( req.body.searchText != '' && req.body.searchText !=undefined ){ 
                c = {location: new RegExp(req.body.searchText,"i") };
                condition.push(c);
            }
          
            let match = {$or : condition };

            let query ={
                    from: "storage_files",
                    localField: "photo_id",
                    foreignField: "file_id",
                    as: "userphoto"
             };

             let status_query ={
                from: "members",
                localField: "userId",
                foreignField: "follow_user_id",
                as: "connectionStatus"
            };

            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;

            aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({$addFields: { "userId": { "$toString": "$_id" }}});
            aggregate_options.push({$lookup: status_query});
            aggregate_options.push({$unwind:{ path: "$connectionStatus",preserveNullAndEmptyArrays: true}});
            aggregate_options.push({$sort: {"email": sortOrder}});
            const myAggregate = User.aggregate(aggregate_options);

            User.aggregatePaginate(myAggregate,options,function (err, user) {
                if (err)
                {
                    errMessage = '{ "Members": { "message" : "Member is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (user.Members >0)
                {
                    requestHandler.sendSuccess(res,'Member found successfully.',200,user);
                }
                else
                {
                    errMessage = '{ "Members": { "message" : "Member is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
   }
    } catch (err) {
    errMessage = { "Members GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};