'use strict';
   
const { Double } = require("bson");
// Import mongoose 
const  mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
// Declare schema and assign Schema class
const  Schema = mongoose.Schema;

// Create Schema add properties
const  PaymentPackageSchema = new  Schema({
    country_id: { type: String, trim: true, required:  true },
    module: { type: Number,  trim: true, required:  true },
    title: { type: String, unique: true, trim: true, required:  true },
    description: { type: String, unique: true, trim: true, required:  true },
    item_count: { type: Number, unique: true, trim: true, required:  true },
    duration: { type: Number, unique: true, trim: true, required:  true },
    duration_type: { type: String, unique: true, trim: true, required:  true },
    price: { type: Number, unique: true, trim: true, required:  true },
    currency: { type: String, required:  true },
    renew_link_days: { type: Number, unique: true, trim: true },
    is_renew_link: { type: String, unique: true, trim: true },
    recurrence_type: { type: String, unique: true, trim: true},
    recurrence: { type: Number, unique: true, trim: true },
    params: { type: Object, unique: true, trim: true },
    custom_fields: { type: Boolean, unique: true, trim: true, required:  true },
    custom_fields_params: { type: Object, unique: true, trim: true, required:  true },
    highlight: { type: Boolean, unique: true, trim: true, required:  true },
    order: { type: Number, unique: true, trim: true, required:  true },
    isactive: { type: Boolean, trim:true, default: 1 } ,
    created_on: { type: Date, default: Date.now },
    created_by: { type: String, default: 0 }
});

PaymentPackageSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("payment_package", PaymentPackageSchema);
//duration_type: month, forever
//module: 1 : user_job, 2:business_job, 3:agency
