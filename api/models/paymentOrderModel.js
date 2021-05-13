'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PaymentOrderSchema = new  Schema({
    module: { type: String, trim:true, required:  true },
    user_id: { type: String, trim:true},
    business_id: { type: String, trim:true, required:  true },
    payment_package_id: { type: String, required:  true },
    payment_gateway_id: { type: Number, required:  true },
    status: { type: Number, required:  true },
    notes: { type: String },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 },
});

PaymentOrderSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("payment_orders", PaymentOrderSchema);

//status - 1: pending, 2: completed