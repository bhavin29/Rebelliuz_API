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
    owner_id: { type: Number, default: 0 }, //user_id from users
    resource_type: { type: Number, default: 0 },
    resource_id: { type: Number, default: 0 },
    parent_id: { type: Number, default: 0 },
    title: { type: String , default: ''},
    description: { type: String, default: '' },
    custom_url: { type: String , default: ''},
    category_id: { type: Number, default: 0 },
    subcat_id: { type: Number, default: 0 },
    subsubcat_id: { type: Number, default: 0 },
    pagestyle: { type: Number, default: 0 },
    overview: { type: String , default: ''},
    photo_id: { type: Number, default: 0 },
    cover: { type: String , default: ''},
    location: { type: String, default: '' },
    venue_name: { type: String , default: ''},
    price: { type: Number, default: 0 },
    price_type: { type: Number, default: 0 },
    show_adult: { type: Number, default: 0 },
    enable_lock: { type: Number, default: 0 },
    page_password: { type: String , default: ''},
    networks: { type: String , default: ''},
    can_join: { type: Number, default: 0 },
    member_title_singular: { type: String , default: ''},
    member_title_plural: { type: String, default: ''},
    other_tag: { type: Number, default: 0 },
    can_invite: { type: Number, default: 0 },
    cover_position: { type: Number, default: 0 },
    background_photo_id: { type: Number, default: 0 },
    search: { type: Number, default: 0 },
    draft: { type: Number, default: 0 },
    view_privacy: { type: String , default: ''},
    auto_approve: { type: Number, default: 0 },
    page_contact_name: { type: String , default: ''},
    page_contact_email: { type: String , default: ''},
    page_contact_phone: { type: String, default: '' },
    page_contact_website: { type: String, default: ''},
    page_contact_facebook: { type: String, default: '' },
    page_contact_twitter: { type: String , default: ''},
    page_contact_linkedin: { type: String , default: ''},
    page_contact_instagram: { type: String , default: ''},
    page_contact_pinterest: { type: String , default: ''},
    seo_title: { type: String , default: ''},
    seo_keywords: { type: String , default: ''},
    seo_description: { type: String , default: ''},
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
    business_location :{ type: String , default: ''},
    business_city :{ type: String , default: ''},
    business_state :{ type: String , default: ''},
    business_zipcode :{ type: String , default: ''},
    business_country :{ type: Schema.Types.ObjectId,ref: 'countries'},
    business_latitude :{ type: String , default: ''},
    business_longitude :{ type: String , default: ''},
    created_on: { type: Date, default: Date.now },
    created_by: { type: Number, default: 0 }
});


// Create and export BussinesSchema model
module.exports = mongoose.model("bussineses", BussinesSchema);
