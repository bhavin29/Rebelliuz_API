const _ = require('lodash');
JobExperince = require('../../models/master/JobExperinceModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {
    JobExperince.find(function (err, JobExperince) {
        if (err)
        {
            errMessage = '{ "Job Experince": { "message" : "Job experince is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job experince data successfully.',200,JobExperince);
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
    var jobExperince = new JobExperince();
    jobExperince.jobexperince_name = req.body.jobexperince_name;
    jobExperince.order = req.body.order;
    jobExperince.isactive = req.body.isactive;

    //Save and check error
    jobExperince.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Experince": { "message" : "Job experince is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job experince save successfully.',200,jobExperince);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
