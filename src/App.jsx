import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Splash from './pages/Splash';
import Login from './pages/Login';
import LoginForm from './pages/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';

import EmployeeLayout from './pages/employee/EmployeeLayout';
import DriverLayout from './pages/driver/DriverLayout';
import CompanyLayout from './pages/company/CompanyLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/:role" element={<LoginForm />} />

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/*"
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <CompanyLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
