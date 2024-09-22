import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  RandomVideos,
  addVideo,
  addToWatchHistory,
} from "../redux/videosSlice";
import { logout } from "../redux/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { videos, status, error } = useSelector((state) => state.videos);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    file: null,
  });

  const videoRefs = useRef({}); // To store refs for each video

  useEffect(() => {
    dispatch(RandomVideos());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setNewVideo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newVideo.title && newVideo.file) {
      const formData = new FormData();
      formData.append("title", newVideo.title);
      formData.append("description", newVideo.description);
      formData.append("videoFile", newVideo.file);

      dispatch(addVideo(formData)).then(() => {
        dispatch(RandomVideos());
        setShowForm(false);
        setNewVideo({ title: "", description: "", file: null });
      });
    } else {
      alert("Please fill out the title and select a video file.");
    }
  };

  const handleAdminPage = () => {
    pauseAllVideos();
    navigate("/admin");
  };

  const handleVideoClick = (videoId) => {
    pauseAllVideos();
    dispatch(addToWatchHistory(videoId)).then(() => {
      console.log(`Video ID ${videoId} added to watch history`);
      navigate(`/video/${videoId}`);
    });
  };

  // Pauses all playing videos when navigating away
  const pauseAllVideos = () => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0; // Optionally reset the time
      }
    });
  };

  const videoArray = videos?.videos || [];
  const filteredVideos = videoArray.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );
  const videoList = query ? filteredVideos : videoArray;

  useEffect(() => {
    return () => {
      pauseAllVideos();
    };
  }, []);

  if (status === "loading") {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (status === "failed") {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Add Video
        </button>

        <button
          onClick={handleAdminPage}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Admin
        </button>
      </div>

      <h1 className="text-3xl font-bold mt-4">
        Welcome, {user?.data?.user?.username || "Guest"}!
      </h1>

      <form onSubmit={(e) => e.preventDefault()} className="mt-6 mb-8 flex">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search..."
          className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-4 border rounded bg-gray-50"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={newVideo.title}
              onChange={handleFormChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={newVideo.description}
              onChange={handleFormChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Video File
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFormChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              accept="video/*"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Upload
            </button>
          </div>
        </form>
      )}

      {videoList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videoList.map((video) => (
            <div
              key={video._id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
            >
              <h2 className="text-xl font-semibold p-4">{video.title}</h2>
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                {" "}
                {/* 16:9 aspect ratio */}
                <video
                  ref={(el) => (videoRefs.current[video._id] = el)}
                  controls
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  onPlay={() => handleVideoClick(video._id)}
                >
                  <source src={video.videoFile} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="p-4 text-gray-700">{video.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No videos available</div>
      )}
    </div>
  );
};

export default Dashboard;
