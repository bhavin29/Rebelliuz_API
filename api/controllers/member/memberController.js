const config = require('../../../config/appconfig');
const fs = require('fs');
const UserRequest = require('../../models/member/userRequestModel');
const User = require('../../models/userModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const CreateNotification = require('../../../utils/CreateNotification')
const FilterUserData = require('../../../utils/FilterUserData')
const Notification = require('../../models/notification/notificationModel')
const UserPhoto = require('../../models/storageFileModel');

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

            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;

            aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: query});
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

//send Connection request by user id
exports.sendConnectionRequest = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
      if (!user) {
        errMessage = '{ "Members": { "message" : "Member is not found"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else if (global.decoded._id == req.params.userId) {
        errMessage = '{ "Members": { "message" : "You cannot send connection request to yourself"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else if (user.connections.includes(global.decoded._id)) {
        errMessage = '{ "Members": { "message" : "Already Connections"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else 
      {
          const userRequest = await UserRequest.findOne({
                    sender: global.decoded._id,
                    receiver: req.params.userId,
          });

          if (userRequest) {
                errMessage = '{ "Members": { "message" : "Connection Request already send"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
          }
          else
          {
                const newConnectionRequest = new UserRequest({
                  sender: global.decoded._id,
                  receiver: req.params.userId,
                })
              
                const save = await newConnectionRequest.save()
              
                const connection = await UserRequest.findById(save.id).populate('receiver')
              
                const chunkData = {
                  id: connection.id,
                  user: FilterUserData(connection.receiver),
                }
              
                //         res
                //         .status(200)
                //         .json({ message: 'Friend Request Sended', connection: chunkData })
              
                const sender = await UserRequest.findById(save.id).populate('sender')
                let notification = await CreateNotification({
                  user: req.params.userId,
                  body: `${sender.sender.displayname} has send you connection request`,
                })
                const senderData = {
                  id: sender.id,
                  user: FilterUserData(sender.sender),
                }
              
                if (user.socketId) {
                  req.io
                    .to(user.socketId)
                    .emit('friend-request-status', { sender: senderData })
                  req.io.to(user.socketId).emit('Notification', { data: notification })
                }
              
                requestHandler.sendSuccess(res,'Connection Request Sended.',200, chunkData);
        }
      }
    } catch (err) {
      errMessage = { "Members SendRequest": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //Accept Connection request by request id
  exports.acceptConnectionRequest = async (req, res) => {
    try {
      const connectionsRequest = await UserRequest.findById(req.params.requestId)
      
      if (!connectionsRequest) {
        errMessage = '{ "Members": { "message" : "Request already accepted or not sended yet"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {
            const sender = await User.findById(connectionsRequest.sender)
            if (sender.connections.includes(connectionsRequest.receiver)) {
              errMessage = '{ "Members": { "message" : "already in your connection lists"} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                sender.connections.push(global.decoded._id)
                await sender.save()

                const currentUser = await User.findById(global.decoded._id)
                if (currentUser.connections.includes(connectionsRequest.sender)) {
                  errMessage = '{ "Members": { "message" : "already  connection"} }';
                  requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
                else
                {
                      currentUser.connections.push(connectionsRequest.sender)
                      await currentUser.save()

                      const chunkData = FilterUserData(sender)

                      await UserRequest.deleteOne({ _id: req.params.requestId })

                      //     res
                      //       .status(200)
                      //       .json({ message: 'Friend Request Accepted', user: chunkData })

                      let notification = await CreateNotification({
                        user: sender.id,
                        body: `${currentUser.displayname} has accepted your connection request`,
                      })
                      if (sender.socketId) {
                        let currentUserData = FilterUserData(currentUser)
                        req.io.to(sender.socketId).emit('friend-request-accept-status', {
                          user: currentUserData,
                          request_id: req.params.requestId,
                        })
                        req.io.to(sender.socketId).emit('Notification', { data: notification })
                      }
                    
                      requestHandler.sendSuccess(res,'Connection Request Accepted.',200, chunkData);
              }
          }
      }
    } catch (err) {
        errMessage = { "Members AcceptRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };


//cancel sended connection request
exports.cancelSendedConnectionRequest = async (req, res) => {
    try {
      const connectionsRequest = await UserRequest.findById(
        req.params.requestId,
      ).populate('receiver')
      if (!connectionsRequest) {
        errMessage = '{ "Members": { "message" : "Request already cenceled or not sended yet"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {     
            await UserRequest.deleteOne({ _id: req.params.requestId })

            //res.status(200).json({ message: 'Friend Request Canceled' })

            if (connectionsRequest.receiver.socketId) {
              req.io
                .to(connectionsRequest.receiver.socketId)
                .emit('sended-friend-request-cancel', {
                  requestId: req.params.requestId,
                })
            }
          
            requestHandler.sendSuccess(res,'Connection Request Canceled',200, true);
      } 
    } catch (err) {
        errMessage = { "Members CancelRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };
  
  //decline friend connection
  exports.declineFriendConnection = async (req, res) => {
    try {
      const connectionsRequest = await UserRequest.findById(
        req.params.requestId,
      ).populate('sender')
      if (!connectionsRequest) {
        errMessage = '{ "Members": { "message" : "Request already declined or not sended yet"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {
            await UserRequest.deleteOne({ _id: req.params.requestId })

            //res.status(200).json({ message: 'Friend Request Declined' })

            if (connectionsRequest.sender.socketId) {
              req.io
                .to(connectionsRequest.sender.socketId)
                .emit('received-friend-request-decline', {
                  requestId: req.params.requestId,
                })
            }
          
            requestHandler.sendSuccess(res,'Connection Request Declined',200, true);
      }
    } catch (err) {
        errMessage = { "Members DeclineRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

//recommanded connection user list  
exports.fetchRecommandedUsers = async (req, res) => {
    try {

      //Get Connection User Request
      const user_connections = await User.findById(global.decoded._id).populate(
        'user',
        'connections',
      );

      //Get Sended User Request
      const user_sendrequest = await UserRequest.find({$and: [{ isAccepted: false }, { sender: global.decoded._id }]}).populate(
        'receiver','receiver'
      );
      const userData = user_sendrequest.map((connection) => {
        return connection.receiver._id
      });

          let aggregate_options = [];

            //PAGINATION
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
        
            //set the options for pagination
            const options = {
                page, limit,
                collation: {locale: 'en'},
                customLabels: {
                    totalDocs: 'RecommandedUsers',
                    docs: 'recommandedUsers'
                }
            };

            let query ={
                    from: "storage_files",
                    localField: "photo_id",
                    foreignField: "file_id",
                    as: "userphoto"
             };

             var condition = [];
             a = {userId: {$ne: global.decoded._id }};
             condition.push(a);
             b = { loginId : {$nin: user_connections.connections }};
             condition.push(b);
             c = { loginId : {$nin: userData }};
             condition.push(c);
           
             let match = {$and :condition};

            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

            aggregate_options.push({$addFields: { "userId": { "$toString": "$_id" }}});
            aggregate_options.push({$addFields: { "loginId": { "$toObjectId": "$_id" }}});
            aggregate_options.push({$match: match});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({$sort: {"created_on": sortOrder}});
            const myAggregate = User.aggregate(aggregate_options);

            User.aggregatePaginate(myAggregate,options,function (err, user) {
                if (err)
                {
                    errMessage = '{ "Members": { "message" : "Member is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (user.RecommandedUsers >0)
                {
                    requestHandler.sendSuccess(res,'Member found successfully.',200,user);
                }
                else
                {
                    errMessage = '{ "Members": { "message" : "Member is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
        errMessage = { "Members RecommandedRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //get login users notification and connection list
  exports.me = async (req, res) => {
    try {

      let match = { userId: global.decoded._id }
  
      let lookupvalue_1 = 
                {
                         from: "storage_files",
                         let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                         pipeline: [
                           {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                           {$match: {$expr:
                                 { $or : 
                                   [
                                     {$eq: ["$file_id", "$$photo_id"]}, 
                                   ]
                                 }
                           } 
                           }
                         ],
                         as: "user_photo"
                };
      let lookupvalue_2 = 
                       {
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
                  };
                     
        let lookupvalue_3 ={
                             from: "users",
                             let: { userids: "$connections" },
                              pipeline: [
                               {$match: {$expr:
                                 { $in : 
                                   ["$_id", "$$userids"] 
                                 }
                               } 
                             },
                             {  
                              $lookup:{
                                from: "storage_files",
                                let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                                pipeline: [
                                  {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                                  {$match: {$expr:
                                        { $or : 
                                          [
                                            {$eq: ["$file_id", "$$photo_id"]}, 
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
                           as: "connections"
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
            docs: 'profile'
        }
    };
    
    aggregate_options.push({$addFields: { "userId": { "$toString": "$_id" }}});
    aggregate_options.push({$match : match});
    aggregate_options.push({$lookup : lookupvalue_1});
    aggregate_options.push({$lookup : lookupvalue_2});
    aggregate_options.push({$lookup : lookupvalue_3});
    
  
      const myAggregate = User.aggregate(aggregate_options);
   
      User.aggregatePaginate(myAggregate,options,function (err, user) {
            if (err)
            {
                errMessage = '{ "Members": { "message" : "Members result not found!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else if (user.totalResults > 0)
            {
              requestHandler.sendSuccess(res,'Members result found successfully',200,user);
            }
            else
            {
                requestHandler.sendSuccess(res,'Members no data found',200,user);
            }
        });
      
    } catch (err) {
      errMessage = { "Members Connections": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //clear notification
  exports.clearNotification = async (req, res) => {
    try {
      await Notification.deleteMany({ user: global.decoded._id })
     // res.status(200).json({ message: 'Notification Cleared Successfully' })
      requestHandler.sendSuccess(res,'Notification Cleared Successfully',200, true);
    } catch (err) {
      errMessage = { "Notification": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  }

  //fetch user by id
  exports.fetchUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.user_id).populate('connections')
      const userData = FilterUserData(user)
  
      //res.status(200).json({ user: userData })
      requestHandler.sendSuccess(res,'User found successfully',200, { user: userData });
    } catch (err) {
      errMessage = { "User": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  }

//fetch sended connection request list by login user id
  exports.fetchSendedConnectionRequest = async (req, res) => {
    try {
      let aggregate_options = [];

            //PAGINATION
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
        
            //set the options for pagination
            const options = {
                page, limit,
                collation: {locale: 'en'},
                customLabels: {
                    totalDocs: 'Connections',
                    docs: 'connections'
                }
            };

            let querySender ={
              from: "users",
              localField: "receiver",
              foreignField: "_id",
              as: "receiver"
            };

            let query ={
                    from: "storage_files",
                    localField: "receiver.photo_id",
                    foreignField: "file_id",
                    as: "userphoto"
             };

             
            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

            aggregate_options.push({$addFields: { "senderId": { "$toString": "$sender" }}});
            aggregate_options.push({$match: {$and: [{ isAccepted: false }, { senderId: global.decoded._id}]}});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: querySender});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({$sort: {"createdAt": sortOrder}});
            const myAggregate = UserRequest.aggregate(aggregate_options);

            UserRequest.aggregatePaginate(myAggregate,options,function (err, userRequest) {
                if (err)
                {
                    errMessage = '{ "Members": { "message" : "Connection request is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (userRequest.Connections >0)
                {
                    requestHandler.sendSuccess(res,'Connection request list found successfully.',200,userRequest);
                }
                else
                {
                    errMessage = '{ "Members": { "message" : "Connection request is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
      errMessage = { "Connections": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //fetch incomming connection request list
  exports.fetchIncommingConnectionRequest = async (req, res) => {
    try {

          let aggregate_options = [];

            //PAGINATION
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
        
            //set the options for pagination
            const options = {
                page, limit,
                collation: {locale: 'en'},
                customLabels: {
                    totalDocs: 'Connections',
                    docs: 'connections'
                }
            };

            let querySender ={
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender"
            };

            let query ={
                    from: "storage_files",
                    localField: "sender.photo_id",
                    foreignField: "file_id",
                    as: "userphoto"
             };

             
            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

            aggregate_options.push({$addFields: { "receiverId": { "$toString": "$receiver" }}});
            aggregate_options.push({$match: {$and: [{ isAccepted: false }, { receiverId: global.decoded._id}]}});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: querySender});
            aggregate_options.push({$lookup: query});
            aggregate_options.push({$sort: {"createdAt": sortOrder}});
            const myAggregate = UserRequest.aggregate(aggregate_options);

            UserRequest.aggregatePaginate(myAggregate,options,function (err, userRequest) {
                if (err)
                {
                    errMessage = '{ "Members": { "message" : "Connection request is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (userRequest.Connections >0)
                {
                    requestHandler.sendSuccess(res,'Connection request list found successfully.',200,userRequest);
                }
                else
                {
                    errMessage = '{ "Members": { "message" : "Connection request is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
     
    } catch (err) {
      errMessage = { "Connections": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };