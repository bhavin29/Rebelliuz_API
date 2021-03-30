const _ = require('lodash');
JobQuestion = require('../../models/master/jobQuestionModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {
    JobQuestion.find(function (err, jobquestion) {
        if (err)
        {
            errMessage = '{ "Job Question": { "message" : "Job question is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job question data successfully.',200,jobquestion);
        }
    });

    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//For creating new bio
exports.add = function (req, res) {
try
    {
    var jobQuestion = new JobQuestion();
    jobQuestion.job_category_id = req.body.job_category_id;
    jobQuestion.question = req.body.question;
    jobQuestion.short_question = req.body.short_question;
    jobQuestion.order = req.body.order;
    jobQuestion.isactive = req.body.isactive;

    //Save and check error
    jobQuestion.save(function (err) {
        if (err){
            errMessage = '{ "Job Question": { "message" : "Job question is not saved!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
        else
        {    
            requestHandler.sendSuccess(res,'Job question save successfully.',200,jobQuestion);
        }    
    });

    } catch (err) {
    errMessage = { "Job Question Add": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
