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

export const getChannelStatus = createAsyncThunk('uservideos/getChannelStatus', async (username) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/users/dashboard/channel-stats/${username}`);
    console.log(response.data.data.channelStats); // Debugging response
    return response.data.data.channelStats; // Return the channelStats array
  } catch (error) {
    return Promise.reject(error.response?.data?.message || error.message);
  }
});




const uservideosSlice = createSlice({
  name: 'uservideos',
  initialState: {
    videos: [],
    channelStats: {}, // Add this
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
      })
      .addCase(getChannelStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.length > 0) {
            state.channelStats = action.payload[0]; // Safely access the first element
        }
    })
    
  },
});


export default uservideosSlice.reducer;
