const config = require('../../config/appconfig');
const fs = require('fs');
const uploadFile = require('../../utils/uploadIntro.js');
const RunCommand = require('../../utils/runCommand.js');
const UserIntro = require('../models/userIntroModel');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//upload and save/update user intro
const upload = async (req, res) => {
  try {
    await new uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    UserIntro.findOne({ email: global.decoded.email},(err,userIntro)=>{
      if (err) throw err;
      if (!userIntro) {
          //insert
          var userintro = new UserIntro();
         
          userintro.userId = global.decoded._id;
          userintro.email = global.decoded.email;
          userintro.vFilename = global.vFilename;

          userintro.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User introdcution is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user introduction: '+ err.errMessage,JSON.parse(errMessage));
            } else {
              var filenamex = config.general.content_path + '\\users\\intro\\' + global.vFilename; 

            //  RunCommand(config.general.ffmpeg_path + 'ffmpeg', '-i ' + filenamex + ' -ss 00:00:04 -vframes 1 -y ' + filenamex.substring(0,filenamex.length -3) +'jpg', 
            //  data => console.log(data), () => console.log('finished'))
              requestHandler.sendSuccess(res,'User introduction file save successfully.',200,userintro);
            }
        });
      }
      else if (userIntro) {
          //save and check errors
          var oldvFilename = userIntro.vFilename;

          try {
            fs.unlinkSync(config.general.content_path + "/users/intro/" + oldvFilename)
            fs.unlinkSync(config.general.content_path + "/users/intro/" + oldvFilename.substring(0,oldvFilename.length-3) + 'jpg')
            //file removed
            } catch(err) {
              console.error(err)
          }
          userIntro.vFilename = global.vFilename;
          userIntro.created_by = 0;
          
          userIntro.save(function (err) {
            if (err){
              errMessage = '{ "intro": { "message" : "User introdcution is not saved!!"} }';
              requestHandler.sendError(req,res, 422, 'Somthing worng with user introduction:' + err.message,JSON.parse(errMessage));
            } else {

             var filenamex = config.general.content_path + '\\users\\intro\\' + global.vFilename; 
	          
            // RunCommand(config.general.ffmpeg_path + 'ffmpeg', '-i ' + filenamex + ' -ss 00:00:04 -vframes 1 -y ' + filenamex.substring(0,filenamex.length -3) +'jpg', 
            //      data => console.log(data), () => console.log('finished'))

             /* RunCommand('c:\\ffmpeg\\bin\\ffmpeg', '-i d:\\1.mp4 -vcodec libx265 -crf 28 d:\\11_output.mp4', 
                  data => console.log(data), () => console.log('finished'))*/
              requestHandler.sendSuccess(res,'User introduction file update successfully.',200,userIntro);
            }
          });
     }
  });
  
  } catch (err) {
    errMessage = { "Fileupload": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Could not upload the file',(errMessage));
  }
};

// View User Intro
view = function (req, res) {
try{
  UserIntro.findOne( { email: global.decoded.email}, function (err, userIntro) {
      if (err){
        errMessage = '{ "intro": { "message" : "No data found."} }';
        requestHandler.sendError(req,res, 422, 'No data for user introduction',JSON.parse(errMessage));
      } else {
        requestHandler.sendSuccess(res,'User introduction Detail.',200,userIntro);
      }
  });
} catch (err) {
  errMessage = { "View": { "message" : err.message } };
  requestHandler.sendError(req,res, 500, 'View user introduction',(errMessage));
}
};

//get file list form the specific folder path
const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

//download
const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  getListFiles,
  download,
  view
};
