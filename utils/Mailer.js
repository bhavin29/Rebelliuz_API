const path = require("path");
var nodemailer = require('nodemailer');
const async = require('async');
const config = require('../config/appconfig');
const Logger = require('../utils/logger');
var fs = require('fs');

const logger = new Logger();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'user',
      pass: 'pass'
   }
});

// send email
transporter.sendMail({
    from: 'from_address@example.com',
    to: 'p.bhavin29@gmail.com',
    bcc : config.mailer.bcc_mail,
    subject: 'Test Email Subject',
    html: '<h1>Example HTML Message Body</h1>'
});

module.exports = 
{
    async sendEmail({ from, to, bcc, subject, html }) {
        const transporter = nodemailer.createTransport(config.smtpOptions);
        try{
        await transporter.sendMail({ from, to, bcc, subject, html });
    }
    catch(e) {
        console.log('Catch an error: ', e)
        logger.log(`Mailer  error : ${e}`, 'info');
      }
    }  
}

