const config = require('../../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../../utils/uploadMessage.js');
const RunCommand = require('../../../utils/runCommand.js');
const MessageModel = require('../../models/message/messageModel');
const User = require('../../models/userModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const FilterUserData = require('../../../utils/FilterUserData')

//send message
exports.sendMessageToConnection = async (req, res) => {
    try {

            const { text, image } = req.body

            if (!text && !image) {
                errMessage = '{ "Messages": { "message" : "Don`t send empty message type something"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                try {
                        const connection = await User.findById(req.params.connectionId)

                        if (!connection) {
                          errMessage = '{ "Messages": { "message" : "Connection Not Found"} }';
                          requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                        }
                        else
                        {
                                const messageModel = new MessageModel({
                                  sender: global.decoded._id,
                                  receiver: req.params.connectionId,
                                  body: {
                                    text: text || '',
                                    image: image || '',
                                  },
                                })
                            
                                const saveMessage = await messageModel.save()
                            
                                const getMessage = await MessageModel.findById(saveMessage.id)
                                  .populate('sender')
                                  .populate('receiver')
                                const messagedata = {
                                  id: saveMessage.id,
                                  sender: FilterUserData(getMessage.sender),
                                  receiver: FilterUserData(getMessage.receiver),
                                  body: getMessage.body,
                                  createdAt: getMessage.createdAt,
                                }
                            
                                //res.status(201).json({ data: chatdata })

                                if (getMessage.receiver.socketId) {
                                  req.io
                                    .to(getMessage.receiver.socketId)
                                    .emit('new-message', { data: messagedata })
                                }
                            
                                requestHandler.sendSuccess(res,'Message sended successfully.',200, { data: messagedata });
                        }
                } catch (err) {
                    errMessage = { "Messages": { "message" : err.message } };
                    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
                }
            }
    } catch (err) {
        errMessage = { "Messages": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//get messages list
exports.getConnectionMessages = async (req, res) => {
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
                    totalDocs: 'Messages',
                    docs: 'messages'
                }
            };

            let querySender ={
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender"
            };

            let queryReceiver ={
              from: "users",
              localField: "receiver",
              foreignField: "_id",
              as: "receiver"
            };

            let querySenderPhoto ={
                    from: "storage_files",
                    localField: "sender.photo_id",
                    foreignField: "file_id",
                    as: "senderphoto"
             };

             let queryReceiverPhoto ={
                  from: "storage_files",
                  localField: "receiver.photo_id",
                  foreignField: "file_id",
                  as: "receiverphoto"
              };
             
            let path = {  "root_path" :  { $literal: config.general.parent_root }  };
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

            aggregate_options.push({$addFields: { "senderId": { "$toString": "$sender" }}});
            aggregate_options.push({$addFields: { "receiverId": { "$toString": "$receiver" }}});
            aggregate_options.push({$match: {
                $or: [
                        { senderId: global.decoded._id, receiverId: req.params.connectionId },
                        { receiverId: global.decoded._id, senderId: req.params.connectionId },
                    ],
              }});
            aggregate_options.push({$addFields: path});
            aggregate_options.push({$lookup: querySender});
            aggregate_options.push({$lookup: querySenderPhoto});
            aggregate_options.push({$lookup: queryReceiver});
            aggregate_options.push({$lookup: queryReceiverPhoto});
            aggregate_options.push({$sort: {"createdAt": sortOrder}});
            const myAggregate = MessageModel.aggregate(aggregate_options);

            MessageModel.aggregatePaginate(myAggregate,options,function (err, messageModel) {
                if (err)
                {
                    errMessage = '{ "Messages": { "message" : "Messages is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (messageModel.Messages >0)
                {
                    requestHandler.sendSuccess(res,'Messages found successfully.',200,messageModel);
                }
                else
                {
                    errMessage = '{ "Messages": { "message" : "Messages is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });

      /*
      const messages = await MessageModel.find({
        $or: [
          { sender: global.decoded._id, receiver: req.params.connectionId },
          { receiver: global.decoded._id, sender: req.params.connectionId },
        ],
      })
        .populate('sender')
        .populate('receiver')
  
      const messagesData = messages.map((message) => {
        return {
          id: message.id,
          sender: FilterUserData(message.sender),
          receiver: FilterUserData(message.receiver),
          body:message.body,
          createdAt: message.createdAt,
  
        }
      })
  
      //res.status(200).json({ data: messagesData })
      requestHandler.sendSuccess(res,'Messages found successfully.',200, { data: messagesData });
*/
    } catch (err) {
        errMessage = { "Messages": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };
  