import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const channelStats = await User.aggregate([
    { $match: { username: username.toLowerCase() } },
    {
      $lookup: {
        from: "subscriptions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$channel", "$$userId"],
              },
            },
          },

          {
            $count: "totalSubs",
          },
        ],
        as: "SubsCount",
      },
    },
    {
      $unwind: { path: "$SubsCount", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        totalSubscribers: { $ifNull: ["$SubsCount.totalSubs", 0] },
      },
    },
    {
      $lookup: {
        from: "videos",
        let: { channelId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$owner", "$$channelId"] } } },
          {
            $lookup: {
              from: "likes",
              let: { videoId: "$_id" },
              pipeline: [
                {
                  $match:
                  {
                    $expr:
                    {
                      $eq: ["$video", "$$videoId"]
                    }
                  }
                },

                {
                  $group:
                    { _id: null, totalVideoLikes: { $sum: 1 } }
                },
                { $project: { totalVideoLikes: 1, _id: 0 } },
              ],
              as: "TotalLikes",
            },
          },
          {
            $unwind: { path: "$TotalLikes", preserveNullAndEmptyArrays: true },
          },
          {
            $group: {
              _id: null,
              totalVideos: { $sum: 1 },
              totalViews: { $sum: "$views" },
              totalLikes: { $sum: "$TotalLikes.totalVideoLikes" },
            },
          },
        ],
        as: "videoDetails",
      },
    },
    { $unwind: { path: "$videoDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        username: 1,
        email: 1,
        avatar: 1,
        createdAt: 1,
        totalSubscribers: 1,
        totalViews: "$videoDetails.totalViews",
        totalVideos: "$videoDetails.totalVideos",
        totalLikes: "$videoDetails.totalLikes",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { channelStats }, "Channel stats fetched."));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  let { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate input
  if (!username) {
    return res.status(400).json(new ApiResponse(400, null, "Username is required."));
  }

  // Convert username to lowercase
  username = username.toLowerCase();

  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User does not exist."));
  }

  const channelId = user._id;

  // Convert pagination parameters to integers
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  // Validate pagination parameters
  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid page or limit."));
  }

  const skip = (pageNumber - 1) * pageSize;

  // Get total number of videos for pagination metadata
  const totalVideos = await Video.countDocuments({ owner: channelId, isPublished: true });

  // Fetch videos with pagination
  const userVideos = await Video.find({ owner: channelId, isPublished: true })
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .select('title thumbnailUrl createdAt views'); // Select relevant fields

  // Prepare pagination metadata
  const totalPages = Math.ceil(totalVideos / pageSize);
  const currentPage = pageNumber;

  // Respond with videos and pagination information
  return res.status(200).json(new ApiResponse(200, {
    videos: userVideos,
    pagination: {
      totalVideos,
      totalPages,
      currentPage,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }, "Videos fetched."));
});


const getRandomVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;


  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);


  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid page or limit."));
  }


  const skip = (pageNumber - 1) * pageSize;


  const totalVideos = await Video.countDocuments({ isPublished: true });


  const randomVideos = await Video.aggregate([
    { $match: { isPublished: true } },
    { $sample: { size: totalVideos > pageSize ? pageSize : totalVideos } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        createdAt: 1,
        views: 1,
        videoFile: 1,
      }
    }
  ])
    .skip(skip)
    .limit(pageSize);


  const totalPages = Math.ceil(totalVideos / pageSize);
  const currentPage = pageNumber;


  return res.status(200).json(new ApiResponse(200, {
    videos: randomVideos,
    pagination: {
      totalVideos,
      totalPages,
      currentPage,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }, "Random videos fetched."));
});


export { getChannelStats, getChannelVideos, getRandomVideos };
