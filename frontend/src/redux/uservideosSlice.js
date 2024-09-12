import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const getChannelVideos = createAsyncThunk('uservideos/getChannelVideos', async (username) => {
  try {
    
    const response = await axios.get(`http://localhost:8000/api/v1/users/dashboard/channel-videos/${username}`);
    console.log(response);
    return response.data.data.videos;
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});

const uservideosSlice = createSlice({
  name: 'uservideos',
  initialState: {
    videos: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getChannelVideos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getChannelVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos = action.payload; 
      })
      .addCase(getChannelVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default uservideosSlice.reducer;
