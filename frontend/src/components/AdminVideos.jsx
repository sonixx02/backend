import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getChannelVideos, getChannelStatus } from "../redux/uservideosSlice";
import { updateVideo, deleteVideo } from "../redux/videosSlice";
import { useNavigate } from "react-router-dom";

const AdminVideos = () => {
  const dispatch = useDispatch();
  const { videos, channelStats, status, error } = useSelector(
    (state) => state.uservideos
  );
  const user = useSelector((state) => state.auth.user);

  const [editingVideo, setEditingVideo] = useState(null);
  const [updateData, setUpdateData] = useState({});
  const [videoFile, setVideoFile] = useState(null);

  const navigate = useNavigate(); // <-- Move useNavigate before return

  // Fetch videos and stats
  useEffect(() => {
    if (user?.data?.user?.username) {
      dispatch(getChannelVideos(user.data.user.username));
      dispatch(getChannelStatus(user.data.user.username)); 
    }
  }, [dispatch, user?.data?.user?.username]);

  // Handle update input change
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // Submit update
  const handleUpdate = () => {
    if (editingVideo) {
      const title = updateData.title || editingVideo.title;
      const description = updateData.description || editingVideo.description;
  
      dispatch(updateVideo({ 
        videoId: editingVideo._id, 
        title, 
        description, 
        videoFile: videoFile || null 
      }))
        .unwrap()
        .then(() => {
          setEditingVideo(null);
          setVideoFile(null);
          setUpdateData({});
          // Refresh the videos list
          dispatch(getChannelVideos(user.data.user.username));
        })
        .catch((error) => {
          console.error('Failed to update video:', error);
        });
    }
  };

  // Handle delete
  const handleDelete = (videoId) => {
    dispatch(deleteVideo(videoId)).then(() => {
      dispatch(getChannelVideos(user.data.user.username));
    });
  };

  // Display loading status
  if (status === "loading") {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  // Handle errors
  if (status === "failed") {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  const handleHistoryPage = () => {
    navigate("/History");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Admin Dashboard - Manage Videos
      </h1>
      <button
        onClick={handleHistoryPage}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        WatchHistory
      </button>

      {/* Display Channel Stats */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <img
            src={channelStats?.avatar}
            alt="Channel Avatar"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-bold">{channelStats?.username}</h2>
            <p className="text-gray-500">
              Created on:{" "}
              {channelStats?.createdAt &&
                new Date(channelStats.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-xl font-semibold">
              {channelStats?.totalSubscribers}
            </p>
            <p className="text-gray-500">Subscribers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{channelStats?.totalViews}</p>
            <p className="text-gray-500">Total Views</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{channelStats?.totalVideos}</p>
            <p className="text-gray-500">Total Videos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{channelStats?.totalLikes}</p>
            <p className="text-gray-500">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Display Videos */}
      {Array.isArray(videos) && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <h2 className="text-xl font-semibold p-4">{video.title}</h2>
              <video src={video.videoFile} controls className="w-full"></video>
              <p className="p-4 text-gray-700">
                {video.description || "No description available"}
              </p>
              <div className="p-4">
                <button
                  onClick={() => setEditingVideo(video)}
                  className="mr-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No videos available</div>
      )}

      {/* Update Video Form */}
      {editingVideo && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Update Video</h2>
          <input
            type="text"
            name="title"
            value={updateData.title || editingVideo.title}
            onChange={handleUpdateChange}
            placeholder="Title"
            className="mb-2 p-2 border rounded w-full"
          />
          <textarea
            name="description"
            value={updateData.description || editingVideo.description}
            onChange={handleUpdateChange}
            placeholder="Description"
            className="mb-2 p-2 border rounded w-full"
          />
          <input
            type="file"
            name="videoFile"
            accept="video/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Update Video
          </button>
          <button
            onClick={() => setEditingVideo(null)}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminVideos;
