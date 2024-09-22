import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWatchHistory } from '../redux/videosSlice'; // Import your action
import { Link } from 'react-router-dom';

function History() {
  const dispatch = useDispatch();
  
  // Get the watch history from the Redux store
  const { watchHistory, status, error } = useSelector((state) => state.videos);

  // Fetch the watch history when the component mounts
  useEffect(() => {
    dispatch(fetchWatchHistory());
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Watch History</h1>
      {watchHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchHistory.map((video) => (
            <Link
              to={`/video/${video._id}`}
              key={video._id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
            >
              <h2 className="text-xl font-semibold p-4">{video.title}</h2>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
                <video
                  src={video.videoFile}
                  controls
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <p className="p-4 text-gray-700">{video.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No watch history available</div>
      )}
    </div>
  );
}

export default History;
