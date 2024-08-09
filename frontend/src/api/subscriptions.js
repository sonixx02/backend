import api from "./api";

// Subscribe to a channel
export const subscribeToChannel = async (channelId) => {
  try {
    const response = await api.post(`/subscribe/${channelId}`);
    return response.data;
  } catch (error) {
    console.error('Error subscribing to channel:', error);
  }
};

// Get user's subscriptions
export const getUserSubscriptions = async () => {
  try {
    const response = await api.get('/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
};

// Other subscription-related functions...
