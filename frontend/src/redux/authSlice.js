import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


axios.defaults.withCredentials = true;

export const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    loginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    loginFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.status = 'idle'; 
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

const API_URL = 'http://localhost:8000/api/v1/users';


export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    dispatch(loginSuccess(response.data)); 
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch(loginFailure(errorMessage));
  }
};


export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    dispatch(logout());
  } catch (error) {
    console.error('Logout failed:', error.response?.data?.message || error.message);
  }
};

export default authSlice.reducer;
