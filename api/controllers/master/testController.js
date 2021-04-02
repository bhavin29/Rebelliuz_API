const _ = require('lodash');
const Test = require('../../models/master/testModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.index = async function (req, res) {
    let aggregate_options = [];

    //PAGINATION
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;

    //set the options for pagination
    const options = {
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'test'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.test_title = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"test_title": sortOrder}});


    // Set up the aggregation
    const myAggregate = Test.aggregate(aggregate_options);

    try
    {
        Test.aggregatePaginate(myAggregate,options,function (err, Test) {
            if (err)
            {
                errMessage = '{ "Test": { "message" : "Test is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Test data successfully.',200,Test);
            }
        });
    }   
    catch (err) {
        errMessage = { "Test GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new test
exports.add = function (req, res) {
    try
        {
         var test = new Test();
         test.test_title = req.body.test_title;
         test.test_subtitle = req.body.test_subtitle;
         test.isactive = req.body.isactive;
    
        //Save and check error
        test.save(function (err) {
            if (err)
            {
                errMessage = '{ "Test": { "message" : "Test is not save"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Test save successfully.',200,test);
            }
        });
        } catch (err) {
        errMessage = { "Test GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View Test
exports.view = function (req, res) {
    try
    {
        Test.findById(req.params.testId, function (err, Test) {
        if (err)
        {
            errMessage = '{ "Test": { "message" : "Test is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Test found successfully.',200,Test);
        }
    });
    } catch (err) {
    errMessage = { "Test GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update Test
exports.update = function (req, res) {
    try
    {
        Test.findById(req.params.testId, function (err, test) {

            test.test_title = req.body.test_title;
            test.test_subtitle = req.body.test_subtitle;
            test.isactive = req.body.isactive;

        //Save and check error
        test.save(function (err) {
        if (err)
        {
            errMessage = '{ "Test": { "message" : "Test is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Test updated successfully.',200,test);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Test Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}