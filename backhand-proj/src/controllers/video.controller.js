import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
    };

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: 'i' };
    }
    if (userId) {
        filter.owner = userId;
    }

    const videos = await Video.paginate(filter, options);
    res.status(200).json(new ApiResponse(200, 'Videos fetched successfully', videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { path: videoPath } = req.file;

    if (!title || !description || !videoPath) {
        throw new ApiError(400, "Missing required fields");
    }

    const videoUpload = await uploadOnCloudinary(videoPath);
    if (!videoUpload || !videoUpload.secure_url) {
        throw new ApiError(500, "Error uploading video");
    }

    const video = new Video({
        videoFile: videoUpload.secure_url,
        thumbnail: videoUpload.thumbnail_url, // Assuming thumbnail is also uploaded
        title,
        description,
        duration: videoUpload.duration, // Assuming duration is provided by Cloudinary
        owner: req.user._id,
    });

    await video.save();
    res.status(201).json(new ApiResponse(201, "Video published successfully", video));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, "Video fetched successfully", video));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnail) video.thumbnail = thumbnail;

    await video.save();
    res.status(200).json(new ApiResponse(200, "Video updated successfully", video));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, "Video publish status toggled successfully", video));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}