const _ = require('lodash');
const PaymentGateway = require('../../models/master/paymentGatewayModel');
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
            docs: 'paymentGateway'
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
    const myAggregate = PaymentGateway.aggregate(aggregate_options);

    try
    {
        PaymentGateway.aggregatePaginate(myAggregate,options,function (err, PaymentGateway) {
            if (err)
            {
                errMessage = '{ "Payment Gateway": { "message" : "Payment gateway is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Payment gateway data successfully.',200,PaymentGateway);
            }
        });
    }   
        catch (err) {
        errMessage = { "Payment Gateway GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new PaymentGateway
exports.add = function (req, res) {
try
    {
     var paymentGateway = new PaymentGateway();
     paymentGateway.title = req.body.title;
     paymentGateway.description = req.body.description;
     paymentGateway.config = req.body.config;
     paymentGateway.test_mode = req.body.test_mode;
     paymentGateway.created_by = global.decoded._id;
     paymentGateway.isactive = req.body.isactive;

    //Save and check error
    paymentGateway.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Gateway": { "message" : "Payment gateway is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Payment gateway save successfully.',200,paymentGateway);
        }
    });
    } catch (err) {
    errMessage = { "Payment Gateway GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View Payment Gateway
exports.view = function (req, res) {
    try
    {
        PaymentGateway.findById(req.params.paymentGatewayId, function (err, PaymentGateway) {
        if (err)
        {
            errMessage = '{ "Payment Gateway": { "message" : "Payment gateway is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            if (PaymentGateway != null){
                requestHandler.sendSuccess(res,'Payment gateway found successfully.',200,PaymentGateway);
            }
            else{
                requestHandler.sendSuccess(res,'Payment gateway no data found.',200,PaymentGateway);
            }
            
        }
    });
    } catch (err) {
    errMessage = { "Payment Gateway GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update PaymentGateway
exports.update = function (req, res) {
    try
    {
        PaymentGateway.findById(req.params.paymentGatewayId, function (err, paymentGateway) {

        if (paymentGateway != null)
        {   
            paymentGateway.title = req.body.title;
            paymentGateway.description = req.body.description;
            paymentGateway.config = req.body.config;
            paymentGateway.test_mode = req.body.test_mode;
            paymentGateway.isactive = req.body.isactive;

            //Save and check error
            paymentGateway.save(function (err) {
            if (err)
            {
                errMessage = '{ "Payment Gateway": { "message" : "Payment gateway is not updated"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Payment gateway updated successfully.',200,paymentGateway);
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
    errMessage = { "Payment Gateway Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}