const Logger = require('./utils/logger');
const logger = new Logger();
const uuid = require('uuid').v4;
const config = require('./config/appconfig');
const  jwt  =  require('jsonwebtoken');
const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

global.__basedir = __dirname;

let app = express();

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

//Import routes
let apiRoutes = require("./api/routes/routes")

//configure bodyparser to hande the post requests
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//connect to mongoose
const dbPath = config.db.dbPath;

const options = {useNewUrlParser: true, useUnifiedTopology: true}
const mongo = mongoose.connect(dbPath, options);

mongo.then(() => {
    console.log('connected');
}, error => {
    console.log(error, 'error');
});
var db=mongoose.connection;

//Check DB Connection
if (!db)
    console.log("Error connecting db");
else
    console.log("DB Connected Successfully");

// Server Port
var port = process.env.PORT || config.app.port;
//

// Welcome message
app.get('/', (req, res) => res.send('Welcome to Express'));

//Use API routes in the App
app.use('/api', apiRoutes)

// Launch app to the specified port
app.listen(port, function() {
    console.log("Running Rebelliuz API on Port "+ port);
});