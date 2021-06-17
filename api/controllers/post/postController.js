const config = require('../../../config/appconfig');
const fs = require('fs');
const Post = require('../../models/post/postModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const User = require('../../models/userModel');
const FilterPostData = require('../../../utils/FilterPostData')
const sendDataToFriends = require("../../../utils/socket/SendDataToFriend")
/*
//For creating new post
const addPost = async (req, res) => {
        try
        {
                //insert
                var postModel = new PostModel();
                postModel.user_id = global.decoded._id;
                postModel.text = req.body.text;
                postModel.theme = req.body.theme;
                postModel.post_type = req.body.post_type;
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

// Update Post
const updatePost = function (req, res) {
    try
    {
        PostModel.findById(req.params.postid, function (err, postModel) {

            postModel.text = req.body.text;
            postModel.theme = req.body.theme;
            postModel.post_type = req.body.post_type;
            postModel.device_id = '';
            postModel.device_name = '';
            postModel.ip_address = '';

        //Save and check error
        postModel.save(function (err) {
        if (err)
        {
            errMessage = '{ "Post": { "message" : "Post is not updated"} }';
            requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
        }
        else
        {
            requestHandler.sendSuccess(res,'Post updated successfully.',200,postModel);
        }
        });
    });
    }
    catch (err) {
    errMessage = { "Post Update": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
}

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
    updatePost,
    addPostLike,
    addPostComment,
    addPostCommentLike
};
  
*/

//create new posts
exports.createPost = async (req, res) => {
    try {
            let { content, privacy, image, body } = req.body

            if (!content && content.trim().length === 0 && !image) {
              errMessage = '{ "Posts": { "post" : "Post Image or Write Some Content  to Post. Can`t upload empty post"} }';
              requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
            }
            else
            {
                    try {
                      const createPost = new Post({
                        image,
                        privacy,
                        content,
                        user: global.decoded._id,
                        isProfilePost: false,
                      })
                  
                      const savePost = await createPost.save()
                  
                      if (Object.keys(body).length) {
                        savePost.body = {
                          feelings: body.feelings,
                          at: body.at,
                          date: body.date,
                          with: body.with.map((user) => user),
                        }
                    
                        await savePost.save()
                      }
                      const post = await Post.findById(savePost.id)
                        .populate('user')
                        .populate({ path: 'body.with', select: '_id name' })
                      const postData = FilterPostData(post)
                  
                    //   res
                    //     .status(201)
                    //     .json({ message: 'post created successfully', post: postData })
                  
                      requestHandler.sendSuccess(res,'post created successfully.',200, { post: postData });
                  
                      let dataToSend = {
                        req, key: "new-post", data: postData,
                        notif_body:`${post.user.name} has created new post`
                      }
                      await sendDataToFriends(dataToSend)

                    } catch (err) {
                      errMessage = { "Posts": { "post" : err.message } };
                      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
                    }
            }
    } catch (err) {
    errMessage = { "Posts": { "post" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
  }
};

//like or dislike post
exports.likeDislikePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId)
        .populate('user')
        .populate({ path: 'body.with', select: '_id name' })

      if (!post) {
        errMessage = '{ "Posts": { "post" : "post not found"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {
            let postData

            const index = post.likes.indexOf(global.decoded._id)

            if (index !== -1) {
                    post.likes.splice(index, 1)
                    await post.save()
                    postData = FilterPostData(post)
                    //res.status(200).json({ message: 'removed likes', post: postData })
                    requestHandler.sendSuccess(res,'removed likes.',200, { post: postData });
                    await sendDataToFriends({ req, key: "post-like-change", data: postData })
            }
            else
            {
                    post.likes.push(global.decoded._id)
                    await post.save()
                    postData = FilterPostData(post)
                    //res.status(200).json({ message: 'add like', post: postData })
                    requestHandler.sendSuccess(res,'add like.',200, { post: postData });
                    await sendDataToFriends({ req, key: "post-like-change", data: postData })
            }
        }
    } catch (err) {
        errMessage = { "Posts": { "post" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};

//fetch post by id
exports.fetchPostById = async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId)
        .populate('user')
        .populate({ path: 'body.with'})
  
      let postData = FilterPostData(post)
  
      //res.status(200).json({ post: postData })
      requestHandler.sendSuccess(res,'Post found successfully.',200, { post: postData });

    } catch (err) {
      errMessage = { "Posts": { "post" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
  
  //fetch all posts
exports.fetchAllPosts = async (req, res) => {
    try {
        
    let page = parseInt(req.query.page || 0)
    //let limit = 3
    let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;
  
    
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page * limit)
        .populate('user')
        .populate({ path: 'body.with' })
  
      let postsData = posts.map((post) => FilterPostData(post))
  
      const totalCount = await Post.estimatedDocumentCount().exec()
      const paginationData = {
        currentPage:page,
        totalPage:Math.ceil(totalCount/limit),
        totalPost:totalCount
      }
      
      //res.status(200).json({ posts: postsData,pagination:paginationData })

      requestHandler.sendSuccess(res,'Posts found successfully.',200, { posts: postsData,pagination:paginationData });

    } catch (err) {
        errMessage = { "Posts": { "post" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
  