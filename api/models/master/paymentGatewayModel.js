'use strict';
   
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  PaymentGatewaySchema = new  Schema({
    title: { type: String, unique: true, trim: true, required:  true },
    description: { type: String, unique: true, trim: true, required:  true },
    config: { type: Object, unique: true, trim: true, required:  true },
    test_mode: { type: String, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default: 1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

PaymentGatewaySchema.plugin(aggregatePaginate);

module.exports = mongoose.model("payment_gateways", PaymentGatewaySchema);
