import api from './api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/current-user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

// Other profile-related functions...
