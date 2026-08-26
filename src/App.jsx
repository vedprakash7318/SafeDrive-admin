import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QRManagement from './pages/QRManagement';
import QRDetails from './pages/QRDetails';
import QRGroupDetails from './pages/QRGroupDetails';
import QRTypes from './pages/QRTypes';
import QRFormats from './pages/QRFormats';
import SettingsTags from './pages/SettingsTags';
import GlobalSettings from './pages/GlobalSettings';
import ScanReasons from './pages/ScanReasons';
import ExtraPricing from './pages/ExtraPricing';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import QRUsers from './pages/QRUsers';
import QRUserDetails from './pages/QRUserDetails';
import Vehicles from './pages/Vehicles';
import Alerts from './pages/Alerts';
import ScanLogs from './pages/ScanLogs';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Orders from './pages/Orders';
import ContactMessages from './pages/ContactMessages';

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
        <Header 
          onToggleSidebar={handleToggleSidebar} 
          sidebarCollapsed={sidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
        />

        {/* Scrollable Main Content Body (Only this area scrolls!) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f8fafc]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/qr" element={<QRManagement />} />
            <Route path="/qr/group/:groupName" element={<QRGroupDetails />} />
            <Route path="/qr/:id" element={<QRDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/packages" element={<ExtraPricing />} />
            <Route path="/settings/qr-types" element={<QRTypes />} />
            <Route path="/settings/qr-formats" element={<Navigate to="/settings/qr-types" replace />} />
            <Route path="/settings/reasons" element={<ScanReasons />} />
            <Route path="/settings/tags" element={<SettingsTags />} />
            <Route path="/settings/global" element={<GlobalSettings />} />
            <Route path="/settings" element={<Navigate to="/settings/qr-types" replace />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/qr-users" element={<QRUsers />} />
            <Route path="/qr-users/:id" element={<QRUserDetails />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/contact-messages" element={<ContactMessages />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/scan-logs" element={<ScanLogs />} />
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
