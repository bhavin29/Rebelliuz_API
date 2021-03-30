const config = require('../config/appconfig');
const util = require("util");
const path = require('path');
const mime = require('mime-types');
const multer = require("multer");
const stringCode = require('./stringUtil');
const maxSize = 2 * 1024 * 1024;
const Logger = require('./logger');
const logger = new Logger();
//config.general.content_path

let storage = multer.diskStorage({
  destination: (req, file, cb) => {

    logger.log('A4','info');
    cb(null,  config.general.content_path + "/users/answer/");
 
    logger.log('A5','info');
  },
  filename: (req, file, cb) => {
    global.video_filename = stringCode.generateString() + "_" + Date.now() + '.' + mime.extension(file.mimetype);
    console.log(global.video_filename);
    cb(null, global.video_filename);
  },
});

let uploadFileAnswer = multer({
  
  storage: storage,
  limits: { fileSize: maxSize },

  limits: async function (req, file, callback) {
    if (req.file.fileSize > 2*1024*1024)
    {
      return callback(new Error('File size exceed'));
    }
    callback(null, true); 
    
  logger.log('A1','info');
 
  },

  fileFilter: async function (req, file, callback) {
    var ext = mime.extension(file.mimetype);
    if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'mp4') {
 
      logger.log('A2','info');
      return callback(new Error('Only images and mp4 are allowed'));
    }
    
  logger.log('A13','info');
 
    callback(null, true); 
  },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFileAnswer);

module.exports = uploadFileMiddleware;

