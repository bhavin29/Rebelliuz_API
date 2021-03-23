//initialize express router
let router = require('express').Router();

//set default API response
router.get('/', function(req, res) {
    res.json({
        status: 'API Works',
        message: 'Welcome to FirstRest API'
    });
});

//Import Bio Controller
var bioController = require('../controllers/bioController');
var  userController = require('../controllers/authController');
var  uploadController = require('../controllers/uploadController');



// Bio routes
router.route('/bio')
    .get( bioController.index)
    .post(bioController.add);

router.route('/bio/:bio_id')
    .get(bioController.view)
    .patch(bioController.update)
    .put(bioController.update)
    .delete(bioController.delete);


 // post request for user registration
 router.route("/auth/register")
       .post(userController.register);

// post request for user log in  
router.route("/auth/sign_in")
      .post(userController.signIn);
 
router.route("/upload").post(uploadController.upload);


//Export API routes
module.exports = router;