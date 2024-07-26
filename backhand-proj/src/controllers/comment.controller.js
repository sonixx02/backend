import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }

  // Convert page and limit to numbers from string
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
    // Create the aggregation pipeline
    const pipeline = [
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ];

    const result = await Comment.aggregatePaginate(
      Comment.aggregate(pipeline),
      {
        page: pageNumber,
        limit: pageSize,
        customLabels: {
          totalDocs: "totalComments",
          docs: "comments",
          limit: "pageSize",
          page: "currentPage",
          nextPage: "next",
          prevPage: "prev",
          totalPages: "totalPages",
          pagingCounter: "slNo",
          meta: "paginator",
        },
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          comments: result.comments,
          totalComments: result.totalComments,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          nextPage: result.next,
          prevPage: result.prev,
        },
        "Comments fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});


const addComment = asyncHandler(async (req, res) => {
  const { content, videoId } = req.body;

  // Validate input data
  if (!content || !videoId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Content and video ID are required"));
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }

  // Create a new comment with the authenticated user's ID
  const newComment = new Comment({
    content,
    video: videoId,
    owner: req.user._id, // Use the authenticated user's ID
  });

  try {
    const savedComment = await newComment.save();
    return res
      .status(201)
      .json(new ApiResponse(201, savedComment, "Comment added successfully"));
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params; // Comment ID from URL params
  const { content } = req.body; // New content to update

  // Ensure content is provided
  if (!content) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Content is required"));
  }

  // Ensure comment ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid comment ID"));
  }

  // Find the comment to update
  const comment = await Comment.findById(id);

  // Check if comment exists
  if (!comment) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Comment not found"));
  }

  // Check if the user is the owner of the comment
  if (comment.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json(
        new ApiResponse(403, null, "Not authorized to update this comment")
      );
  }

  // Update the comment
  comment.content = content;

  try {
    const updatedComment = await comment.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
      );
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid comment ID"));
  }

  try {
    // Delete the comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Comment not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
      );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
