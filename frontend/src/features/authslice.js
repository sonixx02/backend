// src/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login, register } from '../services/authService'; // Adjust path if needed

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, logout, setError } = authSlice.actions;

export const loginUser = (email, password) => async (dispatch) => {
  try {
    const userData = await login(email, password);
    dispatch(setUser({ user: userData.user, token: userData.token }));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const registerUser = (email, password) => async (dispatch) => {
  try {
    const userData = await register(email, password);
    dispatch(setUser({ user: userData.user, token: userData.token }));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default authSlice.reducer;
