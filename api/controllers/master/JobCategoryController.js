const _ = require('lodash');
const JobCategory = require('../../models/master/jobCategoryModel');
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
            docs: 'jobcategory'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.jobcategory_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"jobcategory_name": sortOrder}});


    // Set up the aggregation
    const myAggregate = JobCategory.aggregate(aggregate_options);

    try
    {
        JobCategory.aggregatePaginate(myAggregate,options,function (err, JobCategory) {
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
    }   
        catch (err) {
        errMessage = { "Job Category GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new job category
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
    errMessage = { "Job Category GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View jobCategory
exports.view = function (req, res) {
    try
    {
    JobCategory.findById(req.params.jobCategoryId, function (err, JobCategory) {
        if (err)
        {
            errMessage = '{ "Job Category": { "message" : "Job category is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job category found successfully.',200,JobCategory);
        }
    });
    } catch (err) {
    errMessage = { "Job Category GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update jobCategory
exports.update = function (req, res) {
    try
    {
        JobCategory.findById(req.params.jobCategoryId, function (err, jobCategory) {

        jobCategory.jobcategory_name = req.body.jobcategory_name;
        jobCategory.order = req.body.order;
        jobCategory.isactive = req.body.isactive;

        //Save and check error
        jobCategory.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Category": { "message" : "Job category is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job category updated successfully.',200,jobCategory);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Category Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}