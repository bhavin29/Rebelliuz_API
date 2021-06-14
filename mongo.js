const mongoose = require('mongoose');
const config = require('./config/appconfig');

//connect to mongoose
const dbPath = config.db.dbPath;

const connectDB = async () =>{
    const conn = await new mongoose(dbPath,
    {
        usenewurlparser:true,
        usecreateindex:true,
        usefindmodify:true,
        useunifiedtropology:true,
        urlencoded:true
    })
}
module.exports = connectDB;