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
     cb(null,  config.general.content_path + "/member/messages/");
    },
  filename: (req, file, cb) => {
    global.messageFilename = stringCode.generateString() + "_" + Date.now() + '.' + mime.extension(file.mimetype);
    console.log(global.messageFilename);
    cb(null, global.messageFilename);
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
    if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'pdf' && ext !== 'csv' && ext !== 'doc' && ext !== 'xls' && ext !== 'txt') {
        return callback(new Error('Only images,doc,excel,text,csv and pdf are allowed'));
    }
    callback(null, true); 
  },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;

