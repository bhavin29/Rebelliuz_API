const _ = require('lodash');
const CultureValues = require('../../models/master/cultureValuesModel');
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
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'cultureValues'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.culture_value_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"culture_value_name": sortOrder}});


    // Set up the aggregation
    const myAggregate = CultureValues.aggregate(aggregate_options);

    try
    {
        CultureValues.aggregatePaginate(myAggregate,options,function (err, CultureValues) {
            if (err)
            {
                errMessage = '{ "Culture Values": { "message" : "Culture values is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Culture values data successfully.',200,CultureValues);
            }
        });
    }   
        catch (err) {
        errMessage = { "Culture Values GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new Culture Values
exports.add = function (req, res) {
try
    {
     var cultureValues = new CultureValues();
     cultureValues.culture_value_name = req.body.culture_value_name;
     cultureValues.isactive = req.body.isactive;

    //Save and check error
    cultureValues.save(function (err) {
        if (err)
        {
            errMessage = '{ "Culture Values": { "message" : "Culture values is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Culture values save successfully.',200,cultureValues);
        }
    });
    } catch (err) {
    errMessage = { "Culture values GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View cultureValues
exports.view = function (req, res) {
    try
    {
        CultureValues.findById(req.params.cultureValuesId, function (err, CultureValues) {
        if (err)
        {
            errMessage = '{ "Culture Values": { "message" : "Culture values is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Culture values found successfully.',200,CultureValues);
        }
    });
    } catch (err) {
    errMessage = { "Culture Values GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update CultureValues
exports.update = function (req, res) {
    try
    {
        CultureValues.findById(req.params.cultureValuesId, function (err, cultureValues) {

        cultureValues.culture_value_name = req.body.culture_value_name;
        cultureValues.isactive = req.body.isactive;

        //Save and check error
        cultureValues.save(function (err) {
        if (err)
        {
            errMessage = '{ "Culture Values": { "message" : "Culture values is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Culture values updated successfully.',200,cultureValues);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Culture Values Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}