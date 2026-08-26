import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="relative">
          <button className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white -mt-1 -mr-1 shadow-sm">
            5
          </span>
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
