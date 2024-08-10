// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/Login'; // Adjust path if needed
// import Dashboard from '../components/Dashboard'; // Adjust path if needed
// import PrivateRoute from '../components/PrivateRoute'; // Adjust path if needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} /> */}
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
