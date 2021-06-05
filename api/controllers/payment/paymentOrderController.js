//var paypal = require('paypal-rest-sdk');
const _ = require('lodash');
const config = require('../../../config/appconfig');
const PaymentOrder = require('../../models/paymentOrderModel');
const PaymentSubscription = require('../../models/paymentSubscriptionModel');
const PaymentTransaction = require('../../models/paymentTransactionModel');
const PaymentPackage = require('../../models/master/paymentPackageModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For creating new PaymentPackage
exports.update = function (req, res) {
    try
    {
        PaymentOrder.findById(req.body.order_id, function (err, paymentOrder) {
            if (err)
            {
                errMessage = '{ "Payment Order": { "message" : "Payment order is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                if (paymentOrder != null){
    
                    paymentOrder.secondary_status =    req.body.secondary_status; 
    
                    requestHandler.sendSuccess(res,'Payment order update successfully.',200,paymentOrder);
                }
                else{
                    requestHandler.sendSuccess(res,'Payment order no data found.',200,paymentOrder);
                }
                
            }
        });
    } catch (err) {
        errMessage = { "Payment Order GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
    
    
    //For creating new PaymentPackage
exports.add = function (req, res) {
    try
    {
        //payment_packages
        PaymentPackage.findById(req.body.payment_package_id, function (err, paymentPackage) {
            if (err)
            {
                errMessage = '{ "Package": { "message" : "Pacagke have problem."} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                if (paymentPackage){
                    AddPaymentOrder(req,res,paymentPackage);
                }
                else
                {
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: Package not found.','');
                }
            }
        });
    } catch (err) {
        errMessage = { "Payment Subscription GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

AddPaymentOrder = function(req,res,paymentPackage){
    try
    {
    
    var gateway_id='';
    if (paymentPackage.currency == "INR"){
        gateway_id = config.gateway.cc_avenue;
     }
     else if (paymentPackage.currency == "AUD"){
        gateway_id = config.gateway.pay_pal;
     }

     var paymentOrder = new PaymentOrder();
     paymentOrder.module = req.body.module;
     paymentOrder.user_id = req.body.user_id;
     paymentOrder.business_id = req.body.business_id;
     paymentOrder.payment_package_id = req.body.payment_package_id;
     paymentOrder.payment_gateway_id = gateway_id;
     paymentOrder.status = 1;
     paymentOrder.notes = req.body.notes;
     paymentOrder.created_by = global.decoded._id;
     paymentOrder.isactive = 1;

    //Save and check error
    paymentOrder.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Order": { "message" : "Payment order is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            AddPaymentSubscription(req,res,paymentOrder,paymentPackage,gateway_id);
        }
    });
    } catch (err) {
    errMessage = { "Payment Order GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}

AddPaymentSubscription = function(req,res,paymentOrder,paymentPackage,gateway_id){
    try
    {
     var paymentSubscription = new PaymentSubscription();
     paymentSubscription.module = req.body.module;
     paymentSubscription.user_id = req.body.user_id;
     paymentSubscription.business_id = req.body.business_id;
     paymentSubscription.payment_package_id = req.body.payment_package_id;
     paymentSubscription.payment_gateway_id = gateway_id;
     paymentSubscription.payment_order_id = paymentOrder._id;
     paymentSubscription.payment_date = "";
     paymentSubscription.status = 1;
     paymentSubscription.notes = req.body.notes;
     paymentSubscription.created_by = global.decoded._id;
     paymentSubscription.isactive = 1;

    //Save and check error
    paymentSubscription.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Subscription": { "message" : "Payment subscription is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            AddPaymentTransaction(req,res,paymentOrder,paymentSubscription,paymentPackage,gateway_id);
        }
    });
    } catch (err) {
    errMessage = { "Payment Subscription GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}

AddPaymentTransaction = function(req,res,paymentOrder,paymentSubscription,paymentPackage,gateway_id){
    try
    {
     var paymentTransaction = new PaymentTransaction();
     paymentTransaction.module = req.body.module;
     paymentTransaction.user_id = req.body.user_id;
     paymentTransaction.business_id = req.body.business_id;
     paymentTransaction.payment_package_id = req.body.payment_package_id;
     paymentTransaction.payment_gateway_id = gateway_id;
     paymentTransaction.payment_order_id = paymentOrder._id;
     paymentTransaction.payment_date = "";
     paymentTransaction.status = 1;
     paymentTransaction.notes = req.body.notes;

     paymentTransaction.amount = paymentPackage.price;
     paymentTransaction.currency = paymentPackage.currency;
     
     paymentTransaction.params = "";
     paymentTransaction.file_id = "";     
     paymentTransaction.created_by = global.decoded._id;
     paymentTransaction.isactive = 1;

    //Save and check error
    paymentTransaction.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Transaction": { "message" : "Payment transaction is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            data = { 
                "paymentPackage" : paymentPackage,
                "paymentOrder" : paymentOrder,
                "paymentSubscription" : paymentSubscription,
                "paymentTransaction" : paymentTransaction
            }; 
            requestHandler.sendSuccess(res,'Payment details save successfully.',200,data);
        }
    });
    } catch (err) {
    errMessage = { "Payment Transaction GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}

// View Payment Order
exports.view = function (req, res) {
    try
    {
        PaymentOrder.findById(req.params.paymentOrderId, function (err, PaymentOrder) {
        if (err)
        {
            errMessage = '{ "Payment Order": { "message" : "Payment order is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            if (PaymentOrder != null){
                requestHandler.sendSuccess(res,'Payment order found successfully.',200,PaymentOrder);
            }
            else{
                requestHandler.sendSuccess(res,'Payment order no data found.',200,PaymentOrder);
            }
            
        }
    });
    } catch (err) {
    errMessage = { "Payment Order GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//Paypal webhook
exports.webhooks = function(req, res) {
    try
    {

    logger.log('STATUS: ' + res.statusCode,'info');
    logger.log('HEADERS: ' + JSON.stringify(res.headers),'info');
    logger.log('BODY: ' + JSON.stringify(req.body),'info');
 
    var order_id = '60b5eb6c7450b2977006e1ea';
    var status=0;    
    if (req.body.event_type == 'PAYMENT.AUTHORIZATION.CREATED')
    {
        status=2;
        UpdatePaymentOrder(req,res,order_id,status)
    }
    else if (req.body.event_type == 'PAYMENT.CAPTURE.DENIED'){
        status=3;
        UpdatePaymentOrder(req,res,order_id,status)
    }
    else{
        requestHandler.sendError(req,res, 500, 'Somthing went worng: No data found','');
    }
  }
  catch (err) {
    errMessage = { "Payment Order GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

UpdatePaymentOrder = function(req, res,order_id,status) {
    PaymentOrder.findById(order_id, function (err, paymentOrder) {

        paymentOrder.status  = status;
        paymentOrder.save(function (err) {
            if (err)
            {
                errMessage = '{ "Payment Order": { "message" : "paymentOrder is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                UpdatePaymentSubscription(req, res,order_id,status,paymentOrder);
            }
        });
    });
}

UpdatePaymentSubscription = function(req, res,order_id,status,paymentOrder) {

    PaymentSubscription.findOne({ payment_order_id : order_id} , 
        function (err, paymentSubscription) {

        if(paymentSubscription)
        {    
            paymentSubscription.status  = status;

            var myDateString = Date();
            paymentSubscription.payment_date =new Date();

            paymentSubscription.save(function (err) {
                if (err)
                {
                    errMessage = '{ "Payment Subscription": { "message" : "Payment Subscription is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else
                {
                    UpdatePaymentTransaction(req, res,order_id,status,paymentOrder,paymentSubscription);
                }
            });
        }
        else
        {
            requestHandler.sendError(req,res, 422, 'Somthing went worng: Subscription not foud' ,'');
        }    
    });
}

UpdatePaymentTransaction = function(req, res,order_id,status,paymentOrder,paymentSubscription) {

    PaymentTransaction.findOne({ payment_order_id : order_id} , function (err, paymentTransaction) {
        if(paymentSubscription)
        {    
            paymentTransaction.params = JSON.stringify(req.body);
            paymentTransaction.file_id = req.body.id;
            paymentTransaction.status  = status;
            paymentTransaction.payment_date =new Date();

            paymentTransaction.save(function (err) {
            if (err)
            {
                errMessage = '{ "Payment Transaction": { "message" : "Payment Transaction is not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                if (status == 2){
                    requestHandler.sendSuccess(res,' Payment Created Sucessfully.',200,paymentTransaction);
                }
                else if (status == 3){
                    requestHandler.sendSuccess(res,' Payment is Delcianed .',422,paymentTransaction);
                }
                else{
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: Please Contact Admin.','');
                }
            }
            });
        }
        else
        {
            requestHandler.sendError(req,res, 422, 'Somthing went worng: Transaction not foud' ,'');
        }               
    });
}

/*
payment_date
amount
currency
*/