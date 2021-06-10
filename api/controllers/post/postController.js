const config = require('../../../config/appconfig');
const fs = require('fs');
const PostModel = require('../../models/post/postModel');
const PostLikeModel = require('../../models/post/postLikeModel');
const PostCommentModel = require('../../models/post/postCommentModel');
const PostCommentLikeModel = require('../../models/post/postCommentLikeModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//For creating new post
const addPost = async (req, res) => {
        try
        {
                //insert
                var postModel = new PostModel();
                postModel.user_id = global.decoded._id;
                postModel.text = req.body.text;
                postModel.theme = req.body.theme;
                postModel.device_id = '';
                postModel.device_name = '';
                postModel.ip_address = '';
                postModel.created_by = global.decoded._id;

                //Save and check error
                postModel.save(function (err) {
                    if (err)
                    {
                        errMessage = '{ "Post": { "message" : "Post is not save"} }';
                        requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                    }
                    else
                    {
                        requestHandler.sendSuccess(res,'Post save successfully.',200,postModel);
                    }
                    });
        } catch (err) {
        errMessage = { "Post GET": { "message" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
        }
};

//adding the post like by user and update the post like count
const addPostLike = async (req, res) => {
    try
    {
            //insert
            var postLikeModel = new PostLikeModel();
            postLikeModel.post_id = req.body.post_id;
            postLikeModel.user_id = req.body.user_id;
            postLikeModel.created_by = global.decoded._id;

            //Save and check error
            postLikeModel.save(function (err) {
                if (err)
                {
                    errMessage = '{ "PostLike": { "message" : "Post like is not save"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else
                {
                    updatePostLikeCount(req,res,postLikeModel);
                }
                });
    } catch (err) {
    errMessage = { "PostLike GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

updatePostLikeCount  = function (req,res,postLikeModel){
    try
    {

        PostModel.findById(req.body.post_id, function (err, postModel) {
        postModel.like_counts = postModel.like_counts + 1;

        postModel.save(function (err) {
        if (err)
        {
            errMessage = '{ "Post Like Count": { "message" : "Post like count is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Post like count updated successfully.',200,postLikeModel);
        }
        });
    });
    } catch (err) {
    errMessage = { "Post Like Count GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//adding the post comments by user and update the post comments count
const addPostComment = async (req, res) => {
    try
    {
            //insert
            var postCommentModel = new PostCommentModel();
            postCommentModel.post_id = req.body.post_id;
            postCommentModel.user_id = req.body.user_id;
            postCommentModel.comments = req.body.comments;
            postCommentModel.created_by = global.decoded._id;

            //Save and check error
            postCommentModel.save(function (err) {
                if (err)
                {
                    errMessage = '{ "PostComment": { "message" : "Post comment is not save"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else
                {
                    updatePostCommentCount(req,res,postCommentModel);
                }
                });
    } catch (err) {
    errMessage = { "PostComment GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

updatePostCommentCount  = function (req,res,postCommentModel){
    try
    {

        PostModel.findById(req.body.post_id, function (err, postModel) {
        postModel.post_Counts = postModel.post_Counts + 1;

        postModel.save(function (err) {
        if (err)
        {
            errMessage = '{ "Post Comment Count": { "message" : "Post comment count is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Post comment count updated successfully.',200,postCommentModel);
        }
        });
    });
    } catch (err) {
    errMessage = { "Post Comment Count GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};


//adding the posts comment like by user and update the post comment like count
const addPostCommentLike = async (req, res) => {
    try
    {
            //insert
            var postCommentLikeModel = new PostCommentLikeModel();
            postCommentLikeModel.post_comments_id = req.body.post_comments_id;
            postCommentLikeModel.user_id = req.body.user_id;
            postCommentLikeModel.created_by = global.decoded._id;

            //Save and check error
            postCommentLikeModel.save(function (err) {
                if (err)
                {
                    errMessage = '{ "PostsCommentLike": { "message" : "Posts comment like is not save"} }';
                    requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                }
                else
                {
                    updatePostsCommentsLikeCount(req,res,postCommentLikeModel);
                }
                });
    } catch (err) {
    errMessage = { "PostsCommentLike GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

updatePostsCommentsLikeCount  = function (req,res,postCommentLikeModel){
    try
    {

        PostCommentModel.findById(req.body.post_comments_id, function (err, postCommentModel) {
        postCommentModel.post_like_counts = postCommentModel.post_like_counts + 1;

        postCommentModel.save(function (err) {
        if (err)
        {
            errMessage = '{ "Posts Comment Like Count": { "message" : "Posts comment like count is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Post comment like count updated successfully.',200,postCommentModel);
        }
        });
    });
    } catch (err) {
    errMessage = { "Posts Comment Like Count GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};


module.exports = {
    addPost,
    addPostLike,
    addPostComment,
    addPostCommentLike
};
  