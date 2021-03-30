const _ = require('lodash');
JobType = require('../../models/master/JobTypeModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {

    JobType.find(function (err, JobType) {
        if (err)
        {
            errMessage = '{ "Job Type": { "message" : "Job type is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job type data successfully.',200,JobType);
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
    var jobType = new JobType();
    jobType.jobtype_name  = req.body.jobtype_name;
    jobType.order = req.body.order;
    jobType.isactive = req.body.isactive;

    //Save and check error
    jobType.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Type": { "message" : "Job type is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job type save successfully.',200,jobType);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
