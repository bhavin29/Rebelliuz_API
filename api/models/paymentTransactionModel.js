'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PaymentTransactionSchema = new  Schema({
    module: { type: String, trim:true, required:  true },
    user_id: { type: String, trim:true},
    business_id: { type: String, trim:true, required:  true },
    payment_package_id: { type: String, required:  true },
    payment_gateway_id: { type: Number, required:  true },
    payment_order_id: { type: Number, required:  true },
    payment_date: { type: Date },
    status: { type: Number, required:  true },
    notes: { type: String },
    gateway_transaction_id: { type: String },
    amount: { type: Long, required:  true },
    currency: { type: String, required:  true },
    params: { type: Object },
    file_id: { type: Object },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 },
    modified_on: { type: Date },
    modified_by: { type: Number }
});

PaymentTransactionSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("payment_transactions", PaymentTransactionSchema);

//status - 1: sucess 2: decliened