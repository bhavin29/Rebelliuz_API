const _ = require('lodash');
JobType = require('../../models/master/JobTypeModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index

exports.index = async function (req, res) {
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
            docs: 'jobType'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.jobtype_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"jobtype_name": sortOrder}});


    // Set up the aggregation
    const myAggregate = JobType.aggregate(aggregate_options);

    try
    {
        JobType.aggregatePaginate(myAggregate,options,function (err, JobType) {
            if (err)
            {
                errMessage = '{ "Job Type": { "message" : "Job type is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got job type data successfully.',200,JobType);
            }
        });
    }   
    catch (err) {
        errMessage = { "Job Type GET": { "message" : err.message } };
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
    errMessage = { "Job Type GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};


// View JobType
exports.view = function (req, res) {
    try
    {
        JobType.findById(req.params.jobtypeId, function (err, JobType) {
        if (err)
        {
            errMessage = '{ "Job Type": { "message" : "Job type is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job type found successfully.',200,JobType);
        }
    });
    } catch (err) {
    errMessage = { "Job Type GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update JobType
exports.update = function (req, res) {
    try
    {
        JobType.findById(req.params.jobtypeId, function (err, jobType) {
        
            jobType.jobtype_name  = req.body.jobtype_name;
            jobType.order = req.body.order;
            jobType.isactive = req.body.isactive;

        //Save and check error
        jobType.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Type": { "message" : "Job type is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job type updated successfully.',200,jobType);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Type Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};