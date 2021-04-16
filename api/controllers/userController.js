const config = require('../../config/appconfig');
const fs = require('fs');
const User = require('../models/userModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// View User 
exports.view = function (req, res) {
    try
    {
        var errMessage = '';
        if ( req.body.email == undefined )
        {
            errMessage = '{ "User": { "message" : "Enter email"} }';
        }
        else if ( req.body.displayname == undefined )
        {
            errMessage = '{ "User": { "message" : "Enter disaply name"} }';
        }
        else if ( req.body.location == undefined )
        {
            errMessage = '{ "User": { "message" : "Enter location"} }';
        }
        else if ( req.body.email == '' &&  req.body.displayname == '' && req.body.location == '' )
        {
            errMessage = '{ "User": { "message" : "Enter data in any one field"} }';
        }
        
        if (errMessage !='')
        {
            requestHandler.sendError(req,res, 422, 'Somthing went worng',JSON.parse(errMessage));
        }
        else
        {
            let aggregate_options = [];

            //PAGINATION
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
        
            //set the options for pagination
            const options = {
                page, limit,
                collation: {locale: 'en'},
                customLabels: {
                    totalDocs: 'Users',
                    docs: 'users'
                }
            };

            var condition = {};
            if ( req.body.email != '' && req.body.email !=undefined ){ 
                condition = condition + {email: new RegExp(req.body.email,"i") };
            }
            if ( req.body.displayname != '' && req.body.displayname !=undefined ){ 
                condition = condition + {displayname: new RegExp(req.body.displayname,"i") };
            }
            if ( req.body.location != '' && req.body.location !=undefined ){ 
                condition = condition + {location: new RegExp(req.body.location,"i") };
            }

            //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
            let match = {
                    $and :[ 
                    {
                        $or: [
                        {email: new RegExp(req.body.email,"i")}, 
                      //  {displayname : new RegExp(req.body.displayname,"i")}, 
                      //  {location: RegExp(req.body.location,"i")} 
                        ]
                    },
                    {
                        email: { $ne: global.decoded.email }
                    } 
                    ]
            };

            //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
            if (req.query.searchText)
            {
                match.email = {$regex: req.query.searchText, $options: 'i'};
            } 
        
            aggregate_options.push({$match: match});
            
            //SORTING -- THIRD STAGE
            let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
            aggregate_options.push({$sort: {"email": sortOrder}});
        
        
            // Set up the aggregation
            const myAggregate = User.aggregate(aggregate_options);

            User.aggregatePaginate(myAggregate,options,function (err, user) {
                if (err)
                {
                    errMessage = '{ "User": { "message" : "User email is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else if (user)
                {
                    requestHandler.sendSuccess(res,'User found successfully.',200,user);
                }
                else
                {
                    errMessage = '{ "User": { "message" : "User is not found"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
                }
        });
   }
    } catch (err) {
    errMessage = { "User GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};