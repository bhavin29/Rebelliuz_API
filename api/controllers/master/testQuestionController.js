const _ = require('lodash');
const TestQuestion = require('../../models/master/testQuestionModel');
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
        pagination : false,
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'testQuestion'
        }
    };
    
    //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
    let match = {};

    //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.searchText)
    {
        match.question = {$regex: req.query.searchText, $options: 'i'};
    } 

    aggregate_options.push({$match: match});
    
    //SORTING -- THIRD STAGE
    let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? -1 : 1;
    aggregate_options.push({$sort: {"question": sortOrder}});


    // Set up the aggregation
    const myAggregate = TestQuestion.aggregate(aggregate_options);

    try
    {
        TestQuestion.aggregatePaginate(myAggregate,options,function (err, TestQuestion) {
            if (err)
            {
                errMessage = '{ "Test Question": { "message" : "Test question is not getting data!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Test question data successfully.',200,TestQuestion);
            }
        });
    }   
    catch (err) {
        errMessage = { "Test Question GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new Test Question
exports.add = function (req, res) {
    try
        {
         var testQuestion = new TestQuestion();
         testQuestion.test_id = req.body.test_id;
         testQuestion.question = req.body.question;
         testQuestion.option1 = req.body.option1;
         testQuestion.option2 = req.body.option2;
         testQuestion.option3 = req.body.option3;
         testQuestion.option4 = req.body.option4;
         testQuestion.isactive = req.body.isactive;
    
        //Save and check error
        testQuestion.save(function (err) {
            if (err)
            {
                errMessage = '{ "Test Question": { "message" : "Test question is not save"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                requestHandler.sendSuccess(res,'Test question save successfully.',200,testQuestion);
            }
        });
        } catch (err) {
        errMessage = { "Test Question GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// View Test Question
exports.view = function (req, res) {
    try
    {
        TestQuestion.findById(req.params.testquestionId, function (err, TestQuestion) {
        if (err)
        {
            errMessage = '{ "Test Question": { "message" : "Test question is not found"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Test question found successfully.',200,TestQuestion);
        }
    });
    } catch (err) {
    errMessage = { "Test Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

// Update Test Question
exports.update = function (req, res) {
    try
    {
        TestQuestion.findById(req.params.testquestionId, function (err, testQuestion) {
         testQuestion.test_id = req.body.test_id;
         testQuestion.question = req.body.question;
         testQuestion.option1 = req.body.option1;
         testQuestion.option2 = req.body.option2;
         testQuestion.option3 = req.body.option3;
         testQuestion.option4 = req.body.option4;
         testQuestion.isactive = req.body.isactive;

        //Save and check error
        testQuestion.save(function (err) {
        if (err)
        {
            errMessage = '{ "Test Question": { "message" : "Test question is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Test question updated successfully.',200,testQuestion);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Test Question Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}