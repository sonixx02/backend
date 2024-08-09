import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";


const isVideoOwner = async (videoId, userId) => {
  try {
    return await Video.exists({ _id: videoId, owner: userId });
  } catch (error) {
    throw error;
  }
};


export const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy = "views", sortType, userId } = req.query;

  if (!query) {
      throw new ApiError(400, "Query is required.");
  }

  if (!["views", "createdAt", "duration"].includes(sortBy)) {
      sortBy = "createdAt";
  }

  const sortDirection = sortType === "asc" ? 1 : -1;

  const aggregationPipeline = [
      {
          $search: {
              index: "search",
              text: {
                  query,
                  path: ['title', 'description']
              }
          }
      },
      {
          $sort: {
              [sortBy]: sortDirection
          }
      },
      {
          $facet: {
              metadata: [{ $count: "total" }],
              data: [{ $skip: (page - 1) * parseInt(limit) }, { $limit: parseInt(limit) }]
          }
      }
  ];

  const result = await Video.aggregate(aggregationPipeline);
 
  const paginatedVideos = {
      data: result[0].data,
      total: result[0].metadata[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil((result[0].metadata[0]?.total || 0) / limit)
  };

  return res.status(200).json(new ApiResponse(200, paginatedVideos, "Videos fetched successfully"));

})


export const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!title || !description || !videoFile) {
    throw new ApiError(400, "Missing required fields");
  }

  try {
    const videoUpload = await uploadOnCloudinary(videoFile.path);
    const thumbnailUpload = thumbnailFile
      ? await uploadOnCloudinary(thumbnailFile.path)
      : null;

    if (!videoUpload || !videoUpload.secure_url) {
      throw new ApiError(500, "Error uploading video");
    }

    const video = new Video({
      videoFile: videoUpload.secure_url,
      thumbnail: thumbnailUpload ? thumbnailUpload.secure_url : null,
      title,
      description,
      duration: videoUpload.duration / 120, // 120 secs
      owner: req.user._id,
    });

    await video.save();
    
    return res
      .status(201)
      .json(new ApiResponse(201, "Video published successfully", video));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});



export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
  const video = await Video.aggregate([
      {
          $match:{
              _id: new mongoose.Types.ObjectId(videoId)
          }
      },
      {
          $lookup:{
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "user"
          }
      },
      {
          $unwind:"$user"
      },
      {
          // Subscriber count and isSubscribed status
          $lookup:{
              from: "subscriptions",
              let: {channelId:"$user._id" , userId: new mongoose.Types.ObjectId(req.user._id)},
              pipeline:[
                  {
                      $match:{
                          $expr:{
                              $eq:['$channel','$$channelId']
                          }
                      }
                  },
                  {
                      $group:{
                          _id: null,
                          subscriberCount: {$sum: 1},
                          isSubscribed: {
                              $max:{$eq:['$subscriber','$$userId']}
                          }
                      }
                  },
              ],
              as: "subscribtionDetails"
          }
      },
      {
         $unwind:"$subscribtionDetails"
      },
      {
          //Total Likes and Like status
          $lookup:{
              from: "likes",
              let: {videoId: "$_id",userId:new mongoose.Types.ObjectId(req.user._id)},
              pipeline:[
                  {
                      $match:{
                          $expr:{
                              $eq:['$video','$$videoId']
                          }
                          
                      }
                  },
                  {
                      $group:{
                          _id: null,
                          likeCount:{
                              $sum : 1
                          },
                          likeStatus:{
                              $max:{$eq:['$likedBy','$$userId']}
                          }
                      }
                  }
              ],
              as: "likeDetails"

          }
      },
      {
          $unwind:{
              path: '$likeDetails',
              preserveNullAndEmptyArrays: true
          }
      },
      {
           //Total Likes and Like status
           $lookup:{
              from: "comments",
              let: {videoId: "$_id"},
              pipeline:[
                  {
                      $match:{
                          $expr:{
                              $eq:['$video','$$videoId']
                          }
                          
                      }
                  },
                  {
                      $count: 'commentCount'
                  }
              ],
              as: 'commentDetails'
           }
      },
      {
          $unwind:'$commentDetails'
      },
      {
          $project:{
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
              username: '$user.username',
              avatar: '$user.avatar',
              username: '$user.username',
              isSubscribed: '$subscribtionDetails.isSubscribed',
              channelSubs: '$subscribtionDetails.subscriberCount',
              totalLikes: '$likeDetails.likeCount',
              isLiked: '$likeDetails.likeStatus',
              totalComments: '$commentDetails.commentCount'

          }
      }
      
      
  ])

  return res.status(200).json(new ApiResponse(200, video, "Video Fetched Successfully."))
})



export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailFile = req.file;

  if (!(title || description || thumbnailFile)) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const isOwner = await isVideoOwner(videoId, req.user._id);
  if (!isOwner) {
    throw new ApiError(403, "Not authorized to update this video");
  }

  const prevVideoDetails = await Video.findById(videoId);
  if (!prevVideoDetails) {
    throw new ApiError(404, "Video not found");
  }

  let thumbnail = prevVideoDetails.thumbnail;
  if (thumbnailFile) {
    thumbnail = await uploadOnCloudinary(thumbnailFile.path);
    await deleteFromCloudinary(prevVideoDetails.thumbnail);
    thumbnail = thumbnail.secure_url;
  }

  const updatedFields = {
    title: title || prevVideoDetails.title,
    description: description || prevVideoDetails.description,
    thumbnail: thumbnail || prevVideoDetails.thumbnail,
  };

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedFields, {
    new: true,
    runValidators: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});


export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const isOwner = await isVideoOwner(videoId, req.user._id);
  if (!isOwner) {
    throw new ApiError(403, "Not authorized to delete this video");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }

  await deleteFromCloudinary(deletedVideo.videoFile);
  await deleteFromCloudinary(deletedVideo.thumbnail);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});


export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const isOwner = await isVideoOwner(videoId, req.user._id);
  if (!isOwner) {
    throw new ApiError(403, "Not authorized to toggle publish status");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}
