import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";

// Utility function to check if the user is the owner of the playlist
const isPlaylistOwner = async (playlistId, userId) => {
    try {
        const playlist = await Playlist.findById(playlistId);
        return playlist ? playlist.owner.toString() === userId.toString() : false;
    } catch (error) {
        throw new ApiError(500, "Internal server error.");
    }
};

// Create a new playlist
 const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) throw new ApiError(400, "Playlist name is required.");

    const existingPlaylist = await Playlist.findOne({ name, owner: req.user?._id });
    if (existingPlaylist) throw new ApiError(400, "Playlist already exists.");

    const playlist = await Playlist.create({ name, description, videos: [], owner: req.user?._id });
    if (!playlist) throw new ApiError(500, "Error creating playlist. Please try again later.");

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully."));
});

// Get all playlists for a user
 const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID.");

    const playlists = await Playlist.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                pipeline: [{ $project: { thumbnail: 1 } }],
                as: "videoDetails"
            }
        },
        { $project: { name: 1, description: 1, videoDetails: 1, owner: 1, _id: 1 } }
    ]);

    if (!playlists.length) throw new ApiError(404, "No playlists found for this user.");

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists retrieved successfully."));
});

// Get a playlist by ID
 const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID.");

    const playlist = await Playlist.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            pipeline: [{ $project: { username: 1 } }],
                            as: "channelDetails"
                        }
                    },
                    { $project: { thumbnail: 1, title: 1, duration: 1, views: 1, owner: 1, channelDetails: 1 } }
                ],
                as: "videoDetails"
            }
        }
    ]);

    if (!playlist.length) throw new ApiError(404, "Playlist not found.");

    return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist retrieved successfully."));
});

// Add a video to a playlist
 const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid ID.");

    const isOwner = await isPlaylistOwner(playlistId, req.user._id);
    if (!isOwner) throw new ApiError(401, "Unauthorized request.");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: new mongoose.Types.ObjectId(videoId) } },
        { new: true }
    );

    if (!updatedPlaylist) throw new ApiError(500, "Error adding video to playlist.");

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully."));
});

// Remove a video from a playlist
 const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid ID.");

    const isOwner = await isPlaylistOwner(playlistId, req.user._id);
    if (!isOwner) throw new ApiError(401, "Unauthorized request.");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
        { new: true }
    );

    if (!updatedPlaylist) throw new ApiError(500, "Error removing video from playlist.");

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully."));
});

// Delete a playlist
 const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID.");

    const isOwner = await isPlaylistOwner(playlistId, req.user._id);
    if (!isOwner) throw new ApiError(401, "Unauthorized request.");

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) throw new ApiError(500, "Error deleting playlist.");

    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully."));
});

// Update a playlist
 const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name && !description) throw new ApiError(400, "Nothing to update.");

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID.");

    const isOwner = await isPlaylistOwner(playlistId, req.user._id);
    if (!isOwner) throw new ApiError(401, "Unauthorized request.");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found.");

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    const updatedPlaylist = await playlist.save();

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully."));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};