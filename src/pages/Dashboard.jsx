import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Users,
  QrCode,
  Box,
  Phone,
  MessageSquare,
  IndianRupee,
  ShieldAlert,
  RefreshCw,
  Plus,
  ArrowRight,
  ChevronRight,
  Download,
  Calendar
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Dashboard() {
  const { authHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/stats`, authHeader);
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Filter Bar (Matching screenshot "Employee Report / Overview...") */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Vehicle Safety Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Overview of QR distribution, user activations, and emergency scan performance
          </p>
        </div>

        {/* Filter Controls Bar (Matching screenshot) */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <select className="bg-white border border-slate-200 text-xs font-semibold rounded-xl px-4 py-2.5 text-slate-700 shadow-xs focus:outline-none">
            <option value="all">All Vehicles & Batches</option>
            <option value="active">Active Only</option>
          </select>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 shadow-xs flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today: {todayDateStr}</span>
          </div>

          <button
            onClick={fetchStats}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Stats</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL 7 KPI METRIC CARDS (EXACTLY MATCHING THE UPLOADED SCREENSHOT) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Card 1: TOTAL USERS (Blue circular icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/25">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              TOTAL USERS
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          </div>

          {/* Card 2: ACTIVE QRS (Orange/Amber circular icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/25">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              ACTIVE QRS
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.activeQRs}</div>
          </div>

          {/* Card 3: IN STOCK QRS (Red circular icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center mb-3 shadow-md shadow-rose-500/25">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              IN STOCK
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.inStockQRs}</div>
          </div>

          {/* Card 4: CALLS USED (Sky Blue circular icon + Date subtitle) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center mb-3 shadow-md shadow-sky-500/25">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              CALLS USED
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalCallsUsed}</div>
            <span className="text-[9px] text-slate-400 mt-0.5">{todayDateStr}</span>
          </div>

          {/* Card 5: MSGS SENT (Purple circular icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-500/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              MSGS SENT
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalMessagesUsed}</div>
          </div>

          {/* Card 6: REVENUE (Green circular icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/25">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              REVENUE
            </span>
            <div className="text-2xl font-black text-slate-900">₹{stats.totalRevenue}</div>
          </div>

          {/* Card 7: EMERGENCY ALERTS (Dark Grey / Rose icon) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center mb-3 shadow-md shadow-slate-800/25">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              EMERGENCY
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.emergencyAlertsCount || 0}</div>
          </div>
        </div>
      )}

      {/* Emergency Banner if any alerts */}
      {stats && stats.emergencyAlertsCount > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600 text-white rounded-xl animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Emergency Alerts Logged ({stats.emergencyAlertsCount})</h3>
              <p className="text-xs text-red-700">QR scanners have triggered emergency GPS location dispatches.</p>
            </div>
          </div>
          <Link
            to="/alerts"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            Review Alerts Log →
          </Link>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-600/15 flex flex-col justify-between">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              QR Batch Generation
            </span>
            <h3 className="text-lg font-bold mb-1">Create QR Stickers</h3>
            <p className="text-xs text-indigo-100 mb-5">
              Fixed prefix SD with auto-increment sequences and tag binding.
            </p>
          </div>
          <Link
            to="/qr"
            className="inline-flex items-center space-x-2 bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md hover:bg-indigo-50 transition w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Generate QR Batch</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              Public Scanner Setup
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Scan Reasons</h3>
            <p className="text-xs text-slate-500 mb-5">
              Add, edit, or delete the reasons shown on the public scan page.
            </p>
          </div>
          <Link
            to="/settings/reasons"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition w-fit"
          >
            <span>Configure Reasons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              Partner Distribution
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Batch Tags</h3>
            <p className="text-xs text-slate-500 mb-5">
              Create and manage batch tags for dealers, showrooms, and partners.
            </p>
          </div>
          <Link
            to="/settings/tags"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition w-fit"
          >
            <span>Manage Tags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
