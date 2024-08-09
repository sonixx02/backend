import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Content is required"));
  }

  const newTweet = new Tweet({
    content,
    owner: req.user._id,
  });

  try {
    const savedTweet = await newTweet.save();
    return res
      .status(201)
      .json(new ApiResponse(201, savedTweet, "Tweet added successfully"));
  } catch (error) {
    console.error("Error adding tweet:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid user ID"));
  }

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Page and limit must be positive integers")
      );
  }

  const skip = (pageNumber - 1) * pageSize;

  try {
    const tweets = await Tweet.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalTweets = await Tweet.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalTweets / pageSize);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tweets,
          totalTweets,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
          prevPage: pageNumber > 1 ? pageNumber - 1 : null,
        },
        "Tweets fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Content is required"));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid tweet ID"));
  }

  try {
    const tweet = await Tweet.findById(id);

    if (!tweet) {
      return res.status(404).json(new ApiResponse(404, null, "Tweet not found"));
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Not authorized to update this tweet"));
    }

    tweet.content = content;
    const updatedTweet = await tweet.save();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    console.error("Error updating tweet:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid tweet ID"));
  }

  try {
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
      return res.status(404).json(new ApiResponse(404, null, "Tweet not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
  } catch (error) {
    console.error("Error deleting tweet:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
