const _ = require('lodash');
JobClassification = require('../../models/master/JobClassificationModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {
    logger.log('Job classification connected successfully', 'info');

    JobClassification.find(function (err, JobClassification) {
        if (err)
        {
            errMessage = '{ "Job classification": { "message" : "Job classification is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Hot Job classification data successfully.',200,JobClassification);
        }
    });

    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new bio
exports.add = function (req, res) {
try
    {
    var jobClassification = new JobClassification();
    jobClassification.jobclassification_name = req.body.jobclassification_name;
    jobClassification.order = req.body.order;
    jobClassification.isactive = req.body.isactive;

    //Save and check error
    jobClassification.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job classification": { "message" : "Job classification is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job classification data successfully.',200,jobClassification);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
