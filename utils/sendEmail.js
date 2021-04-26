var nodemailer = require('nodemailer');
const async = require('async');
const config = require('../config/appconfig');
const Logger = require('../utils/logger');

const logger = new Logger();

function sendMailHTML(){

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

var mailOptions = {
  from: 'info@hrebelliuz.com',
  to: 'p.bhavin29@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
})

};
