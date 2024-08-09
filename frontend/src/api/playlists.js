import api from './api';

// Create a playlist
export const createPlaylist = async (playlistData) => {
  try {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};

// Get user playlists
export const getUserPlaylists = async () => {
  try {
    const response = await api.get('/playlists');
    return response.data;
  } catch (error) {
    console.error('Error fetching playlists:', error);
  }
};

// Other playlist-related functions...
