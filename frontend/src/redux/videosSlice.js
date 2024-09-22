import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to update video
export const updateVideo = createAsyncThunk('videos/updateVideo', async ({ videoId, title, description, videoFile }) => {
  try {
    // Update the title and description
    const response = await axios.put(`http://localhost:8000/api/v1/users/${videoId}`, 
      { title, description },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // If a new video file is provided, update it separately
    if (videoFile) {
      const formData = new FormData();
      formData.append('videoFile', videoFile);
      await axios.put(`http://localhost:8000/api/v1/users/${videoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Fetch the updated video data
    const updatedVideoResponse = await axios.get(`http://localhost:8000/api/v1/users/${videoId}`);
    return updatedVideoResponse.data.data;
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to delete video
export const deleteVideo = createAsyncThunk('videos/deleteVideo', async (videoId) => {
  try {
    await axios.delete(`http://localhost:8000/api/v1/users/${videoId}`);
    return videoId; // Return the ID of the deleted video
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to fetch random videos
export const RandomVideos = createAsyncThunk('videos/RandomVideos', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/users/dashboard/random');
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to fetch videos by query
export const fetchVideos = createAsyncThunk('videos/fetchVideos', async (query) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/getVideos?query=${query}`);
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to add a new video
export const addVideo = createAsyncThunk('videos/addVideo', async (formData) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/users/publish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.message;
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to fetch video by ID
export const fetchVideoById = createAsyncThunk('videos/fetchVideoById', async (videoId) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/${videoId}`);
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to add to watch history
export const addToWatchHistory = createAsyncThunk('videos/addToWatchHistory', async (videoId) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/users/watch-history', { videoId });
    console.log(response.data);
    return response.data;
     // Assuming response.data contains the updated watch history
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Async thunk to fetch watch history
export const fetchWatchHistory = createAsyncThunk('videos/fetchWatchHistory', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/users/history', {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.data.data);
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

// Video slice
const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    videos: [],
    watchHistory: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(RandomVideos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(RandomVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos = action.payload;
      })
      .addCase(RandomVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchVideos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addVideo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(state.videos)) {
          state.videos.push(action.payload);
        }
      })
      .addCase(addVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchVideoById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteVideo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(state.videos)) {
          state.videos = state.videos.filter(video => video._id !== action.payload); // Ensure videos is an array
        } else {
          console.error('State.videos is not an array:', state.videos);
        }
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateVideo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedVideo = action.payload;

        // Check if state.videos is an array before using findIndex
        if (Array.isArray(state.videos)) {
          const index = state.videos.findIndex(video => video._id === updatedVideo._id);
          if (index !== -1) {
            state.videos[index] = updatedVideo;
          }
        } else {
          console.error('State.videos is not an array:', state.videos);
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addToWatchHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToWatchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if(Array.isArray(state.watchHistory)){
        state.watchHistory.push(action.payload);
        }
      })
      .addCase(addToWatchHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchWatchHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.watchHistory = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default videosSlice.reducer;
