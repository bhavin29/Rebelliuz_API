//var paypal = require('paypal-rest-sdk');
const _ = require('lodash');
const PaymentOrder = require('../../models/paymentOrderModel');
const PaymentSubscription = require('../../models/paymentSubscriptionModel');
const PaymentTransaction = require('../../models/paymentTransactionModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For creating new PaymentPackage
exports.add = function (req, res) {
try
    {
     var paymentOrder = new PaymentOrder();
     paymentOrder.module = req.body.module;
     paymentOrder.user_id = req.body.user_id;
     paymentOrder.business_id = req.body.business_id;
     paymentOrder.payment_package_id = req.body.payment_package_id;
     paymentOrder.payment_gateway_id = req.body.payment_gateway_id;
     paymentOrder.status = req.body.status;
     paymentOrder.notes = req.body.notes;
     paymentOrder.created_by = global.decoded._id;
     paymentOrder.isactive = req.body.isactive;

    //Save and check error
    paymentOrder.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Order": { "message" : "Payment order is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            AddPaymentSubscription(req,res,paymentOrder);
        }
    });
    } catch (err) {
    errMessage = { "Payment Order GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

AddPaymentSubscription = function(req,res,paymentOrder){
    try
    {
     var paymentSubscription = new PaymentSubscription();
     paymentSubscription.module = req.body.module;
     paymentSubscription.user_id = req.body.user_id;
     paymentSubscription.business_id = req.body.business_id;
     paymentSubscription.payment_package_id = req.body.payment_package_id;
     paymentSubscription.payment_gateway_id = req.body.payment_gateway_id;
   //  paymentSubscription.gateway_profile_id = req.body.gateway_profile_id;
  //   paymentSubscription.payment_date = req.body.payment_date;
  //   paymentSubscription.expiration_date = ''req.body.expiration_date'';
     paymentSubscription.status = req.body.status;
     paymentSubscription.notes = req.body.notes;
     paymentSubscription.created_by = global.decoded._id;
     paymentSubscription.isactive = req.body.isactive;

    //Save and check error
    paymentSubscription.save(function (err) {
        if (err)
        {
            errMessage = '{ "Payment Subscription": { "message" : "Payment subscription is not save"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            AddPaymentTransaction(req,res,paymentOrder,paymentSubscription);
        }
    });
    } catch (err) {
    errMessage = { "Payment Subscription GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}

AddPaymentTransaction = function(req,res,paymentOrder,paymentSubscription){
    try
    {
     var paymentTransaction = new PaymentTransaction();
     paymentTransaction.module = req.body.module;
     paymentTransaction.user_id = req.body.user_id;
     paymentTransaction.business_id = req.body.business_id;
     paymentTransaction.payment_package_id = req.body.payment_package_id;
     paymentTransaction.payment_gateway_id = req.body.payment_gateway_id;
     paymentTransaction.payment_order_id = paymentOrder._id;
   //  paymentTransaction.payment_date = req.body.payment_date;
     paymentTransaction.status = req.body.status;
     paymentTransaction.notes = req.body.notes;
   //  paymentTransaction.gateway_transaction_id = req.body.gateway_transaction_id;
     paymentTransaction.amount = 50; // Amount need to save from master as per pacakge_id
     paymentTransaction.currency = "A$";
     paymentTransaction.params = req.body.params;
     paymentTransaction.file_id = req.body.file_id;     
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

exports.webhooks = function(req, res) {
    try
    {
     /*   var clientId = 'YOUR APPLICATION CLIENT ID';
        var secret = 'YOUR APPLICATION SECRET';

        paypal.configure({
            'mode': 'sandbox', //sandbox or live
            'client_id': clientId,
            'client_secret': secret
        });


    gateway.webhookNotification.parse(
      req.body.bt_signature,
      req.body.bt_payload,
      (err, webhookNotification) => {

        if (err)
        {
            errMessage = '{ "Paypal": { "message" : "Paypal err"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        console.log("[Webhook Received " + webhookNotification.timestamp + "] | Kind: " + webhookNotification.kind);
  
        // Example values for webhook notification properties
        this.logger.log(" Paypal Kind:" + webhookNotification.kind, 'push data');
        this.logger.log(" Paypa timestampa:" + webhookNotification.timestamp, 'push data');
  
        console.log(webhookNotification.kind); // "subscriptionWentPastDue"
        console.log(webhookNotification.timestamp); // Sun Jan 1 00:00:00 UTC 2012
        requestHandler.sendSuccess(res,'Paypal.',200,webhookNotification);
        

    });*/
    console.log(res);
    requestHandler.sendSuccess(res,'Payment .',200,null);
 
    } catch (err) {
    errMessage = { "Payment Order GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };
