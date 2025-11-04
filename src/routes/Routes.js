import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmailPage from '../Pages/EmailPage';
import TemplatePage from '../Pages/TemplatePage';
import LoginPage from '../LoginPage';
// import SignupPage from '../SignupPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      {/* <Route path="/signup" element={<SignupPage />} /> */}
      <Route path="/email" element={<EmailPage />} />
      <Route path="/template" element={<TemplatePage />} />
    </Routes>
  );
};

export default AppRoutes;