var nodemailer = require('nodemailer');
const async = require('async');
const config = require('../config/appconfig');
const Logger = require('../utils/logger');

const logger = new Logger();

var transporter = nodemailer.createTransport({
  service :"gmail",
  host: "smtp.gmail.com",
  auth :{
      user: config.email.user,
    pass: config.email.pass
  }
});

var mailOptions = {
  from: 'info@hrebelliuz.com',
  to: 'p.bhavin29@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!',
  html: '<b>Welcome?</b>' // html body
};

module.exports.sendMail  = function()
{
  console.log('enter in email' + mailOptions);
 
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      console.log('Message sent: %s', info.messageId);
    }
  })
};
