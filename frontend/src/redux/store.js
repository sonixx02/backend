
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videosReducer from './videosSlice';
import uservideosReducer from './uservideosSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    uservideos: uservideosReducer
  },
});

export default store;
