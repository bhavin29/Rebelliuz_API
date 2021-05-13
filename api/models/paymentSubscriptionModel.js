'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema Instance for User and add properties
const  PaymentSubscriptionSchema = new  Schema({
    module: { type: String, trim:true, required:  true },
    user_id: { type: String, trim:true},
    business_id: { type: String, trim:true, required:  true },
    payment_package_id: { type: String, required:  true },
    payment_gateway_id: { type: Number, required:  true },
    gateway_profile_id: { type: Number, default: 0 },
    payment_date: { type: Number, default: 0 },
    expiration_date: { type: Number, default: 0 },
    status: { type: Number, required:  true },
    isactive: { type: Number, required:  true },
    notes: { type: String },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 },
    modified_on: { type: Date },
    modified_by: { type: Number }
});

PaymentSubscriptionSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("payment_subscriptions", PaymentSubscriptionSchema);

//status - 1: pending, 2: completed