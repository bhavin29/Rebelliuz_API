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

//For creating new Message
const add = async (req, res) => {
        try
        {
                global.messageFilename = '';
                await new uploadFile(req, res);
             
                //insert
                var messageModel = new MessageModel();
                messageModel.to_user_id =req.body.to_user_id;
                messageModel.from_user_id = req.body.from_user_id;
                messageModel.message = req.body.message;
                messageModel.link = req.body.link;
                messageModel.filename = global.messageFilename;
                messageModel.filetype = req.body.filetype;
                messageModel.resource_type = req.body.resource_type;
                messageModel.isread = 0;
                messageModel.device_id = '';
                messageModel.device_name = '';
                messageModel.ip_address = '';
                messageModel.created_by = global.decoded._id;
                

                //Save and check error
                messageModel.save(function (err) {
                    if (err)
                    {
                        errMessage = '{ "Message": { "message" : "Message is not save"} }';
                        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        requestHandler.sendSuccess(res,'Message save successfully.',200,messageModel);
                    }
                    });
        } catch (err) {
        errMessage = { "Message GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};

const view = function (req, res) {
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
                    totalDocs: 'Messages',
                    docs: 'messages'
                }
            };

            var condition=[];
            set1 = { $or: [ { to_user_id: req.params.userid },{ from_user_id: global.decoded._id } ] };
            condition.push(set1);

            set2 = { $or: [ { to_user_id: global.decoded._id },{ from_user_id: req.params.userid } ] };
            condition.push(set2);

            let match = {$or: condition };

            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

            aggregate_options.push({ $match: match});
            aggregate_options.push({$sort: {"created_on": sortOrder}});
            const myAggregate = MessageModel.aggregate(aggregate_options);

            MessageModel.aggregatePaginate(myAggregate,options,function (err, messageModel) {
                if (err)
                {
                    errMessage = '{ "Message": { "message" : "Message is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (messageModel.Messages >0)
                {
                    requestHandler.sendSuccess(res,'Message found successfully.',200,messageModel);
                }
                else
                {
                    errMessage = '{ "Message": { "message" : "Message is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
    } catch (err) {
    errMessage = { "Message GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

const updateReadCount = function (req, res) {
    try
    {
            //Save and check error
            MessageModel.updateMany(
            { _id: { $in: req.body.messageid } },
            { $set: { isread : true } },
            {multi: true},
            function (err) {
                if (err)
                {
                    errMessage = '{ "Message": { "message" : "Message read count not save"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else
                {
                    requestHandler.sendSuccess(res,'Message read count updated successfully.',200,true);
                }
                });
    } catch (err) {
    errMessage = { "Message GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

module.exports = {
    add,
    view,
    updateReadCount
};
  