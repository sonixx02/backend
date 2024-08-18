// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videosReducer from './videosSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer, // Ensure this is included
  },
});

export default store;
