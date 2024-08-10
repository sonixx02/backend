import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer'; // Adjust path if needed

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
  },
});
