const config = require('../../../config/appconfig');
const fs = require('fs');
const Member = require('../../models/member/memberModel');
const UserRequest = require('../../models/member/userRequestModel');
const User = require('../../models/userModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const CreateNotification = require('../../../utils/CreateNotification')
const FilterUserData = require('../../../utils/FilterUserData')
const Notification = require('../../models/notification/notificationModel')

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
                // b =  {follow_user_id: global.decoded._id};
                // condition.push(b);
                c = { status : 2};
               // condition.push(c);

            let match ={ $and: [ {$or : condition } , { status : 2 } ] };
             
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
                c = { status : 1};
                condition.push(c);

            let match = {$and : condition };

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
            Member.findOne( { user_id: global.decoded._id,follow_user_id :req.body.follow_user_id},
            (err,member)=>{
            if (err){
                errMessage = '{ "Member": { "message" : "Member user is not saved!!"} }';
                requestHandler.sendError(req,res, 422,err.message ,JSON.parse(errMessage));
            }
            if (!member) {
                callMemberSearch(req, res,member);
            }
            else if (member) {
                    
                    member.status = req.body.status;

                    member.save(function (err) {
                    if (err){
                           errMessage = '{ "Member": { "message" : "Member user is not saved!!"} }';
                                    requestHandler.sendError(req,res, 422, 'Somthing worng with bussines admin user',JSON.parse(errMessage));
                            } else {
                                    callMemberSearch(req, res,member);
                                    //requestHandler.sendSuccess(res,'Member user updated successfully.',200,member);
                            }
                    });
               }
           });
        } catch (err) {
        errMessage = { "Member GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};

callMemberSearch = function (req, res,memberUserId) {
    try
        {
            Member.findOne( { follow_user_id: global.decoded._id, user_id :req.body.follow_user_id},
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
                        addFollowUserMember(req, res,member);
                        //requestHandler.sendSuccess(res,'Member user save successfully.',200,member);
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

addFollowUserMember = function (req, res,memberUserId) {
    try
        {
                var member = new Member();
                member.user_id =req.body.follow_user_id;
                member.follow_user_id = global.decoded._id;
                member.status = 0;
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
            //aggregate_options.push({$unwind:{ path: "$connectionStatus",preserveNullAndEmptyArrays: false}});
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
        errMessage = '{ "Members": { "message" : "You cannot send friend request to yourself"} }';
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
                errMessage = '{ "Members": { "message" : "Friend Request already send"} }';
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
                  body: `${sender.sender.displayname} has send you friend request`,
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
              errMessage = '{ "Members": { "message" : "already in your friend lists"} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                sender.connections.push(global.decoded._id)
                await sender.save()

                const currentUser = await User.findById(global.decoded._id)
                if (currentUser.connections.includes(connectionsRequest.sender)) {
                  errMessage = '{ "Members": { "message" : "already  friend"} }';
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
                        body: `${currentUser.displayname} has accepted your friend request`,
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
          
            requestHandler.sendSuccess(res,'Friend Request Canceled',200, true);
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
          
            requestHandler.sendSuccess(res,'Friend Request Declined',200, true);
      }
    } catch (err) {
        errMessage = { "Members DeclineRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

//recommanded connection user list  
exports.fetchRecommandedUsers = async (req, res) => {
    try {
      const users = await User.find()
        .where('_id')
        .ne(global.decoded._id)
        .populate('connections')
  
      const usersData = users.map((user) => {
        return FilterUserData(user)
      })
      
      //res.status(200).json({ users: usersData })
      requestHandler.sendSuccess(res,'Recommanded users list found success',200, { users: usersData });

    } catch (err) {
        errMessage = { "Members RecommandedRequest": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //get login users notification and connection list
  exports.me = async (req, res) => {
    try {
      const user = await User.findById(global.decoded._id).populate('connections')
      if (!user) {
        errMessage = '{ "Members": { "message" : "user not found"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {
            const userData = FilterUserData(user)

            const connections = user.connections.map((connection) => {
              return {
                ...FilterUserData(connection),
              }
            })
          
            userData.connections = connections
            const notifications = await Notification.find({ user: global.decoded._id }).sort({
              createdAt: -1,
            })
            let notifData = notifications.map((notif) => {
              return {
                id: notif.id,
                body: notif.body,
                createdAt: notif.createdAt,
              }
            })
          
            //res.status(200).json({ user: userData, notifications: notifData })
            requestHandler.sendSuccess(res,'users connections list found success',200, { user: userData, notifications: notifData });
      }
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
      const connections = await UserRequest.find({
        $and: [{ isAccepted: false }, { sender: global.decoded._id }],
      }).populate('receiver')
      const connectionsData = connections.map((connection) => {
        return {
          id: connection.id,
          user: FilterUserData(connection.receiver),
        }
      })
  
      //res.status(200).json({ connections: connectionsData })
      requestHandler.sendSuccess(res,'Connection sended request list found successfully',200, { connections: connectionsData });
    } catch (err) {
      errMessage = { "Connections": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };

  //fetch incomming connection request list
  exports.fetchIncommingConnectionRequest = async (req, res) => {
    try {
      const connections = await UserRequest.find({
        $and: [{ isAccepted: false }, { receiver: global.decoded._id }],
      }).populate('sender')
  
      const connectionsData = connections.map((connection) => {
        return {
          id: connection.id,
          user: FilterUserData(connection.sender),
        }
      })
  
      //res.status(200).json({ connections: connectionsData })
      requestHandler.sendSuccess(res,'Connection request list found successfully',200, { connections: connectionsData });
    } catch (err) {
      errMessage = { "Connections": { "message" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };