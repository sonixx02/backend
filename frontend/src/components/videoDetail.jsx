// In your VideoDetail.jsx component
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVideoById } from '../redux/videosSlice'; // Adjust path as needed

const VideoDetail = () => {
  const { videoId } = useParams();
  const dispatch = useDispatch();
  const video = useSelector((state) => state.videos.selectedVideo);
  const status = useSelector((state) => state.videos.status);
  const error = useSelector((state) => state.videos.error);

  useEffect(() => {
    dispatch(fetchVideoById(videoId));
  }, [dispatch, videoId]);

  if (status === 'loading') {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center text-lg font-semibold">Error: {error}</div>;
  }

  if (!video) {
    return <div className="text-center text-lg font-semibold">Video not found</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
      <video src={video.videoFile} controls className="w-full mb-4"></video>
      <p className="text-gray-700">{video.description}</p>
    </div>
  );
};

export default VideoDetail;
