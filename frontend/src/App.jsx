import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Logout from './components/Logout';
import Dashboard from './components/Dashboard';
import VideoDetail from './components/VideoDetail';
import AdminVideos from './components/AdminVideos'; 

const App = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/video/:videoId" element={<VideoDetail />} />
            <Route path="/admin" element={<AdminVideos />} /> 
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
