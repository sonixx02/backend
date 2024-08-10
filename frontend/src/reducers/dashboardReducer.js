// src/reducers/dashboardReducer.js
import { FETCH_DASHBOARD_DATA_SUCCESS, FETCH_DASHBOARD_DATA_FAILURE } from '../features/dashboardActions';

const initialState = {
  data: null,
  error: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DASHBOARD_DATA_SUCCESS:
      return {
        ...state,
        data: action.payload,
      };
    case FETCH_DASHBOARD_DATA_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default dashboardReducer;
