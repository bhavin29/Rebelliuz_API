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
var authController = require('../controllers/authController');
var userIntroController = require('../controllers/userIntroController');
var userJobController = require('../controllers/userJobController');
var userJobAnswerController = require('../controllers/userJobAnswerController');
var userTestController = require('../controllers/userTestController');
var userReferenceController = require('../controllers/userReferenceController');
var bussinesJobController = require('../controllers/bussinesJobController');
var bussinesJobUserController = require('../controllers/bussinesJobUserController');
var bussinesJobUserAnswerController = require('../controllers/bussinesJobUserAnswerController');
var userController = require('../controllers/userController');
var userProfileController = require('../controllers/userProfileController');
var bussinesAdminUserController = require('../controllers/bussinesAdminUserController');
var userJobRequestController = require('../controllers/userJobRequestController');
var bussinesJobRequestController = require('../controllers/bussinesJobRequestController');

//Masters
var jobCategoryController = require('../controllers/master/jobCategoryController');
var jobClassificationController = require('../controllers/master/jobClassificationController');
var jobExperinceController = require('../controllers/master/jobExperinceController');
var jobTypeController = require('../controllers/master/jobTypeController');
var jobSkillController = require('../controllers/master/jobSkillController');
var JobQuestionController = require('../controllers/master/jobQuestionController');
var TestController = require('../controllers/master/testController');
var TestQuestionController = require('../controllers/master/testQuestionController');
var CountryController = require('../controllers/master/countryController');
var CultureValuesController = require('../controllers/master/cultureValuesController');
var LocationController = require('../controllers/master/locationController');
var ReferenceRelationshipController = require('../controllers/master/referenceRelationshipController');
var PaymentGatewayController = require('../controllers/master/paymentGatewayController');
var PaymentPackageController = require('../controllers/master/paymentPackageController');
var BusinessCategoryController = require('../controllers/master/businessCategoryController');

//Payment
var PaymentOrderController = require('../controllers/payment/paymentOrderController');

//MemberFollow
var MemberController = require('../controllers/member/memberController');

//Message
var MessageController = require('../controllers/message/messageController');

//Post
var PostController = require('../controllers/post/postController');

//Post Comment
var PostCommentController = require('../controllers/post/postCommentController');

//Business
var BusinessController = require('../controllers/business/businessController');

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
      .post(authController.register);

// post request for user log in  
router.route("/auth/sign_in")
      .post(authController.signIn);

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

router.route("/masters/test")
   .get(auth.isAuthunticated,TestController.index)
   .post(auth.isAuthunticated,TestController.add);

router.route("/masters/test/:testId")
   .get(auth.isAuthunticated,TestController.view)
   .put(auth.isAuthunticated,TestController.update);

router.route("/masters/testquestion")
   .get(auth.isAuthunticated,TestQuestionController.index)
   .post(auth.isAuthunticated,TestQuestionController.add);

router.route("/masters/testquestion/:testquestionId")
   .get(auth.isAuthunticated,TestQuestionController.view)
   .put(auth.isAuthunticated,TestQuestionController.update);

router.route("/masters/country")
   .get(auth.isAuthunticated,CountryController.index)
   .post(auth.isAuthunticated,CountryController.add);

router.route("/masters/country/:countryId")
   .get(auth.isAuthunticated,CountryController.view)
   .put(auth.isAuthunticated,CountryController.update);

router.route("/masters/cultureValues")
   .get(auth.isAuthunticated,CultureValuesController.index)
   .post(auth.isAuthunticated,CultureValuesController.add);

router.route("/masters/cultureValues/:cultureValuesId")
   .get(auth.isAuthunticated,CultureValuesController.view)
   .put(auth.isAuthunticated,CultureValuesController.update);

router.route("/masters/location")
   .get(auth.isAuthunticated,LocationController.index)
   .post(auth.isAuthunticated,LocationController.add);

router.route("/masters/location/:locationId")
   .get(auth.isAuthunticated,LocationController.view)
   .put(auth.isAuthunticated,LocationController.update);

router.route("/masters/referenceRelationship")
   .get(auth.isAuthunticated,ReferenceRelationshipController.index)
   .post(auth.isAuthunticated,ReferenceRelationshipController.add);

router.route("/masters/referenceRelationship/:relationshipId")
   .get(auth.isAuthunticated,ReferenceRelationshipController.view)
   .put(auth.isAuthunticated,ReferenceRelationshipController.update);

router.route("/masters/paymentGateway")
   .get(auth.isAuthunticated,PaymentGatewayController.index)

router.route("/masters/paymentGateway/:paymentGatewayId")
   .get(auth.isAuthunticated,PaymentGatewayController.view)

router.route("/masters/PaymentPackage")
   .get(auth.isAuthunticated,PaymentPackageController.index)

router.route("/masters/PaymentPackage/:paymentPackageId")
   .get(auth.isAuthunticated,PaymentPackageController.view)

router.route("/masters/businesscategory")
   .get(auth.isAuthunticated,BusinessCategoryController.index)

//user   
router.route("/user/intro")
  .get(auth.isAuthunticated,userIntroController.view)
  .post(auth.isAuthunticated,userIntroController.upload);

router.route("/user/job")
  .get(auth.isAuthunticated,userJobController.view)
  .post(auth.isAuthunticated,userJobController.upload)

router.route("/user/jobanswer")
   .post(auth.isAuthunticated,userJobAnswerController.upload);

router.route("/user/test")
   .get(auth.isAuthunticated,userTestController.index)
   .post(auth.isAuthunticated,userTestController.add);

router.route("/user/test/upload")
   .get(auth.isAuthunticated,userTestController.indexupload)
   .post(auth.isAuthunticated,userTestController.addupload);

router.route("/user/test/upload/:id")
  .delete(auth.isAuthunticated,userTestController.deleteupload);

router.route("/user/reference")
   .get(auth.isAuthunticated,userReferenceController.view)
   .post(auth.isAuthunticated,userReferenceController.add)
   .delete(auth.isAuthunticated,userReferenceController.remove);

router.route("/user")
   .post(auth.isAuthunticated,userController.view)

router.route("/user/profile")
   .post(userProfileController.view)

router.route("/user/job/request")
   .get(auth.isAuthunticated,userJobRequestController.view)
   .post(auth.isAuthunticated,userJobRequestController.add);

//Bussines
router.route("/bussines/job/:bussinesid")
  .get(auth.isAuthunticated,bussinesJobController.view)
  .post(auth.isAuthunticated,bussinesJobController.upload)
  .put(auth.isAuthunticated,bussinesJobController.update);

router.route("/bussines/job/request/:bussinesid")
   .get(auth.isAuthunticated,bussinesJobRequestController.view);
 
router.route("/bussines/jobuser/:bussinesid")
  .get(auth.isAuthunticated,bussinesJobUserController.view)
  .post(auth.isAuthunticated,bussinesJobUserController.add);

router.route("/bussines/jobanswer/:bussinesid")
  .get(auth.isAuthunticated,bussinesJobUserAnswerController.view)
  .post(auth.isAuthunticated,bussinesJobUserAnswerController.add);

router.route("/bussines/jobanswer/comments/:bussinesid")
  .get(auth.isAuthunticated,bussinesJobUserAnswerController.viewcomments)
  .post(auth.isAuthunticated,bussinesJobUserAnswerController.addcomments);

router.route("/bussines/adminuser/:bussinesid")
  .get(auth.isAuthunticated,bussinesAdminUserController.view)
  .post(auth.isAuthunticated,bussinesAdminUserController.add);

//Payment
router.route("/payment/order/:paymentOrderId")
  .get(auth.isAuthunticated,PaymentOrderController.view);

router.route("/payment/order")
  .post(auth.isAuthunticated,PaymentOrderController.add)
  .patch(auth.isAuthunticated,PaymentOrderController.update);

//Payment
router.route("/payment/validate")
  .post(auth.isAuthunticated,PaymentOrderController.validate);

//paypal
router.route("/payment/webhooks")
  .post(PaymentOrderController.webhooks);
  
//Member
router.route("/member/search")
   .post(auth.isAuthunticated,MemberController.search);

//New APIS of connection modules
router.route("/member/request/:userId/send")
   .get(auth.isAuthunticated, MemberController.sendConnectionRequest);

router.route("/member/request/:requestId/accept")
   .get(auth.isAuthunticated, MemberController.acceptConnectionRequest);

router.route("/member/request/:requestId/cancel")
   .get(auth.isAuthunticated, MemberController.cancelSendedConnectionRequest);

router.route("/member/request/:requestId/decline")
   .get(auth.isAuthunticated, MemberController.declineFriendConnection);

router.route("/member/recommanded_users")
   .get(auth.isAuthunticated, MemberController.fetchRecommandedUsers);

router.route("/user/me")
   .get(auth.isAuthunticated, MemberController.me);

router.route("/user/notifications/clear")
   .delete(auth.isAuthunticated, MemberController.clearNotification);

router.route("/user/:user_id")
   .get(auth.isAuthunticated, MemberController.fetchUserById);

router.route("/member/request/sended")
   .get(auth.isAuthunticated, MemberController.fetchSendedConnectionRequest);

router.route("/member/request/received")
   .get(auth.isAuthunticated, MemberController.fetchIncommingConnectionRequest);

//Message
router.route("/message/:connectionId/send")
   .post(auth.isAuthunticated,MessageController.sendMessageToConnection);

router.route("/message/:connectionId/get_messages")
   .get(auth.isAuthunticated,MessageController.getConnectionMessages);

//Post
router.route("/post")
   .post(auth.isAuthunticated,PostController.createPost);

router.route("/post/:postId/like_dislike")
   .get(auth.isAuthunticated,PostController.likeDislikePost);
   
router.route("/post")
   .get(auth.isAuthunticated,PostController.fetchAllPosts);

router.route("/post/:postId")
   .get(auth.isAuthunticated,PostController.fetchPostById);

//Comment
router.route("/post/comment/:commentId/like_dislike")
   .get(auth.isAuthunticated,PostCommentController.likeDislikeComment);

router.route("/post/:postId/comment")
   .get(auth.isAuthunticated,PostCommentController.fetchComments);
   
router.route("/post/:postId/comment")
   .post(auth.isAuthunticated,PostCommentController.createComment);
   
//Business
router.route("/business/:business_id")
   .post(auth.isAuthunticated,BusinessController.updateBusiness);

//Export API routes
module.exports = router;