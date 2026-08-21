import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  Zap,
  Settings,
  Users,
  Car,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Layers2,
  ListChecks,
  Tag,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  collapsed = false,
  onToggleCollapse = () => {},
  mobileOpen = false,
  onCloseMobile = () => {}
}) {
  const { logout } = useAuth();
  const location = useLocation();

  // Settings dropdown state
  const isSettingsActive = location.pathname.startsWith('/settings');
  const [settingsOpen, setSettingsOpen] = useState(true);

  const handleLinkClick = () => {
    onCloseMobile();
  };

  const renderNavLinks = (isMini = false) => (
    <nav className="space-y-1.5 text-sm flex-1">
      {/* 1. Dashboard */}
      <NavLink
        to="/"
        end
        onClick={handleLinkClick}
        title="Dashboard"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>Dashboard</span>}
      </NavLink>

      {/* 2. QR Inventory */}
      <NavLink
        to="/qr"
        onClick={handleLinkClick}
        title="QR Inventory"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <QrCode className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>QR Inventory</span>}
      </NavLink>

      {/* 3. User Accounts */}
      <NavLink
        to="/users"
        onClick={handleLinkClick}
        title="User Accounts"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <Users className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>User Accounts</span>}
      </NavLink>

      {/* 4. Vehicles Registry */}
      <NavLink
        to="/vehicles"
        onClick={handleLinkClick}
        title="Vehicles Registry"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <Car className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>Vehicles Registry</span>}
      </NavLink>

      {/* 5. Emergency Alerts */}
      <NavLink
        to="/alerts"
        onClick={handleLinkClick}
        title="Emergency Alerts"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>Emergency Alerts</span>}
      </NavLink>

      {/* 6. Extra Quota Pricing */}
      <NavLink
        to="/packages"
        onClick={handleLinkClick}
        title="Extra Quota Pricing"
        className={({ isActive }) =>
          `flex items-center ${isMini ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl font-medium transition ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <Zap className="w-5 h-5 flex-shrink-0" />
        {!isMini && <span>Extra Quota Pricing</span>}
      </NavLink>

      {/* 7. SETTINGS COLLAPSIBLE SECTION */}
      <div className="pt-1">
        {isMini ? (
          <NavLink
            to="/settings/qr-types"
            onClick={handleLinkClick}
            title="Settings"
            className={({ isActive }) =>
              `flex items-center justify-center px-0 py-3 rounded-xl font-medium transition ${
                isSettingsActive
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
          </NavLink>
        ) : (
          <>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium transition ${
                isSettingsActive
                  ? 'bg-slate-800/80 text-indigo-300 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <span>Setting</span>
              </div>
              {settingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Sub-menu */}
            {settingsOpen && (
              <div className="ml-5 pl-3 border-l border-slate-700/60 space-y-1 mt-1.5 py-1">
                <NavLink
                  to="/settings/qr-types"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  📦 QR Types
                </NavLink>

                <NavLink
                  to="/settings/reasons"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  📋 Scan Reasons
                </NavLink>

                <NavLink
                  to="/settings/tags"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  🏷️ Batch Tags
                </NavLink>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* 1. DESKTOP FIXED SIDEBAR (100% fixed height, smooth collapse/expand) */}
      <aside
        className={`hidden md:flex flex-col h-full bg-[#13182e] text-slate-300 p-4 shadow-xl flex-shrink-0 z-30 transition-all duration-300 ease-in-out border-r border-slate-800/80 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 py-3 mb-4 border-b border-slate-800/80 min-h-[56px]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center font-black text-xl flex-shrink-0">
              D
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="font-black text-lg tracking-tight text-white truncate">Dashboard</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold truncate">Safe Drive Admin</div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar">
          {renderNavLinks(collapsed)}
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-slate-800/80 mt-auto">
          <button
            onClick={logout}
            title="Logout"
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold ${
              collapsed ? 'py-3 px-0 justify-center' : 'py-3 px-4'
            } rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 text-sm`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SLIDE-IN DRAWER & OVERLAY (< 768px screens) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Sliding Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#13182e] text-slate-300 p-4 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center font-black text-xl">
                    D
                  </div>
                  <div>
                    <div className="font-black text-lg tracking-tight text-white">Dashboard</div>
                    <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">Safe Drive Admin</div>
                  </div>
                </div>

                <button
                  onClick={onCloseMobile}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavLinks(false)}
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={logout}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
