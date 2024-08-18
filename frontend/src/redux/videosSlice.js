import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const RandomVideos = createAsyncThunk('videos/RandomVideos', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/users/dashboard/random');
    console.log("API Response: ", response.data); // Debugging line
    return response.data.data;  // Return only the videos array
  } catch (error) {
    throw Error(error.message);
  }
});

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async () => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/getVideos?query=${query}`);
    console.log("API Response: ", response.data); // Debugging line
    return response.data.data;  // Return only the videos array
  } catch (error) {
    throw Error(error.message);
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
        state.videos = action.payload; // Set the videos to the fetched array
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
        state.videos = action.payload; // Set the videos to the fetched array
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default videosSlice.reducer;
