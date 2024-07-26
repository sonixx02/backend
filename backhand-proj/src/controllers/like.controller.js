import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.remove();
    return res.status(200).json(new ApiResponse(200, null, "Video like removed"));
  } else {
    const newLike = new Like({
      video: videoId,
      likedBy: req.user._id,
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Video liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid comment ID"));
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.remove();
    return res.status(200).json(new ApiResponse(200, null, "Comment like removed"));
  } else {
    const newLike = new Like({
      comment: commentId,
      likedBy: req.user._id,
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Comment liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid tweet ID"));
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.remove();
    return res.status(200).json(new ApiResponse(200, null, "Tweet like removed"));
  } else {
    const newLike = new Like({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Tweet liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate("video");

  return res.status(200).json(
    new ApiResponse(200, likedVideos.map(like => like.video), "Liked videos fetched successfully")
  );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
};
