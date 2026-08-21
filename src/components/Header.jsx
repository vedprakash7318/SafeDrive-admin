import React from 'react';
import { ChevronDown, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  onToggleSidebar = () => {}
}) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shadow-xs z-20">
      {/* Sidebar Toggle Button + Greeting Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 shadow-2xs"
          title="Toggle Sidebar (Open / Close)"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base md:text-xl font-black tracking-tight text-slate-900 leading-tight">
            Welcome Back!
          </h2>
          <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Safe Drive Admin Panel</div>
        </div>
      </div>

      {/* Profile Badge (Matching screenshot "AD Admin Panel") */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
          AD
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight">Admin</div>
          <div className="text-[10px] text-slate-400 font-medium">Panel</div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
      </div>
    </header>
  );
}
