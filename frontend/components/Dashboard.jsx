import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getCurrentUser from "../src/features/authslice.js" // Assuming you have an action to get current user
import { fetchDashboardData } from '../src/features/dashboardActions'; // Assuming you have an action to fetch dashboard data

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth); // Get user and token from state
  const dashboardData = useSelector((state) => state.dashboard.data); // Get dashboard data from state

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser()); // Fetch current user
      dispatch(fetchDashboardData()); // Fetch dashboard data
    }
  }, [dispatch, token]);

  if (!user) {
    return <p className="text-center text-lg">Loading...</p>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Welcome, {user.name}</h1>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Statistics</h2>
          <div className="space-y-2">
            <p className="text-lg">Total Videos: {dashboardData?.totalVideos || 0}</p>
            <p className="text-lg">Total Playlists: {dashboardData?.totalPlaylists || 0}</p>
            <p className="text-lg">Total Likes: {dashboardData?.totalLikes || 0}</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <ul className="list-disc list-inside space-y-2">
            {dashboardData?.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <li key={index} className="text-lg">{activity}</li>
              ))
            ) : (
              <li className="text-lg">No recent activity</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
