const _ = require('lodash');
const Location = require('../../models/master/locationModel');
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
            docs: 'location'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.location_name = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"location_name": sortOrder}});


    // Set up the aggregation
    const myAggregate = Location.aggregate(aggregate_options);

    try
    {
        Location.aggregatePaginate(myAggregate,options,function (err, Location) {
            if (err)
            {
                errMessage = '{ "Location": { "message" : "Location is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Location data successfully.',200,Location);
            }
        });
    }   
        catch (err) {
        errMessage = { "Location GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new Location
exports.add = function (req, res) {
try
    {
     var location = new Location();
     location.country_id = req.body.country_id;
     location.location_name = req.body.location_name;
     location.isactive = req.body.isactive;

    //Save and check error
    location.save(function (err) {
        if (err)
        {
            errMessage = '{ "Location": { "message" : "Location is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Location save successfully.',200,location);
        }
    });
    } catch (err) {
    errMessage = { "Location GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View Location
exports.view = function (req, res) {
    try
    {
        Location.findById(req.params.locationId, function (err, Location) {
        if (err)
        {
            errMessage = '{ "Location": { "message" : "Location is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Location found successfully.',200,Location);
        }
    });
    } catch (err) {
    errMessage = { "Location GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update Location
exports.update = function (req, res) {
    try
    {
        Location.findById(req.params.locationId, function (err, location) {

            location.country_id = req.body.country_id;
            location.location_name = req.body.location_name;
            location.isactive = req.body.isactive;

        //Save and check error
        location.save(function (err) {
        if (err)
        {
            errMessage = '{ "Location": { "message" : "Location is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Location updated successfully.',200,location);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Location Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}