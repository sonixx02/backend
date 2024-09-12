import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getChannelVideos } from '../redux/uservideosSlice';

const AdminVideos = () => {
  const dispatch = useDispatch();
  const { videos, status, error } = useSelector((state) => state.uservideos); 
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.data?.user?.username) {
      dispatch(getChannelVideos(user.data.user.username));
    }
  }, [dispatch, user?.data?.user?.username]);

  if (status === 'loading') {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard - Manage Videos</h1>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <h2 className="text-xl font-semibold p-4">{video.title}</h2>
              <video src={video.videoFile} controls className="w-full"></video>
              <p className="p-4 text-gray-700">{video.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No videos available</div>
      )}
    </div>
  );
};

export default AdminVideos;
