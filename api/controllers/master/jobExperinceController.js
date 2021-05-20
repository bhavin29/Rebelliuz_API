const _ = require('lodash');
JobExperince = require('../../models/master/JobExperinceModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.index = async function (req, res) {
    let aggregate_options = [];

    //PAGINATION
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;

    //set the options for pagination
    const options = {
        pagination : false,
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'jobExperince'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.jobexperince_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"jobexperince_name": sortOrder}});

    // Set up the aggregation
    const myAggregate = JobExperince.aggregate(aggregate_options);

    try
    {
        JobExperince.aggregatePaginate(myAggregate,options,function (err, JobExperince) {
            if (err)
            {
                errMessage = '{ "Job Experince": { "message" : "Job experince is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got job experince data successfully.',200,JobExperince);
            }
        });
    }   
    catch (err) {
        errMessage = { "Job Experince GET": { "message" : err.message } };
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
    errMessage = { "Job Experince GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View jobExperince
exports.view = function (req, res) {
    try
    {
        JobExperince.findById(req.params.jobexperinceId, function (err, JobExperince) {
        if (err)
        {
            errMessage = '{ "Job Experince": { "message" : "Job experince is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job experince found successfully.',200,JobExperince);
        }
    });
    } catch (err) {
    errMessage = { "Job Experince GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update jobExperince
exports.update = function (req, res) {
    try
    {
        JobExperince.findById(req.params.jobexperinceId, function (err, jobExperince) {
        
            jobExperince.jobexperince_name = req.body.jobexperince_name;
            jobExperince.order = req.body.order;
            jobExperince.isactive = req.body.isactive;

        //Save and check error
        jobExperince.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Experince": { "message" : "Job experince is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job experince updated successfully.',200,jobExperince);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Experince Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};