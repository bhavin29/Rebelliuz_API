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
var userController = require('../controllers/authController');
var userIntroController = require('../controllers/userIntroController');
var userJobController = require('../controllers/userJobController');
var userJobAnswerController = require('../controllers/userJobAnswerController');

var userReferenceController = require('../controllers/userReferenceController');

//Masters
var jobCategoryController = require('../controllers/master/JobCategoryController');
var  jobClassificationController = require('../controllers/master/jobClassificationController');
var jobExperinceController = require('../controllers/master/jobExperinceController');
var jobTypeController = require('../controllers/master/jobTypeController');
var jobSkillController = require('../controllers/master/jobSkillController');
var JobQuestionController = require('../controllers/master/jobQuestionController');


const auth = require('../../utils/auth');

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

router.route("/user/intro")
        .get(auth.isAuthunticated,userIntroController.view)
        .post(auth.isAuthunticated,userIntroController.upload);

router.route("/user/job")
        .get(auth.isAuthunticated,userJobController.view)
        .post(auth.isAuthunticated,userJobController.upload);

router.route("/user/jobanswer")
        .post(auth.isAuthunticated,userJobAnswerController.upload);

//Master
router.route("/masters/jobcategory")
   .get(auth.isAuthunticated,jobCategoryController.index)
   .post(auth.isAuthunticated,jobCategoryController.add);

router.route("/masters/jobcategory/:jobCategoryId")
   .get(auth.isAuthunticated,jobCategoryController.view)
   .put(auth.isAuthunticated,jobCategoryController.update);

router.route("/masters/jobclassification")
   .get(auth.isAuthunticated,jobClassificationController.index)
   .post(auth.isAuthunticated,jobClassificationController.add);

router.route("/masters/jobclassification/:jobclassificationId")
   .get(auth.isAuthunticated,jobClassificationController.view)
   .put(auth.isAuthunticated,jobClassificationController.update);

router.route("/masters/jobexperince")
   .get(auth.isAuthunticated,jobExperinceController.index)
   .post(auth.isAuthunticated,jobExperinceController.add);

router.route("/masters/jobexperince/:jobexperinceId")
   .get(auth.isAuthunticated,jobExperinceController.view)
   .put(auth.isAuthunticated,jobExperinceController.update);

router.route("/masters/jobskill")
   .get(auth.isAuthunticated,jobSkillController.index)
   .post(auth.isAuthunticated,jobSkillController.add);

router.route("/masters/jobskill/:jobskillId")
   .get(auth.isAuthunticated,jobSkillController.view)
   .put(auth.isAuthunticated,jobSkillController.update);

router.route("/masters/jobtype")
   .get(auth.isAuthunticated,jobTypeController.index)
   .post(auth.isAuthunticated,jobTypeController.add);

router.route("/masters/jobtype/:jobtypeId")
   .get(auth.isAuthunticated,jobTypeController.view)
   .put(auth.isAuthunticated,jobTypeController.update);

router.route("/masters/jobquestion")
   .get(auth.isAuthunticated,JobQuestionController.index)
   .post(auth.isAuthunticated,JobQuestionController.add);

router.route("/masters/jobquestion/:jobquestionId")
   .get(auth.isAuthunticated,JobQuestionController.view)
   .put(auth.isAuthunticated,JobQuestionController.update);

//Export API routes
module.exports = router;