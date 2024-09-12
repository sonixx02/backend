import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const RandomVideos = createAsyncThunk('videos/RandomVideos', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/users/dashboard/random');
    console.log("API Response: ", response.data); 
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});


export const fetchVideos = createAsyncThunk('videos/fetchVideos', async (query) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/getVideos?query=${query}`);
    console.log("API Response: ", response.data); 
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});


export const addVideo = createAsyncThunk('videos/addVideo', async (formData) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/users/publish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("Video Published: ", response.data.message); 
    return response.data.message;
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});



export const fetchVideoById = createAsyncThunk('videos/fetchVideoById', async (videoId) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/${videoId}`);
    return response.data.data; 
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    videos: [],
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
  },
});

export default videosSlice.reducer;
