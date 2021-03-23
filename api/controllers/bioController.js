const _ = require('lodash');
const multer = require('multer');
const upload = multer({storage : storage}).single("demo_image");

//Import Bio Model
Bio = require('../models/bioModel');

//import Logger
const Logger = require('../../utils/logger');
const logger = new Logger();

//For index
exports.index = function (req, res) {
    Bio.get(function (err, bio) {
        if (err)
            res.json({
                status: "error",
                message: err
            });

        logger.log('Bio list sucess', 'warn');    
        res.json({
            statuscode : 200,
            status: "success",
            message: "Got Bio Successfully!",
            data: bio       
        });
    });
};

/////////////////////////////////////////////////////

exports.image = function(req, res)  {
    upload(req, res, (err) => {
     if(err) {
       res.status(400).send("Something went wrong!");
     }
     res.send(req.file);
   });
 };

 var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './uploads');    
    }, 
    filename: function (req, file, cb) { 
       cb(null , file.originalname);   
    }
 });


 ////////////////////////////////////////////

//For creating new bio
exports.add = function (req, res) {
    var bio = new Bio();
    bio.name = req.body.name? req.body.name: bio.name;
    bio.email = req.body.email;
    bio.phone = req.body.phone;
    bio.address = req.body.address;

    //Save and check error
    bio.save(function (err) {
        if (err)
            res.json(err);

            res.json({
                statuscode : 200,
                message: "New Bio Added!",
            data: bio
        });
    });
};

// View Bio
exports.view = function (req, res) {
    Bio.findById(req.params.bio_id, function (err, bio) {
        if (err)
            res.send(err);
        res.json({
            message: 'Bio Details',
            data: bio
        });
    });
};

// Update Bio
exports.update = function (req, res) {
    Bio.findById(req.params.bio_id, function (err, bio) {
        if (err)
            res.send(err);
        bio.name = req.body.name ? req.body.name : bio.name;
        bio.email = req.body.email;
        bio.phone = req.body.phone;
        bio.address = req.body.address;

        //save and check errors
        bio.save(function (err) {
            if (err)
                res.json(err)
            res.json({
                message: "Bio Updated Successfully",
                data: bio
            });
        });
    });
};

// Delete Bio
exports.delete = function (req, res) {
    Bio.deleteOne({
        _id: req.params.bio_id
    }, function (err, contact) {
        if (err)
            res.send(err)
        res.json({
            status: "success",
            message: 'Bio Deleted'
        });
    });
};