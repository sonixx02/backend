// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust to your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // or from your preferred storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => api.post('/register', data);
export const loginUser = (data) => api.post('/login', data);
export const logoutUser = () => api.post('/logout');
export const refreshToken = () => api.post('/refresh-token');
export const changePassword = (data) => api.post('/change-password', data);
export const getCurrentUser = () => api.get('/current-user');
export const updateAccountDetails = (data) => api.patch('/update-account', data);
export const updateAvatar = (data) => api.patch('/avatar', data);
export const updateCoverImage = (data) => api.patch('/cover-image', data);
export const getUserChannelProfile = (username) => api.get(`/c/${username}`);
export const getWatchHistory = () => api.get('/history');
export const getAllVideos = () => api.get('/');
export const publishVideo = (data) => api.post('/publish', data);
export const getVideoById = (videoId) => api.get(`/${videoId}`);
export const updateVideo = (videoId, data) => api.put(`/${videoId}`, data);
export const deleteVideo = (videoId) => api.delete(`/${videoId}`);
export const togglePublishStatus = (videoId) => api.patch(`/${videoId}/toggle-publish`);
export const likeVideo = (videoId) => api.post(`/videos/${videoId}/like`);
export const addComment = (videoId, data) => api.post(`/videos/${videoId}/comments`, data);
export const updateComment = (commentId, data) => api.put(`/comments/${commentId}`, data);
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
export const createTweet = (data) => api.post('/tweets', data);
export const getUserTweets = () => api.get('/tweets');
export const updateTweet = (tweetId, data) => api.put(`/tweets/${tweetId}`, data);
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);
export const createPlaylist = (data) => api.post('/playlists', data);
export const getUserPlaylists = () => api.get('/playlists');
export const getPlaylistById = (playlistId) => api.get(`/playlists/${playlistId}`);
export const updatePlaylist = (playlistId, data) => api.patch(`/playlists/${playlistId}`, data);
export const deletePlaylist = (playlistId) => api.delete(`/playlists/${playlistId}`);
export const addVideoToPlaylist = (playlistId, videoId) => api.post(`/playlists/${playlistId}/videos/${videoId}`);
export const removeVideoFromPlaylist = (playlistId, videoId) => api.delete(`/playlists/${playlistId}/videos/${videoId}`);
export const toggleSubscription = (channelId) => api.post(`/subscribe/${channelId}`);
export const getUserChannelSubscribers = (channelId) => api.get(`/subscribers/${channelId}`);
export const getSubscribedChannels = (subscriberId) => api.get(`/subscriptions/${subscriberId}`);
export const getChannelStats = () => api.get('/dashboard/channel-stats');
export const getChannelVideos = () => api.get('/dashboard/channel-videos');
