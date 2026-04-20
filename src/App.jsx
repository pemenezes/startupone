import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

/* Import Pages */
import Splash from './pages/Splash';
import Login from './pages/Login';

import EmployeeLayout from './pages/employee/EmployeeLayout';
import DriverLayout from './pages/driver/DriverLayout';
import CompanyLayout from './pages/company/CompanyLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Raiz aponta for Splash */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        
        {/* Employee */}
        <Route path="/employee/*" element={<EmployeeLayout />} />
        
        {/* Driver */}
        <Route path="/driver/*" element={<DriverLayout />} />
        
        {/* Company */}
        <Route path="/company/*" element={<CompanyLayout />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
