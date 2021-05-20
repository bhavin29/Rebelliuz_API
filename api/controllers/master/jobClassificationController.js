const _ = require('lodash');
JobClassification = require('../../models/master/JobClassificationModel');
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
            docs: 'jobClassification'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.jobclassification_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"jobclassification_name": sortOrder}});

    // Set up the aggregation
    const myAggregate = JobClassification.aggregate(aggregate_options);

    try
    {
        JobClassification.aggregatePaginate(myAggregate,options,function (err, JobClassification) {
            if (err)
            {
                errMessage = '{ "Job Classification": { "message" : "Job classification is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got Job Classification data successfully.',200,JobClassification);
            }
        });
    }   
    catch (err) {
        errMessage = { "Job Classification GET": { "message" : err.message } };
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
    errMessage = { "Job classification GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View jobClassification
exports.view = function (req, res) {
    try
    {
    JobClassification.findById(req.params.jobclassificationId, function (err, JobClassification) {
        if (err)
        {
            errMessage = '{ "Job Classification": { "message" : "Job classification is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job classification found successfully.',200,JobClassification);
        }
    });
    } catch (err) {
    errMessage = { "Job Classification GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update jobClassification
exports.update = function (req, res) {
    try
    {
        JobClassification.findById(req.params.jobclassificationId, function (err, jobClassification) {

            jobClassification.jobclassification_name = req.body.jobclassification_name;
            jobClassification.order = req.body.order;
            jobClassification.isactive = req.body.isactive;

        //Save and check error
        jobClassification.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Classification": { "message" : "Job classification is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job classification updated successfully.',200,jobClassification);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Classification Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}