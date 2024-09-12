import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addVideos } from '../redux/videosSlice';

const AddVideoForm = () => {
  const dispatch = useDispatch();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile); 
    if (thumbnailFile) {
      formData.append('thumbnailFile', thumbnailFile); 
    }

    
    dispatch(addVideos(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Description</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Video File</label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={(e) => setVideoFile(e.target.files[0])} 
          required 
        />
      </div>
      <div>
        <label>Thumbnail File (Optional)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setThumbnailFile(e.target.files[0])} 
        />
      </div>
      <button type="submit">Publish Video</button>
    </form>
  );
};

export default AddVideoForm;
