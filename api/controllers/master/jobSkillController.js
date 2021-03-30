const _ = require('lodash');
JobSkill = require('../../models/master/JobSkillModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For index
exports.index = function (req, res) {
try
    {

    JobSkill.find(function (err, JobSkill) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Job skill is not getting data!!"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Got Job skill data successfully.',200,JobSkill);
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
    var jobSkill = new JobSkill();
    jobSkill.jobskill_name = req.body.jobskill_name;
    jobSkill.order = req.body.order;
    jobSkill.isactive = req.body.isactive? req.body.isactive: 1 ;

    //Save and check error
    jobSkill.save(function (err) {
        if (err)
        {
            errMessage = '{ "Job Skill": { "message" : "Job skill is not save."} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Job skill save successfully.',200,jobSkill);
        }
    });
    } catch (err) {
    errMessage = { "Job Question GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
