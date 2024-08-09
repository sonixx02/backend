import api from './api';

// Get comments for a video
export const getVideoComments = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

// Add a comment
export const addComment = async (videoId, commentData) => {
  try {
    const response = await api.post(`/videos/${videoId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

// Other comment-related functions...
