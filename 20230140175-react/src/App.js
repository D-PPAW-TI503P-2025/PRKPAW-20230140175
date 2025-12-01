import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import semua halaman yang ada
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';

// Import komponen baru yang diminta soal
import Navbar from './components/Navbar'; 
import AttendancePage from './components/PresensiPage'; // Halaman Check-In/Out
import ReportPage from './components/ReportPage'; // Halaman Laporan Admin

function App() {
  return (
    <Router>
      <Navbar /> 

      <div className="w-full">
        <Routes>
          {/* Route Standar */}
          <Route path="/" element={<LoginPage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 3. Route Baru untuk Presensi dan Laporan */}
          <Route path="/presensi" element={<AttendancePage />} />
          <Route path="/laporan" element={<ReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;