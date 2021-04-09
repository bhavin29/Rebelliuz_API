'use strict';

// Import mongoose 
const mongoose = require("mongoose");

// Import bcryptjs - for password hashing
const bcrypt = require('bcryptjs');

// Declare schema and assign Schema class
const Schema = mongoose.Schema;

// Create Schema Instance for Bussines_Admin_UserSchema and add properties
const BussinesSchema = new Schema({
    page_id: { type: Number, default: 0 },
    owner_id: { type: Number, default: 0 },
    resource_type: { type: Number, default: 0 },
    resource_id: { type: Number, default: 0 },
    parent_id: { type: Number, default: 0 },
    title: { type: String },
    description: { type: String },
    custom_url: { type: String },
    category_id: { type: Number, default: 0 },
    subcat_id: { type: Number, default: 0 },
    subsubcat_id: { type: Number, default: 0 },
    pagestyle: { type: Number, default: 0 },
    overview: { type: String },
    photo_id: { type: Number, default: 0 },
    cover: { type: String },
    location: { type: String },
    venue_name: { type: String },
    price: { type: Number, default: 0 },
    price_type: { type: Number, default: 0 },
    show_adult: { type: Number, default: 0 },
    enable_lock: { type: Number, default: 0 },
    page_password: { type: String },
    networks: { type: String },
    can_join: { type: Number, default: 0 },
    member_title_singular: { type: String },
    member_title_plural: { type: String },
    other_tag: { type: Number, default: 0 },
    can_invite: { type: Number, default: 0 },
    cover_position: { type: Number, default: 0 },
    background_photo_id: { type: Number, default: 0 },
    search: { type: Number, default: 0 },
    draft: { type: Number, default: 0 },
    view_privacy: { type: String },
    auto_approve: { type: Number, default: 0 },
    page_contact_name: { type: String },
    page_contact_email: { type: String },
    page_contact_phone: { type: String },
    page_contact_website: { type: String },
    page_contact_facebook: { type: String },
    page_contact_twitter: { type: String },
    page_contact_linkedin: { type: String },
    page_contact_instagram: { type: String },
    page_contact_pinterest: { type: String },
    seo_title: { type: String },
    seo_keywords: { type: String },
    seo_description: { type: String },
    view_count: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
    favourite_count: { type: Number, default: 0 },
    follow_count: { type: Number, default: 0 },
    member_count: { type: Number, default: 0 },
    featured: { type: Number, default: 0 },
    sponsored: { type: Number, default: 0 },
    hot: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    is_approved: { type: Number, default: 0 },
    approval: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    offtheday: { type: Number, default: 0 },
    startdate: { type: Date, default: Date.now },
    enddate: { type: Date, default: Date.now },
    creation_date: { type: Date, default: Date.now },
    modified_date: { type: Date, default: Date.now },
    rating: { type: Number, default: 0 },
    cool_count: { type: Number, default: 0 },
    funny_count: { type: Number, default: 0 },
    useful_count: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});


// Create and export BussinesSchema model
module.exports = mongoose.model("bussineses", BussinesSchema);
