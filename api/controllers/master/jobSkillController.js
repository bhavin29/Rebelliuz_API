const _ = require('lodash');
JobSkill = require('../../models/master/jobSkillModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.index = async function (req, res) {
    let aggregate_options = [];

    //PAGINATION
    let page = parseInt(req.query.page) || 1;
    let limit =  parseInt(req.query.rowsPerPage) || global.rows_per_page;

    //set the options for pagination
    const options = {
        pagination : false,
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'jobSkill'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.jobskill_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"jobskill_name": sortOrder}});

    // Set up the aggregation
    const myAggregate = JobSkill.aggregate(aggregate_options);

    try
    {
        JobSkill.aggregatePaginate(myAggregate,options,function (err, JobSkill) {
            if (err)
            {
                errMessage = '{ "Job Skill": { "message" : "Job skill is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got job skill data successfully.',200,JobSkill);
            }
        });
    }   
    catch (err) {
        errMessage = { "Job Skill GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new bio
exports.add = function (req, res) {
try
    {
    var jobSkill = new JobSkill();
    jobSkill.jobskill_name = req.body.jobskill_name;
    jobSkill.order = req.body.order;
    jobSkill.isactive = req.body.isactive? req.body.isactive: 1 ;

    //Save and check error
    jobSkill.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Job skill is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job skill save successfully.',200,jobSkill);
        }
    });
    } catch (err) {
    errMessage = { "Job Skill GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View JobSkill
exports.view = function (req, res) {
    try
    {
        JobSkill.findById(req.params.jobskillId, function (err, JobSkill) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Job skill is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job skill found successfully.',200,JobSkill);
        }
    });
    } catch (err) {
    errMessage = { "Job Skill GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update JobSkill
exports.update = function (req, res) {
    try
    {
        JobSkill.findById(req.params.jobskillId, function (err, jobSkill) {
        
            jobSkill.jobskill_name = req.body.jobskill_name;
            jobSkill.order = req.body.order;
            jobSkill.isactive = req.body.isactive? req.body.isactive: 1 ;

        //Save and check error
        jobSkill.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Job skill is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job skill updated successfully.',200,jobSkill);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Job Skill Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};