const config = require('../../config/appconfig');
const User = require('../models/userModel');

const RequestHandler = require('../../utils/RequestHandler');
const Logger = require('../../utils/logger');
const logger = new Logger();

const requestHandler = new RequestHandler(logger);

const view = function (req, res) {
    try
    {
        let isUserId = Number.isInteger(parseInt(req.query.username));
            let matchValue=0;

            if (isUserId == true)
            {
                matchValue = { user_id : parseInt(req.query.username) };
            }
            else
            {
                matchValue = {username: new RegExp(req.query.username , "i")};
            }

            User.aggregate([
            {
              $match: matchValue 
            },
            {  
                $lookup:{
                  from: "storage_files",
                  let: { photo_id: "$photo_id" , cover_photo: "$coverphoto", cover_video : "$cover_video" },
                  pipeline: [
                    {$project: {  storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                    {$match: {$expr:
                          { $or : 
                            [
                              {$eq: ["$file_id", "$$photo_id"]},
                              {$eq: ["$file_id", "$$cover_photo"]},
                              {$eq: ["$cover_video", "$$cover_video"]},
                            ]
                          }
                    } 
                    }
                  ],
                  as: "userphoto"
                }
                },
                {
                    $unwind: {
                        path: "$users",
                        preserveNullAndEmptyArrays: true
                    }
                 },
                {
                        $lookup:{
                          from: "user_intros",
                          let: { email: "$email"  },
                          pipeline: [
                           {$project: { email:1, vFilename:1, "root_path" :  { $literal: config.general.parent_root }  }  },
                            {$match: {$expr: { $eq: ["$email", "$$email"]},
                          }}
                          ],
                          as: "user_intro"
                 }
              },
              {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
             },
          {
            $lookup:
             {
               from: "user_experiences",
               let: { user_id: "$user_id" },
               pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$user_id"]},] } } },
                {  
                    $lookup:{
                      from: "storage_files",
                      let: { photo_id: "$photo_id" , cover_photo: "$coverphoto" },
                      pipeline: [
                        {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                        {$match: {$expr:
                              { $or : 
                                [
                                  {$eq: ["$file_id", "$$photo_id"]}, //   {$eq: ["$file_id", "$$cover_photo"]},
                                ]
                              }
                        } 
                        }
                      ],
                      as: "experince_photo"
                    }
                    }
              ],
           as: "experience"
             }
          },
          {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
             },
          {
            $lookup:
             {
               from: "user_educations",
               let: { user_id: "$user_id" },
               pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$user_id"]},] } } },
                {  
                    $lookup:{
                      from: "storage_files",
                      let: { photo_id: "$upload_1" , cover_photo: "$coverphoto" },
                      pipeline: [
                        {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                        {$match: {$expr:
                              { $or : 
                                [
                                  {$eq: ["$file_id", "$$photo_id"]}, //   {$eq: ["$file_id", "$$cover_photo"]},
                                ]
                              }
                        } 
                        }
                      ],
                      as: "education_upload_1"
                    }
                    },
            {$lookup:{
                        from: "storage_files",
                        let: { photo_id: "$upload_2" , cover_photo: "$coverphoto" },
                        pipeline: [
                          {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                          {$match: {$expr:
                                { $or : 
                                  [
                                    {$eq: ["$file_id", "$$photo_id"]}, //   {$eq: ["$file_id", "$$cover_photo"]},
                                  ]
                                }
                          } 
                          }
                        ],
                        as: "education_upload_2"
                      }
                      },
                      {$lookup:{
                        from: "storage_files",
                        let: { photo_id: "$upload_3" , cover_photo: "$coverphoto" },
                        pipeline: [
                          {$project: { storage_path :1, _id: 1,file_id:1 , email:1, displayname:1 , "root_path" :  { $literal: config.general.parent_root }  }  },
                          {$match: {$expr:
                                { $or : 
                                  [
                                    {$eq: ["$file_id", "$$photo_id"]}, //   {$eq: ["$file_id", "$$cover_photo"]},
                                  ]
                                }
                          } 
                          }
                        ],
                        as: "education_upload_3"
                      }
                      },
              ],
           as: "education"
             }
          },
          {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_skills",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$user_id", "$$u_id"]},] } } }
            ],
        as: "skills"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_awards",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$u_id"]},] } } }
            ],
        as: "awards"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_certifications",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$u_id"]},] } } }
            ],
        as: "certifications"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_organizations",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$u_id"]},] } } }
            ],
        as: "organizations"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_courses",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$u_id"]},] } } }
            ],
        as: "courses"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_languages",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$user_id", "$$u_id"]},] } } }
            ],
        as: "languages"
            }
        },
        {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
         },
        {
            $lookup:
            {
            from: "user_projects",
            let: { u_id: "$user_id" },
            pipeline: [
                {$match: {$expr: { $or :  [ {$eq: ["$owner_id", "$$u_id"]},] } } }
            ],
        as: "projects"
            }
        },
        ],function(err, data) {
                if (err)
                 {
                     errMessage = '{ "User profile": { "message" : "User profile is not found"} }';
                     requestHandler.sendError(req,res, 422, 'Somthing went worng: ' + err.message,JSON.parse(errMessage));
                 }
                 else if (data.length > 0)
                 {
                  requestHandler.sendSuccess(res,'User profile found successfully.',200,data);
                }
                else
                {
                  errMessage = '{ "User profile": { "message" : "User profile is not found"} }';
                  requestHandler.sendError(req,res, 422, 'Somthing went worng',JSON.parse(errMessage));
                }
              }
    )} catch (err) {
    errMessage = { "User profile GET": { "message" : err.message } };
    requestHandler.sendError(req,res, 500, 'Somthing went worng.',(errMessage));
    }
  };
  
  
  module.exports = {
    view
};
  




