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


const getAllVideos = asyncHandler(async (req, res) => {
  // Extract query parameters
  let { page = 1, limit = 10, query, sortBy = "views", sortType, userId } = req.query;

  // Log incoming parameters
  console.log('Query Parameters:', { page, limit, query, sortBy, sortType, userId });

  // Validate query parameter
  if (!query) {
    throw new ApiError(400, "Query is required.");
  }

  // Validate and default sortBy field
  if (!["views", "createdAt", "duration"].includes(sortBy)) {
    sortBy = "createdAt";
  }

  // Determine sort direction
  const sortDirection = sortType === "asc" ? 1 : -1;

  // Define the aggregation pipeline
  const aggregationPipeline = [
    {
      $search: {
        index: "default",
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

  // Log the aggregation pipeline
  console.log('Aggregation Pipeline:', JSON.stringify(aggregationPipeline, null, 2));

  // Execute the aggregation pipeline
  const result = await Video.aggregate(aggregationPipeline);

  // Log the result of the aggregation
  console.log('Aggregation Result:', JSON.stringify(result, null, 2));

  // Prepare paginated response
  const paginatedVideos = {
    data: result[0].data,
    total: result[0].metadata[0]?.total || 0,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages: Math.ceil((result[0].metadata[0]?.total || 0) / limit)
  };

  // Send the response
  return res.status(200).json(new ApiResponse(200, paginatedVideos, "Videos fetched successfully"));
});



const publishAVideo = asyncHandler(async (req, res) => {
  // Log the incoming request body and files
  console.log('Request body:', req.body);
  console.log('Uploaded files:', req.files);

  const { title, description } = req.body;
  const videoFile = req.files?.videoFile?.[0];
  const thumbnailFile = req.files?.thumbnailFile?.[0];

  // Log the extracted files
  console.log('Video file:', videoFile);
  console.log('Thumbnail file:', thumbnailFile);

  if (!title || !description || !videoFile) {
    throw new ApiError(400, "Missing required fields");
  }

  try {
    // Log the file paths before uploading
    console.log('Video file path:', videoFile.path);
    if (thumbnailFile) {
      console.log('Thumbnail file path:', thumbnailFile.path);
    }

    // Upload video and thumbnail files
    const videoUpload = await uploadOnCloudinary(videoFile.path);
    const thumbnailUpload = thumbnailFile
      ? await uploadOnCloudinary(thumbnailFile.path)
      : null;

    // Log upload responses
    console.log('Video upload response:', videoUpload);
    console.log('Thumbnail upload response:', thumbnailUpload);

    if (!videoUpload || !videoUpload.secure_url) {
      throw new ApiError(500, "Error uploading video");
    }

    // Create a new video document
    const video = new Video({
      videoFile: videoUpload.secure_url,
      thumbnail: thumbnailUpload ? thumbnailUpload.secure_url : null,
      title,
      description,
      duration: videoUpload.duration / 120, // 120 secs
      owner: req.user._id,
    });

    // Save the video document to the database
    await video.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Video published successfully", video));
  } catch (error) {
    console.error('Error in publishing video:', error);
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});




const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json(new ApiResponse(404, null, "Video not found"));
    }

    // Check if req.user exists before accessing _id
    if (!req.user) {
      return res.status(401).json(new ApiResponse(401, null, "User not authenticated"));
    }

    console.log('Request User:', req.user);  // Debugging log
    console.log('Found Video:', video);      // Debugging log

    return res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
  } catch (error) {
    console.error('Error retrieving video:', error);  // Debugging log
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
});




const updateVideo = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  const { videoId } = req.params;
  const { title, description } = req.body;
  const videoFile = req.file;


  // Validate at least one field is provided
  if (!(title || description || videoFile)) {
    throw new ApiError(400, "At least one field (title, description, or video file) is required to update");
  }

  // Check if the user is the owner of the video
  const isOwner = await isVideoOwner(videoId, req.user._id);
  if (!isOwner) {
    throw new ApiError(403, "Not authorized to update this video");
  }

  // Find the video to update
  const prevVideoDetails = await Video.findById(videoId);
  if (!prevVideoDetails) {
    throw new ApiError(404, "Video not found");
  }

  // Handle video file upload
  let videofile = prevVideoDetails.videoFile;
  if (videoFile) {
    try {
      // Upload the new video file to Cloudinary
      const uploadedVideo = await uploadOnCloudinary(videoFile.path);
      // Delete the old video file from Cloudinary
      await deleteFromCloudinary(prevVideoDetails.videoFile);
      // Set the new video file URL
      videofile = uploadedVideo.secure_url;
    } catch (error) {
      throw new ApiError(500, "Error handling video file");
    }
  }

  // Prepare updated fields
  const updatedFields = {
    title: title || prevVideoDetails.title,
    description: description || prevVideoDetails.description,
    videoFile: videofile || prevVideoDetails.videoFile,
  };

  // Update the video in the database
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedFields, {
    new: true,
    runValidators: true,
  });

  // Return the updated video details
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});



 const deleteVideo = asyncHandler(async (req, res) => {
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


 const togglePublishStatus = asyncHandler(async (req, res) => {
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
