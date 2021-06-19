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

      let match = { postId : req.params.postId }
  
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
            docs: 'posts'
        }
    };
    
    aggregate_options.push({$addFields: { "postId": { "$toString": "$_id" }}});
    aggregate_options.push({$match : match});
    aggregate_options.push({$lookup : lookupvalue_1});
    
  
      const myAggregate = Post.aggregate(aggregate_options);
   
      Post.aggregatePaginate(myAggregate,options,function (err, post) {
            if (err)
            {
                errMessage = '{ "Posts": { "message" : "Post result not found!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else if (post.totalResults > 0)
            {
              requestHandler.sendSuccess(res,'Post found successfully.',200,post);
            }
            else
            {
                requestHandler.sendSuccess(res,'Post no data found',200,post);
            }
        });

      /*
      const post = await Post.findById(req.params.postId)
        .populate('user')
        .populate({ path: 'body.with'})
  
      let postData = FilterPostData(post)
  
      //res.status(200).json({ post: postData })
      requestHandler.sendSuccess(res,'Post found successfully.',200, { post: postData });
    */
    } catch (err) {
      errMessage = { "Posts": { "post" : err.message } };
      requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
  
  //fetch all posts
exports.fetchAllPosts = async (req, res) => {
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
                  docs: 'posts'
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
  
        const myAggregate = Post.aggregate(aggregate_options);
   
        Post.aggregatePaginate(myAggregate,options,function (err, post) {
            if (err)
            {
                errMessage = '{ "Posts": { "message" : "Post result not found!!"} }';
                requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
            }
            else if (post.totalResults > 0)
            {
              requestHandler.sendSuccess(res,'Post found successfully.',200,post);
            }
            else
            {
                requestHandler.sendSuccess(res,'Post no data found',200,post);
            }
        });


      /*
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
      */
    } catch (err) {
        errMessage = { "Posts": { "post" : err.message } };
        requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
};
  