const config = require('../config/appconfig');
const util = require("util");
const path = require('path');
const mime = require('mime-types');
const multer = require("multer");
const stringCode = require('./stringUtil');
const maxSize = 2 * 1024 * 1024;
//config.general.content_path

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null,  config.general.content_path + "/companies/job/");
    },
  filename: (req, file, cb) => {
    global.short_description_file = stringCode.generateString() + "_" + Date.now() + '.' + mime.extension(file.mimetype);
    console.log(global.short_description_file);
    cb(null, global.short_description_file);
  },
});


let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },

  limits: async function (req, file, callback) {
    if (req.file.fileSize > 2*1024*1024)
    {
      return callback(new Error('File size exceed'));
    }
    callback(null, true); 
  },

  fileFilter: async function (req, file, callback) {
    var ext = mime.extension(file.mimetype);
    if(ext !== 'doc' && ext !== 'docx' && ext !== 'pdf' ) {
        return callback(new Error('Only document file are allowed'));
    }
    callback(null, true); 
  },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;

