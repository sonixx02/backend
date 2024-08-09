import api from './api';

// Get all videos
export const getAllVideos = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
};

// Publish a video
export const publishVideo = async (formData) => {
  try {
    const response = await api.post('/publish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error publishing video:', error);
  }
};

// Other video-related functions...
