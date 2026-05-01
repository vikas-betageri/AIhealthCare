import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HealthProvider, useHealth } from './context/HealthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';
import Approvals from './pages/admin/Approvals';
import PatientManagement from './pages/admin/PatientManagement';
import AllAppointments from './pages/admin/AllAppointments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAIAnalyzer from './pages/doctor/DoctorAIAnalyzer';
import DoctorAIChat from './pages/doctor/DoctorAIChat';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAIChat from './pages/patient/PatientAIChat';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientReports from './pages/patient/PatientReports';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userType } = useHealth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userType)) return <Navigate to="/" />;
  
  return (
    <div className="flex bg-slate-50 dark:bg-[#0F172A] min-h-screen overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 p-4 sm:p-6 md:p-8 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/doctors" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DoctorManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/approvals" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Approvals />
        </ProtectedRoute>
      } />
      <Route path="/admin/patients" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PatientManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/appointments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AllAppointments />
        </ProtectedRoute>
      } />

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/appointments" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorAppointments />
        </ProtectedRoute>
      } />
      <Route path="/doctor/patients" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorPatients />
        </ProtectedRoute>
      } />
      <Route path="/doctor/analyzer" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorAIAnalyzer />
        </ProtectedRoute>
      } />
      <Route path="/doctor/chat" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorAIChat />
        </ProtectedRoute>
      } />

      {/* Patient Routes */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient/doctors" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <BrowseDoctors />
        </ProtectedRoute>
      } />
      <Route path="/patient/appointments" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientAppointments />
        </ProtectedRoute>
      } />
      <Route path="/patient/reports" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientReports />
        </ProtectedRoute>
      } />
      <Route path="/patient/chat" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientAIChat />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HealthProvider>
  );
}
