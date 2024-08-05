import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const getChannelStats = asyncHandler(async (req, res) => {
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
                { $match: 
                    { $expr: 
                        { 
                            $eq: ["$video", "$$videoId"] 
                        } 
                    } 
                },

                { $group: 
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

export const getChannelVideos = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!username) throw new ApiError(400, "Username is required.");

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) throw new ApiError(404, "User does not exist.");

  const userVideos = await Video.find({ owner: user._id, isPublished: true })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, userVideos, "Videos fetched."));
});

export { getChannelStats, getChannelVideos };
