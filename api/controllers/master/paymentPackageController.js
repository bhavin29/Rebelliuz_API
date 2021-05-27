const _ = require('lodash');
const PaymentPackage = require('../../models/master/paymentPackageModel');
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
            docs: 'paymentPackage'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.title = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"title": sortOrder}});


    // Set up the aggregation
    const myAggregate = PaymentPackage.aggregate(aggregate_options);

    try
    {
        PaymentPackage.aggregatePaginate(myAggregate,options,function (err, PaymentPackage) {
            if (err)
            {
                errMessage = '{ "Payment Package": { "message" : "Payment package is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Payment package data successfully.',200,PaymentPackage);
            }
        });
    }   
        catch (err) {
        errMessage = { "Payment Package GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new PaymentPackage
exports.add = function (req, res) {
try
    {
     var paymentPackage = new PaymentPackage();
     paymentPackage.country_id = req.body.country_id;
     paymentPackage.module = req.body.module;
     paymentPackage.title = req.body.title;
     paymentPackage.description = req.body.description;
     paymentPackage.item_count = req.body.item_count;
     paymentPackage.duration = req.body.duration;
     paymentPackage.duration_type = req.body.duration_type;
     paymentPackage.price = req.body.price;
     paymentPackage.currency = req.body.currency;
     paymentPackage.renew_link_days = req.body.renew_link_days;
     paymentPackage.is_renew_link = req.body.is_renew_link;
     paymentPackage.recurrence_type = req.body.recurrence_type;
     paymentPackage.recurrence = req.body.recurrence;
     paymentPackage.params = req.body.params;
     paymentPackage.custom_fields = req.body.custom_fields;
     paymentPackage.custom_fields_params = req.body.custom_fields_params;
     paymentPackage.highlight = req.body.highlight;
     paymentPackage.order = req.body.order;
     paymentPackage.created_by = global.decoded._id;
     paymentPackage.isactive = req.body.isactive;

    //Save and check error
    paymentPackage.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Package": { "message" : "Payment package is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Payment package save successfully.',200,paymentPackage);
        }
    });
    } catch (err) {
    errMessage = { "Payment Package GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View Payment Package
exports.view = function (req, res) {
    try
    {
        PaymentPackage.findById(req.params.paymentPackageId, function (err, PaymentPackage) {
        if (err)
        {
            errMessage = '{ "Payment Package": { "message" : "Payment package is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            if (PaymentPackage != null){
                requestHandler.sendSuccess(res,'Payment package found successfully.',200,PaymentPackage);
            }
            else{
                requestHandler.sendSuccess(res,'Payment package no data found.',200,PaymentPackage);
            }
            
        }
    });
    } catch (err) {
    errMessage = { "Payment Package GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update PaymentPackage
exports.update = function (req, res) {
    try
    {
        PaymentPackage.findById(req.params.paymentPackageId, function (err, paymentPackage) {

        if (paymentPackage != null)
        {   
            paymentPackage.country_id = req.body.country_id;
            paymentPackage.module = req.body.module;
            paymentPackage.title = req.body.title;
            paymentPackage.description = req.body.description;
            paymentPackage.item_count = req.body.item_count;
            paymentPackage.duration = req.body.duration;
            paymentPackage.duration_type = req.body.duration_type;
            paymentPackage.price = req.body.price;
            paymentPackage.currency = req.body.currency;
            paymentPackage.renew_link_days = req.body.renew_link_days;
            paymentPackage.is_renew_link = req.body.is_renew_link;
            paymentPackage.recurrence_type = req.body.recurrence_type;
            paymentPackage.recurrence = req.body.recurrence;
            paymentPackage.params = req.body.params;
            paymentPackage.custom_fields = req.body.custom_fields;
            paymentPackage.custom_fields_params = req.body.custom_fields_params;
            paymentPackage.highlight = req.body.highlight;
            paymentPackage.order = req.body.order;
            paymentPackage.isactive = req.body.isactive;

            //Save and check error
            paymentPackage.save(function (err) {
            if (err)
            {
                errMessage = '{ "Payment Package": { "message" : "Payment package is not updated"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Payment package updated successfully.',200,paymentPackage);
            }
        });
        }
        else
        {
            requestHandler.sendError(req,res, 422, 'No data found.');
        }    
    });
    }
    catch (err) {
    errMessage = { "Payment Package Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}