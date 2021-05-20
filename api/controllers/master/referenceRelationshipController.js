const _ = require('lodash');
ReferenceRelationship = require('../../models/master/referenceRelationshipModel');
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
            docs: 'reference_relationships'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.relationship_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"relationship_name": sortOrder}});

    // Set up the aggregation
    const myAggregate = ReferenceRelationship.aggregate(aggregate_options);

    try
    {
        ReferenceRelationship.aggregatePaginate(myAggregate,options,function (err, referenceRelationship) {
            if (err)
            {
                errMessage = '{ "Reference Relationship": { "message" : "Reference relationship is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Got reference relationship data successfully.',200,referenceRelationship);
            }
        });
    }   
    catch (err) {
        errMessage = { "Relationship GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new bio
exports.add = function (req, res) {
try
    {
    var referenceRelationship = new ReferenceRelationship();
    referenceRelationship.relationship_name = req.body.relationship_name;
    referenceRelationship.isactive = req.body.isactive? req.body.isactive: 1 ;

    //Save and check error
    referenceRelationship.save(function (err) {
        if (err)
        {
            errMessage = '{ "Reference Relationship": { "message" : "Reference relationship is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Reference relationship save successfully.',200,referenceRelationship);
        }
    });
    } catch (err) {
    errMessage = { "Reference relationship GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View JobSkill
exports.view = function (req, res) {
    try
    {
        ReferenceRelationship.findById(req.params.relationshipId, function (err, referenceRelationship) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Reference relationship is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Reference relationship found successfully.',200,referenceRelationship);
        }
    });
    } catch (err) {
    errMessage = { "Reference Relationship GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update JobSkill
exports.update = function (req, res) {
    try
    {
        ReferenceRelationship.findById(req.params.relationshipId, function (err, referenceRelationship) {
        
            referenceRelationship.relationship_name = req.body.relationship_name;
            referenceRelationship.isactive = req.body.isactive? req.body.isactive: 1 ;

        //Save and check error
        referenceRelationship.save(function (err) {
        if (err)
        {
            errMessage = '{ "Reference Relationship": { "message" : "Reference relationship is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Reference relationship updated successfully.',200,referenceRelationship);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Reference Relationship Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};