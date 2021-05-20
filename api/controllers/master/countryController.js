const _ = require('lodash');
const Country = require('../../models/master/countryModel');
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
            docs: 'country'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.country_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"country_name": sortOrder}});


    // Set up the aggregation
    const myAggregate = Country.aggregate(aggregate_options);

    try
    {
        Country.aggregatePaginate(myAggregate,options,function (err, Country) {
            if (err)
            {
                errMessage = '{ "Country": { "message" : "Country is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Country data successfully.',200,Country);
            }
        });
    }   
        catch (err) {
        errMessage = { "Country GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new Country
exports.add = function (req, res) {
try
    {
     var country = new Country();
     country.country_name = req.body.country_name;
     country.isactive = req.body.isactive;

    //Save and check error
    country.save(function (err) {
        if (err)
        {
            errMessage = '{ "Country": { "message" : "Country is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Country save successfully.',200,country);
        }
    });
    } catch (err) {
    errMessage = { "Job Category GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View country
exports.view = function (req, res) {
    try
    {
        Country.findById(req.params.countryId, function (err, Country) {
        if (err)
        {
            errMessage = '{ "Country": { "message" : "Country is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Country found successfully.',200,Country);
        }
    });
    } catch (err) {
    errMessage = { "Country GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update Country
exports.update = function (req, res) {
    try
    {
        Country.findById(req.params.countryId, function (err, country) {

        country.country_name = req.body.country_name;
        country.isactive = req.body.isactive;

        //Save and check error
        country.save(function (err) {
        if (err)
        {
            errMessage = '{ "Country": { "message" : "Country is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Country updated successfully.',200,country);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Country Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}