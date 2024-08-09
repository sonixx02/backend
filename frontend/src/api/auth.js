import api from './api';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token); // Save JWT token
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
  }
};

// Other auth-related functions...
