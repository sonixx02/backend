import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Playlist name is required or description");
  }

  const existingPlaylist = await Playlist.findOne({ name });

  if (existingPlaylist) {
    throw new ApiError(400, "Playlist already exists.");
  }

  const playlist = await Playlist.create({
    name,
    description,
    videos: [],
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Error creating playlist. Please try again later.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully."));
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user doesnt exist");
  }

  const playlist = await playlist.findOne({ owner: userId });

  if (!playlist.length) {
    throw new ApiError(404, "No playlists found for this user.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists retrieved successfully."));
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "PlaylistId doesnt exist");
  }

  const playlist = await playlist.findOne({ owner: playlistId });

  if (!playlist.length) {
    throw new ApiError(404, "No playlists found for this ID.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists retrieved successfully."));

  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist ID and Video ID are required.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  // Check if video is already in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video is already in the playlist.");
  }

  playlist.videos.push(videoId);
  const updatedPlaylist = await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully."
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist ID and Video ID are required.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  playlist.videos = playlist.videos.filter(id => id.toString() !== videoId)
  const updatedPlaylist = await playlist.save();

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Video removed from playlist successfully.'));
  
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully."));
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required.");
  }

  if (!name && !description) {
    throw new ApiError(400, "At least one field (name or description) is required to update.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  // Update fields
  if (name) playlist.name = name;
  if (description) playlist.description = description;

  const updatedPlaylist = await playlist.save();

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully."));
  //TODO: update playlist
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
