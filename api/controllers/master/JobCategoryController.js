const _ = require('lodash');
const JobCategory = require('../../models/master/jobCategoryModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {
    JobCategory.find(function (err, JobCategory) {
        if (err)
        {
            errMessage = '{ "Job Category": { "message" : "Job category is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job category data successfully.',200,JobCategory);
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
     var jobCategory = new JobCategory();
    jobCategory.jobcategory_name = req.body.jobcategory_name;
    jobCategory.order = req.body.order;
    jobCategory.isactive = req.body.isactive;

    //Save and check error
    jobCategory.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Category": { "message" : "Job category is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job category save successfully.',200,jobCategory);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
