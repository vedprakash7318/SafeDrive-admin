import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Calendar, Bell, AlertTriangle } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';

export default function Header({
  onToggleSidebar = () => {},
  sidebarCollapsed = false,
  mobileSidebarOpen = false
}) {
  const { user } = useAuth();
  
  // Format current date roughly matching the design
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' - Today';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user?.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API_BASE}/user/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/user/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // On mobile, if mobileSidebarOpen is true, it's open (show X).
  // On desktop, if sidebarCollapsed is false, it's open (show X).
  const isSidebarOpen = isMobile ? mobileSidebarOpen : !sidebarCollapsed;

  return (
    <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between z-20">
      {/* Sidebar Toggle Button + Greeting Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition border border-slate-200"
          title="Toggle Sidebar (Open / Close)"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-lg md:text-xl font-display font-black tracking-tight text-slate-900 leading-tight">
            Welcome Back, <span className="text-brand-orange">Admin!</span> 👋
          </h2>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">Here's what's happening with your SafeDrive Tag system today.</div>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Date Picker Badge */}
        <div className="hidden lg:flex items-center space-x-2 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 bg-white shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{dateStr}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-2" />
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2 rounded-full border transition ${showDropdown ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
          >
            <Bell className="w-5 h-5" />
          </button>
          
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white -mt-1 -mr-1 shadow-sm">
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 origin-top-right">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs font-semibold text-brand-orange">{notifications.filter(n => !n.isRead).length} unread</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">No notifications yet.</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-4 border-b border-slate-100 last:border-0 cursor-pointer transition ${n.isRead ? 'bg-white opacity-60' : 'bg-[#fff9f2] hover:bg-[#fff2e5]'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 p-1.5 rounded-full ${n.type === 'SYSTEM' ? 'bg-red-100 text-red-600' : 'bg-brand-orange/20 text-brand-orange'}`}>
                          {n.type === 'SYSTEM' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'} truncate`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3 pl-2 md:pl-4 border-l border-slate-200">
          <div className="w-10 h-10 rounded-full bg-brand-green text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-bold text-slate-900 leading-none">Admin</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Super Admin</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
