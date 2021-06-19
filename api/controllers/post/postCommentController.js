const config = require('../../../config/appconfig');
const fs = require('fs');
const Post = require('../../models/post/postModel');
const Comment = require('../../models/post/postCommentModel');
const RequestHandler = require('../../../utils/RequestHandler');
const Logger = require('../../../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const User = require('../../models/userModel');
const FilterCommentData = require('../../../utils/FilterCommentData')
const sendDataToFriends = require("../../../utils/socket/SendDataToFriend")

//create post comment
exports.createComment = async (req, res) => {
    try {
        const { text, image } = req.body
        if (!text || (text.trim().length === 0 && !image)) {
          errMessage = '{ "Comments": { "message" : "enter something or comment image"} }';
          requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
        }
        else
        {
            try {

              const post = await Post.findById(req.params.postId)
              if (!post) {
                errMessage = '{ "Comments": { "message" : "post not found"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
              }
              else
              {
                    let body = {}
                    if (image) {
                      body.image = image
                    }
                
                    if (text) {
                      body.text = text
                    }
                
                    const createComment = new Comment({
                      user: global.decoded._id,
                      post: req.params.postId,
                      body,
                    })
                
                    const saveComment = await createComment.save()
                    const comment = await Comment.findById(saveComment.id).populate(
                      'user',
                      '_id name  profile_pic',
                    )
                    
                    const filterComment = FilterCommentData(comment)

                    // res.status(201).json({
                    //   message: 'commented on post successfully',
                    //   comment: filterComment,
                    // })

                    await sendDataToFriends({ req, key: 'post-comment', data: filterComment })

                    requestHandler.sendSuccess(res,'commented on post successfully.',200, { data: filterComment });
              }
            } catch (err) {
                errMessage = { "Comments": { "Comment" : err.message } };
                requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
            }
        }   
    } catch (err) {
        errMessage = { "Comments": { "Comment" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};



//fetch comments
  exports.fetchComments = async (req, res) => {
    try {
      let aggregate_options = [];
   
      //PAGINATION
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.rowsPerPage) || global.rows_per_page;

              //set the options for pagination
            const options = {
              page, limit,
              collation: {locale: 'en'},
              customLabels: {
                  totalDocs: 'totalResults',
                  docs: 'comments'
              }
          };

          let lookupvalue_1 ={
                             from: "users",
                             let: { userid: "$user" },
                              pipeline: [
                              {$project: { _id :1, user_id: 1,email:1 , username:1, displayname:1,photo_id:1,connections:1,socketId:1,coverphoto:1,verified:1  }  },
                               {$match: {$expr:
                                  {$eq: ["$_id", "$$userid"] }
                               } 
                             },
                             {  
                              $lookup:{
                                from: "storage_files",
                                let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                                pipeline: [
                                  {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                                  {$match: {$expr:
                                        { $or : 
                                          [
                                            {$eq: ["$file_id", "$$photo_id"]}, 
                                          ]
                                        }
                                  } 
                                  }
                                ],
                                as: "user_photo"
                              }
                              },
                          ],
                           as: "user"
          }; 
    
        let sortOrder = req.query.sortDir && req.query.sortDir === 'desc' ? 1 : -1;

        aggregate_options.push({$sort: {"createdAt": sortOrder}});
        aggregate_options.push({$lookup : lookupvalue_1});
  
        const myAggregate = Comment.aggregate(aggregate_options);
   
        Comment.aggregatePaginate(myAggregate,options,function (err, comment) {
            if (err)
            {
                errMessage = '{ "Comments": { "message" : "Comment result not found!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else if (comment.totalResults > 0)
            {
              requestHandler.sendSuccess(res,'Comment found successfully.',200,comment);
            }
            else
            {
                requestHandler.sendSuccess(res,'Comment no data found',200,comment);
            }
        });
    } catch (err) {
        errMessage = { "Comments": { "Comment" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
    /*
    let page = parseInt(req.query.page || 0)
    let limit = 3
  
    try {
      const comments = await Comment.find({ post: req.params.postId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page * limit)
        .populate('user', '_id name profile_pic')
      const filterComments = comments.map((comment) => FilterCommentData(comment))
      const totalCount = await Comment.countDocuments({ post: req.params.postId })
  
      const paginationData = {
        currentPage: page,
        totalPage: Math.ceil(totalCount / limit),
        totalComments: totalCount,
      }
      res
        .status(200)
        .json({ comments: filterComments, pagination: paginationData })
        
    } catch (err) {
      errMessage = { "Comments": { "Comment" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
    */
  };
  

  //like dislike post comment
  exports.likeDislikeComment = async (req, res) => {
    try {
      
      const comment = await Comment.findById(req.params.commentId).populate(
        'user',
      )
  
      if (!comment) {
        errMessage = '{ "Comments": { "message" : "comment not found"} }';
        requestHandler.sendError(req,res, 422, 'Somthing went worng.',JSON.parse(errMessage));
      }
      else
      {
                let commentData

                const index = comment.likes.indexOf(global.decoded._id)
                if (index !== -1) {
                  comment.likes.splice(index, 1)
                  await comment.save()
                
                  commentData = FilterCommentData(comment)
                
                  //res.status(200).json({ message: 'removed likes', comment: commentData })
                
                  await sendDataToFriends({
                    req,
                    key: 'comment-like-change',
                    data: commentData,
                  })

                  requestHandler.sendSuccess(res,'removed likes.',200, { comment: commentData });
                }
                else
                {
                        comment.likes.push(global.decoded._id)
                        await comment.save()
                        commentData = FilterCommentData(comment)
                        
                        //res.status(200).json({ message: 'add like', comment: commentData })

                        await sendDataToFriends({
                          req,
                          key: 'comment-like-change',
                          data: commentData,
                        })
                        requestHandler.sendSuccess(res,'add like.',200, { comment: commentData });
                }
      }
    } catch (err) {
      errMessage = { "Comments": { "Comment" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
  