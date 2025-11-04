import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/Routes';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  return (
    <Router>
      <Routes>
        {/* Login Page Route */}
        <Route
          path="/"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Signup Page Route */}
        <Route
          path="/signup"
          element={<SignupPage />}
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            isLoggedIn ? (
              <div style={{ display: 'flex' }}>
                <Sidebar /> {/* Left-side menu */}
                <div style={{ flex: 1, padding: '20px' }}>
                  <AppRoutes /> {/* Main content */}
                </div>
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Redirect all unknown paths to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
