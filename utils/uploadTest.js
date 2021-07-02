const config = require('../config/appconfig');
const util = require("util");
const mime = require('mime-types');
const multer = require("multer");
const stringCode = require('./stringUtil');
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null,  config.general.content_path + "/users/test/");
    },
  filename: (req, file, cb) => {
    global.test_filename = stringCode.generateString() + "_" + Date.now() + '.' + mime.extension(file.mimetype);
    cb(null, global.test_filename);
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
    if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
        return callback(new Error('Only docuemtn and picture are allowed'));
    }
    callback(null, true); 
  },
}).single("file");

let uploadTest = util.promisify(uploadFile);

module.exports = uploadTest;

