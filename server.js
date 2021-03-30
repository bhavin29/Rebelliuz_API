const Logger = require('./utils/logger');
const logger = new Logger();
const uuid = require('uuid').v4;
const config = require('./config/appconfig');
const  jwt  =  require('jsonwebtoken');
const express = require('express')
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const cors = require('cors');
const mongoose = require('mongoose');

//connect to mongoose
const dbPath = config.db.dbPath;

/*
var uri = dbPath;

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
  logger.log('MongoDB database connection established successfully', 'info');
});
*/

const options = {useNewUrlParser: true, useUnifiedTopology: true}//, keepAlive: true, keepAliveInitialDelay: 300000, useCreateIndex: true}
const mongo = mongoose.connect(dbPath, options);

mongo.then(() => {
    console.log('connected');
    logger.log('DB connected', 'info');
}, error => {
    console.log(error, 'error');
    logger.log(error, 'error');
});

var db=mongoose.connection;

//Check DB Connection
if (!db)
{
    logger.log('Error connecting db', 'info');
    console.log("Error connecting db");
}
else
{
    console.log("DB Connected Successfully");
    logger.log('DB connected Successfully', 'info');
}


//directory page as global
global.__basedir = __dirname;

let app = express();

//Enabled CROS
app.use(cors());

//Import routes
let apiRoutes = require("./api/routes/routes")

app.use('/videointro', express.static(config.general.content_path + '/Users/intro'));
app.use('/jobcv', express.static(config.general.content_path + '/Users/jobcv'));
app.use('/videoanswer', express.static(config.general.content_path + '/Users/answers'));

//configure bodyparser to hande the post requests
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Server Port
var port = process.env.PORT || config.app.port;
//

// Welcome message
app.get('/', (req, res) => res.send('Welcome to Express'));

//Use API routes in the App
app.use('/api', apiRoutes)

// Token Verification 
app.use((req, res, next) => {
    req.identifier = uuid();
    const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
    logger.log(logString, 'info');

    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1], 'vasturebelliuzhsepur', (err, decode) => {
    if (err) req.user = undefined;
    req.user = decode;
    next();
        });
    } else {
req.user = undefined;
next();
    }
});

// Launch app to the specified port
app.listen(port, function() {
    console.log("Running Rebelliuz API on Port "+ port);
});