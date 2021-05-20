const _ = require('lodash');
JobQuestion = require('../../models/master/jobQuestionModel');
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
            docs: 'jobQuestion'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.question = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"question": sortOrder}});

    // Set up the aggregation
    const myAggregate = JobQuestion.aggregate(aggregate_options);

    try
    {
        JobQuestion.aggregatePaginate(myAggregate,options,function (err, JobQuestion) {
            if (err)
            {
                errMessage = '{ "Job Question": { "message" : "Job question is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got job question data successfully.',200,JobQuestion);
            }
        });
    }   
    catch (err) {
        errMessage = { "Job Question GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new bio
exports.add = function (req, res) {
try
    {
    var jobQuestion = new JobQuestion();
    jobQuestion.job_category_id = req.body.job_category_id;
    jobQuestion.question = req.body.question;
    jobQuestion.short_question = req.body.short_question;
    jobQuestion.order = req.body.order;
    jobQuestion.isactive = req.body.isactive;

    //Save and check error
    jobQuestion.save(function (err) {
        if (err){
            errMessage = '{ "Job Question": { "message" : "Job question is not saved!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
        else
        {    
            requestHandler.sendSuccess(res,'Job question save successfully.',200,jobQuestion);
        }    
    });

    } catch (err) {
    errMessage = { "Job Question Add": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View jobExperince
exports.view = function (req, res) {
    try
    {
        JobQuestion.findById(req.params.jobquestionId, function (err, JobQuestion) {
        if (err)
        {
            errMessage = '{ "Job Question": { "message" : "Job question is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job question found successfully.',200,JobQuestion);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update jobExperince
exports.update = function (req, res) {
    try
    {
        JobQuestion.findById(req.params.jobquestionId, function (err, jobQuestion) {
        
            jobQuestion.job_category_id = req.body.job_category_id;
            jobQuestion.question = req.body.question;
            jobQuestion.short_question = req.body.short_question;
            jobQuestion.order = req.body.order;
            jobQuestion.isactive = req.body.isactive;

        //Save and check error
        jobQuestion.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Question": { "message" : "Job question is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job question updated successfully.',200,jobQuestion);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Question Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};