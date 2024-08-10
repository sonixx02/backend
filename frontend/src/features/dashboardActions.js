// src/actions/dashboardActions.js
import axios from 'axios';

export const FETCH_DASHBOARD_DATA_SUCCESS = 'FETCH_DASHBOARD_DATA_SUCCESS';
export const FETCH_DASHBOARD_DATA_FAILURE = 'FETCH_DASHBOARD_DATA_FAILURE';

export const fetchDashboardData = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/dashboard'); // Replace with your actual API endpoint
    dispatch({
      type: FETCH_DASHBOARD_DATA_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_DASHBOARD_DATA_FAILURE,
      payload: error.message,
    });
  }
};
