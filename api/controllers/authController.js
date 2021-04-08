jwt = require('jsonwebtoken'),
bcrypt = require('bcryptjs');
const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const User = require("../models/userModel");
const UserIntro = require("../models/userIntroModel");
const accessTokenSecret = 'vasturebelliuzhsepur';

// User Register function
 exports.register = (req, res) => {
try{
    let newUser = new User(req.body);
        newUser.hash_password =   bcrypt.hashSync(req.body.password, 10); // req.body.password;
    newUser.save((err, user) => {
    if (err) {
        errMessage = '{ "register": { "message" : "Smothing went worng."} }';
        requestHandler.sendError(req,res, 422, err.message,JSON.parse(errMessage));
    }
    requestHandler.sendSuccess(res,'User register sucessfully in.',200,(user));
    });

} catch (err) {
    errMessage = { "Register": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'User Registration',(errMessage));
  }
  
};


// User Sign function
    exports.signIn = (req, res) => {
try{
    newuserintro =  new UserIntro();       
    UserIntro.findOne({ email: req.body.email},(err, userintro)=>{
        if (err) throw err;

        if(userintro)
        {
            newuserintro = userintro;
        }
        else
        {
            newuserintro = {};
        }
    });

    User.findOne({
    email: req.body.email
    }, (err, user) => {
        if (err) throw err;
            if (!user) {
                errMessage = '{ "password": { "message" : "The email is not valid."} }';
                requestHandler.sendError(req,res, 422, 'Authentication failed. Email not found.',JSON.parse(errMessage));
            }
            else if (user) {
                if (!user.comparePassword(req.body.password)) {  
                    errMessage = '{ "password": { "message" : "The password is not valid."} }';
                    requestHandler.sendError(req,res, 422, 'Authentication failed. Wrong password.',JSON.parse(errMessage));
                } else {
               var sign =  jwt.sign({ email: user.email, displayname : user.displayname, _id: user._id }, accessTokenSecret);
 //               var sign =  jwt.sign({ user }, accessTokenSecret);

                user = JSON.stringify(user);
                user = JSON.parse(user);
                user['userintro'] = JSON.parse(JSON.stringify(newuserintro));
 
                var data = { 
                            "access_token" : sign ,
                            "refresh_token" : "",
                            "expire_time" : "2d",
                            "user" : user,
                            "bussines_id":[]
                    };  
                requestHandler.sendSuccess(res,'User successfully logged in.',200,(data));
            }
       }
    });
  } catch (err) {
    errMessage = { "SignIn": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'User Signin',(errMessage));
  }
};

// User Register function
    exports.loginRequired = (req, res, next) => {
if (req.user) {
res.json({ message: 'Authorized User, Action Successful!'});
next();
    } else {
res.status(401).json({ message: 'Unauthorized user!' });
    }
};

//Test Commit

// authenticate JWT
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};