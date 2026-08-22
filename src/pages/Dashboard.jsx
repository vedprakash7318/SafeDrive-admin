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
      {/* Title & Filter Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Vehicle Safety Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Overview of QR distribution, user activations, and emergency scan performance
          </p>
        </div>

        {/* Filter Controls Bar */}
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
            className="flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Stats</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL 7 KPI METRIC CARDS WITH BRAND PALETTE */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Card 1: TOTAL USERS (Brand Blue #1D56A5) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#1D56A5] text-white flex items-center justify-center mb-3 shadow-md shadow-[#1D56A5]/25">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              TOTAL USERS
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          </div>

          {/* Card 2: ACTIVE QRS (Brand Green #259A3A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#259A3A] text-white flex items-center justify-center mb-3 shadow-md shadow-[#259A3A]/25">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              ACTIVE QRS
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.activeQRs}</div>
          </div>

          {/* Card 3: IN STOCK QRS (Brand Orange #E94E1A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#E94E1A] text-white flex items-center justify-center mb-3 shadow-md shadow-[#E94E1A]/25">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              IN STOCK
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.inStockQRs}</div>
          </div>

          {/* Card 4: CALLS USED (Brand Blue #1D56A5) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#1D56A5] text-white flex items-center justify-center mb-3 shadow-md shadow-[#1D56A5]/25">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              CALLS USED
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalCallsUsed}</div>
            <span className="text-[9px] text-slate-400 mt-0.5">{todayDateStr}</span>
          </div>

          {/* Card 5: MSGS SENT (Brand Green #259A3A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#259A3A] text-white flex items-center justify-center mb-3 shadow-md shadow-[#259A3A]/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              MSGS SENT
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalMessagesUsed}</div>
          </div>

          {/* Card 6: REVENUE (Brand Green #259A3A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#259A3A] text-white flex items-center justify-center mb-3 shadow-md shadow-[#259A3A]/25">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              REVENUE
            </span>
            <div className="text-2xl font-black text-slate-900">₹{stats.totalRevenue}</div>
          </div>

          {/* Card 7: EMERGENCY ALERTS (Brand Orange #E94E1A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition">
            <div className="w-11 h-11 rounded-full bg-[#E94E1A] text-white flex items-center justify-center mb-3 shadow-md shadow-[#E94E1A]/25">
              <ShieldAlert className="w-5 h-5 text-white" />
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
        <div className="bg-orange-50 border border-[#E94E1A]/30 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#E94E1A] text-white rounded-xl animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Emergency Alerts Logged ({stats.emergencyAlertsCount})</h3>
              <p className="text-xs text-slate-600">QR scanners have triggered emergency GPS location dispatches.</p>
            </div>
          </div>
          <Link
            to="/alerts"
            className="bg-[#E94E1A] hover:bg-[#d84414] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            Review Alerts Log →
          </Link>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1D56A5] to-[#164382] text-white p-6 rounded-3xl shadow-lg shadow-[#1D56A5]/20 flex flex-col justify-between">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              QR Batch Generation
            </span>
            <h3 className="text-lg font-bold mb-1">Create QR Stickers</h3>
            <p className="text-xs text-blue-100 mb-5">
              Fixed prefix SD with auto-increment sequences and tag binding.
            </p>
          </div>
          <Link
            to="/qr"
            className="inline-flex items-center space-x-2 bg-white text-[#1D56A5] font-bold px-4 py-2.5 rounded-xl text-xs shadow-md hover:bg-blue-50 transition w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Generate QR Batch</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="bg-[#E9DFEE] text-[#1D56A5] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              Public Scanner Setup
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Scan Reasons</h3>
            <p className="text-xs text-slate-500 mb-5">
              Add, edit, or delete the reasons shown on the public scan page.
            </p>
          </div>
          <Link
            to="/settings/reasons"
            className="inline-flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition w-fit"
          >
            <span>Configure Reasons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="bg-[#E9DFEE] text-[#E94E1A] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              Partner Distribution
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Batch Tags</h3>
            <p className="text-xs text-slate-500 mb-5">
              Create and manage batch tags for dealers, showrooms, and partners.
            </p>
          </div>
          <Link
            to="/settings/tags"
            className="inline-flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition w-fit"
          >
            <span>Manage Tags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
