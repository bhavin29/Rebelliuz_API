const config = require('../../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../../utils/uploadBusinessPhoto.js');
const RunCommand = require('../../../utils/runCommand.js');
const Bussines = require('../../models/bussinesModel');
const User = require('../../models/userModel');
const StorageFile = require('../../models/storageFileModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const updateBusiness = async (req, res) => {
  try {
    const fileName = await new uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const file_id = await StorageFile.find().sort({file_id:-1}).limit(1);

    Bussines.findById(req.params.business_id, function (err, bussines) {

        var storageFile = new StorageFile();
        storageFile.file_id =file_id[0].file_id + 1;
        storageFile.name = req.file.filename;
        storageFile.user_id = bussines.owner_id;
        storageFile.storage_path = req.file.path;
        storageFile.extension = req.file.mimetype;
        storageFile.size = req.file.size;
        
        storageFile.save(function (err) {
            if (err)
            {
                errMessage = '{ "StorageFile": { "message" : "File is not save"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else
            {
                bussines.photo_id = storageFile._id;
                bussines.title = req.body.title;
                bussines.custom_url = req.body.custom_url;
                bussines.seo_keywords = req.body.seo_keywords;
                bussines.category_id = req.body.category_id;
                bussines.description = req.body.description;
                bussines.business_location = req.body.business_location;
                bussines.business_city = req.body.business_city;
                bussines.business_state = req.body.business_state;
                bussines.business_zipcode = req.body.business_zipcode;
                bussines.business_latitude = req.body.business_latitude;
                bussines.business_longitude = req.body.business_longitude;
                bussines.business_country = req.body.business_country;
                bussines.save(function (err) {
                    if (err)
                    {
                        errMessage = '{ "Business": { "message" : "Business is not updated"} }';
                        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        updateProfileStatus(req,res,bussines);
                    }
                });
            }
        });
    });
    }
    catch (err) {
        errMessage = { "Business Update": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

updateProfileStatus = async (req, res,bussines) => {
    const filter = { user_id: bussines.owner_id};
    const update = { profile_status: 1 };
    let doc = await User.findOneAndUpdate(filter, update, {
        new: true
    });
    requestHandler.sendSuccess(res,'Business updated successfully.',200,bussines)
};

module.exports = {
    updateBusiness,
};