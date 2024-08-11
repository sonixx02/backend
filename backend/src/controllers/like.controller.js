import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

 const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }

  const likeStatus = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (likeStatus) {
    const unlikedVideo = await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user._id,
    });
    if (!unlikedVideo) {
      throw new ApiError(
        500,
        "Error while unliking the video. Try again later."
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, unlikedVideo, "Video unliked"));
  } else {
    const likedVideo = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    if (!likedVideo) {
      throw new ApiError(500, "Error while liking the video. Try again later.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "Video liked"));
  }
});

 const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid comment ID"));
  }

  const likeStatus = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likeStatus) {
    const unlikedComment = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (!unlikedComment) {
      throw new ApiError(
        500,
        "Error while unliking the comment. Try again later."
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, unlikedComment, "Comment unliked"));
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (!likedComment) {
      throw new ApiError(
        500,
        "Error while liking the comment. Try again later."
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "Comment liked"));
  }
});

 const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid tweet ID"));
  }

  const likeStatus = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likeStatus) {
    const unlikedTweet = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    if (!unlikedTweet) {
      throw new ApiError(
        500,
        "Error while unliking the tweet. Try again later."
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, unlikedTweet, "Tweet unliked"));
  } else {
    const likedTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    if (!likedTweet) {
      throw new ApiError(500, "Error while liking the tweet. Try again later.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "Tweet liked"));
  }
});

 const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                  },
                },
              ],
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            $project: {
              username: "$ownerDetails.username",
              thumbnail: 1,
              title: 1,
              description: 1,
              views: 1,
              duration: 1,
            },
          },
        ],
        as: "videos",
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $replaceRoot: { newRoot: "$videos" },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
