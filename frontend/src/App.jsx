import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Logout from './components/Logout';

const App = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="/" element={<Login />} />
        ) : (
          <Route path="/" element={<Logout />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
