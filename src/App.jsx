import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QRManagement from './pages/QRManagement';
import QRTypes from './pages/QRTypes';
import SettingsTags from './pages/SettingsTags';
import ScanReasons from './pages/ScanReasons';
import ExtraPricing from './pages/ExtraPricing';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';
import Alerts from './pages/Alerts';

function AuthenticatedApp() {
  const { token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!token) {
    return <Login />;
  }

  const handleToggleSidebar = () => {
    // On mobile (<768px), toggle the mobile drawer
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // On desktop, collapse/expand the sidebar
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row bg-[#f8fafc] text-slate-900">
      {/* 1. Fixed Sidebar (Desktop Collapsible, Mobile Drawer) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Layout Container (Header is fixed, Main body scrolls) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Fixed Header */}
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Scrollable Main Content Body (Only this area scrolls!) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f8fafc]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/qr" element={<QRManagement />} />
            <Route path="/packages" element={<ExtraPricing />} />
            <Route path="/settings/qr-types" element={<QRTypes />} />
            <Route path="/settings/reasons" element={<ScanReasons />} />
            <Route path="/settings/tags" element={<SettingsTags />} />
            <Route path="/settings" element={<Navigate to="/settings/qr-types" replace />} />
            <Route path="/users" element={<Users />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
