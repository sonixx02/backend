import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RandomVideos } from "../redux/videosSlice";
import { logout } from "../redux/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { videos, status, error } = useSelector((state) => state.videos);
  const user = useSelector((state) => state.auth.user);

  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(RandomVideos());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const videoArray = videos?.videos || []; 


  const filteredVideos = videoArray.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );

  const videoList = query ? filteredVideos : videoArray;

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>

      <h1>Welcome, {user?.username || 'Guest'}!</h1>

      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Submit
        </button>
      </form>

      {videoList.length > 0 ? (
        <div>
          {videoList.map((video) => (
            <div key={video._id}>
              <h2>{video.title}</h2>
              <video src={video.videoFile} controls />
              <p>{video.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>No videos available</div>
      )}
    </div>
  );
};

export default Dashboard;
