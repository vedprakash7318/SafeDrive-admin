import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Activity,
  RefreshCw,
  Search,
  Phone,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Monitor,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Tag,
  Car,
  Bell,
  X,
  User,
  MapPin,
  TrendingUp,
  BarChart3,
  Flame
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function ScanLogs() {
  const { authHeader } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 30;
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState({
    totalAllLogs: 0,
    voiceCallsCount: 0,
    messagesCount: 0,
    pushAlertsCount: 0,
    verifiedScansCount: 0,
    failedAttemptsCount: 0,
    emergencyCount: 0,
    dailyTrend: [],
    topAssets: []
  });

  // Selected Log for Details Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/scan-logs`, {
        ...authHeader,
        params: {
          page,
          limit,
          eventType: eventTypeFilter,
          search
        }
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
        if (res.data.analytics) {
          setAnalytics(res.data.analytics);
        }
      }
    } catch (err) {
      console.error('Error fetching scan logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, eventTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'CALL_INITIATED':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E8A38] border border-emerald-200">
            <Phone className="w-3 h-3" />
            <span>Voice Call</span>
          </span>
        );
      case 'WHATSAPP_INITIATED':
      case 'SMS_INITIATED':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            <MessageSquare className="w-3 h-3" />
            <span>Direct Message</span>
          </span>
        );
      case 'PLATE_VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>PIN / Plate Verified</span>
          </span>
        );
      case 'PLATE_FAILED':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-[#F36F21] border border-orange-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Wrong 4-Digits</span>
          </span>
        );
      case 'REGISTRATION_VIEW':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Tag className="w-3 h-3" />
            <span>1st Time Scan</span>
          </span>
        );
      case 'PUSH_NOTIFICATION':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
            <Bell className="w-3 h-3" />
            <span>Push Alert</span>
          </span>
        );
      case 'EMERGENCY_SOS':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>🚨 Emergency SOS</span>
          </span>
        );
      case 'SCAN_VIEW':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <Eye className="w-3 h-3" />
            <span>Public Scan</span>
          </span>
        );
    }
  };

  // Compute Event Breakdown Counts & Percentages from Live Analytics
  const grandTotal = Math.max(analytics.totalAllLogs || 1, 1);
  const verifiedPct = Math.round(((analytics.verifiedScansCount || 0) / grandTotal) * 100);
  const callsPct = Math.round(((analytics.voiceCallsCount || 0) / grandTotal) * 100);
  const messagesPct = Math.round((((analytics.messagesCount || 0) + (analytics.pushAlertsCount || 0)) / grandTotal) * 100);
  const warningsPct = Math.round(((analytics.failedAttemptsCount || 0) / grandTotal) * 100);

  // Maximum value for dynamic chart scaling
  const maxTrendVal = Math.max(...(analytics.dailyTrend?.map(d => d.count) || [10]), 10);

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2">
            <span>QR Scan</span>
            <span className="text-[#1E8A38]">Audit Logs</span>
            <span>&</span>
            <span className="text-[#F36F21]">Live Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit log of all QR scans, security pin checks, masked voice calls, and direct notifications.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 bg-[#1E8A38] hover:bg-[#16702c] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Logs</span>
        </button>
      </div>

      {/* Real-time Dynamic Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Scans */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Logs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E8A38] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none mb-1">
            {analytics.totalAllLogs || total || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold">All Scan Records</div>
        </div>

        {/* Voice Calls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Voice Calls</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 text-[#1E8A38] flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 leading-none mb-1">
            {analytics.voiceCallsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold">{callsPct}% of all activity</div>
        </div>

        {/* Direct Messages */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Messages</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 leading-none mb-1">
            {analytics.messagesCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold">Direct Citizen Msgs</div>
        </div>

        {/* Push Alerts */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Push Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F36F21] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F36F21] leading-none mb-1">
            {analytics.pushAlertsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold">Instant App Pushes</div>
        </div>

        {/* Verified Scans */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verified PIN</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none mb-1">
            {analytics.verifiedScansCount || 0}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">✓ {verifiedPct}% Verified</div>
        </div>

        {/* Security Warnings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wrong PINs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F36F21] flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none mb-1">
            {analytics.failedAttemptsCount || 0}
          </div>
          <div className="text-[10px] text-orange-500 font-bold">{warningsPct}% Blocked</div>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT MAIN AREA: Search, Filter, and Table */}
        <div className="w-full lg:w-[70%] xl:w-[72%] space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone, plate, tag code, reason, IP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#1E8A38]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-2xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-[#1E8A38]"
              >
                <option value="ALL">All Event Types</option>
                <option value="CALL_INITIATED">📞 Voice Calls</option>
                <option value="WHATSAPP_INITIATED">💬 Direct Messages</option>
                <option value="PUSH_NOTIFICATION">🔔 Push Notifications</option>
                <option value="PLATE_VERIFIED">✓ Plate Verified</option>
                <option value="PLATE_FAILED">⚠️ Wrong 4-Digits</option>
                <option value="EMERGENCY_SOS">🚨 Emergency SOS</option>
                <option value="SCAN_VIEW">👁️ Public Scan Views</option>
                <option value="REGISTRATION_VIEW">🏷️ 1st-Time Scan</option>
              </select>

              <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
                Filtered: <span className="text-slate-900 font-black">{total}</span>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#1E8A38]" />
                <span className="font-bold">Loading live audit scan logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs space-y-2">
                <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600">No scan events recorded yet matching your filter.</p>
                <p className="text-[11px] text-slate-400">Scan any registered vehicle or item QR code to see live events appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-4 text-center w-10">#</th>
                      <th className="py-4 px-4">Timestamp</th>
                      <th className="py-4 px-4">Event Type</th>
                      <th className="py-4 px-4">Caller / Scanner Phone</th>
                      <th className="py-4 px-4">Vehicle Plate / Smart Tag</th>
                      <th className="py-4 px-4">Registered Owner</th>
                      <th className="py-4 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {logs.map((log, idx) => (
                      <tr key={log._id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-4 px-4 text-center font-bold text-slate-400 text-xs">
                          {(page - 1) * limit + idx + 1}
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                          <div className="font-black text-slate-900">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        {/* Event Badge & Reason / Message */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1.5">
                            {getEventBadge(log.eventType)}
                          </div>
                          {(log.message || log.reason) && (
                            <div className="text-xs font-bold text-slate-800 mt-1 flex items-center space-x-1 max-w-[240px] truncate" title={log.message || log.reason}>
                              <span className="text-[#1E8A38]">💬</span>
                              <span>{log.message || log.reason}</span>
                            </div>
                          )}
                          {log.notes && log.notes !== log.message && log.notes !== log.reason && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[240px] truncate" title={log.notes}>
                              {log.notes}
                            </div>
                          )}
                        </td>

                        {/* Caller / Scanner Phone */}
                        <td className="py-4 px-4 font-mono">
                          {log.callerPhone || log.scannerPhone ? (
                            <div>
                              <div className="text-slate-900 text-xs font-black">
                                +91 {log.callerPhone || log.scannerPhone}
                              </div>
                              <span className="text-[10px] text-emerald-600 font-bold font-sans">Verified Caller</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-sans italic">Visitor Scan</span>
                          )}
                        </td>

                        {/* Unified Scanned Vehicle Plate / Item Tag */}
                        <td className="py-4 px-4">
                          {log.vehicleNumber || log.vehicleId?.vehicleNumber ? (
                            <div>
                              <div className="text-[#1E8A38] font-black text-xs font-mono">
                                🚗 {log.vehicleNumber || log.vehicleId?.vehicleNumber}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Tag: {log.copyCode || log.productId}
                              </div>
                            </div>
                          ) : log.vehicleId?.itemName ? (
                            <div>
                              <div className="text-blue-600 font-bold text-xs">
                                🏷️ {log.vehicleId.itemName}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Tag: {log.copyCode || log.productId}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                                {log.copyCode || log.productId || 'SD-TAG'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Registered Owner */}
                        <td className="py-4 px-4">
                          {log.userId ? (
                            <div>
                              <Link
                                to={`/users/${log.userId._id}`}
                                className="font-bold text-slate-900 hover:text-[#1E8A38] hover:underline block truncate max-w-[140px]"
                              >
                                {log.userId.name}
                              </Link>
                              <div className="font-mono text-[10px] text-slate-500">+91 {log.userId.phone}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Visitor</span>
                          )}
                        </td>

                        {/* View Details */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            title="View Full Audit Log"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-bold text-slate-800">{total}</span> records
              </div>
              
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                >
                  ← Prev
                </button>
                
                <span className="px-3 py-1.5 bg-[#1E8A38] text-white rounded-xl font-black">
                  Page {page} of {pages}
                </span>

                <button
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ANALYTICS SIDEBAR: Real Charts & Diagrams */}
        <div className="w-full lg:w-[30%] xl:w-[28%] space-y-6">
          
          {/* 1. Real Events Breakdown Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-[#1E8A38]" />
                <span>Events by Type</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">Live Breakdown</span>
            </div>

            <div className="space-y-3.5">
              
              {/* Plate / PIN Verified */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                    Verified Scans
                  </span>
                  <span className="text-slate-900 font-black">{analytics.verifiedScansCount || 0} ({verifiedPct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(verifiedPct, 100)}%` }}></div>
                </div>
              </div>

              {/* Voice Calls */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E8A38] mr-2"></span>
                    Voice Calls
                  </span>
                  <span className="text-slate-900 font-black">{analytics.voiceCallsCount || 0} ({callsPct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E8A38] rounded-full transition-all duration-500" style={{ width: `${Math.min(callsPct, 100)}%` }}></div>
                </div>
              </div>

              {/* Messages & Push */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                    Messages & Push
                  </span>
                  <span className="text-slate-900 font-black">{(analytics.messagesCount || 0) + (analytics.pushAlertsCount || 0)} ({messagesPct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(messagesPct, 100)}%` }}></div>
                </div>
              </div>

              {/* Wrong 4 Digits / Warnings */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F36F21] mr-2"></span>
                    Wrong PINs
                  </span>
                  <span className="text-slate-900 font-black">{analytics.failedAttemptsCount || 0} ({warningsPct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F36F21] rounded-full transition-all duration-500" style={{ width: `${Math.min(warningsPct, 100)}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Real 7-Day Activity Diagram */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-[#F36F21]" />
                <span>7-Day Scan Activity</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Trend</span>
            </div>

            {/* Visual Bar Chart for 7 Days */}
            <div className="h-36 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
              {(analytics.dailyTrend && analytics.dailyTrend.length > 0 ? analytics.dailyTrend : [
                { label: 'D-6', count: 0 },
                { label: 'D-5', count: 0 },
                { label: 'D-4', count: 0 },
                { label: 'D-3', count: 0 },
                { label: 'D-2', count: 0 },
                { label: 'D-1', count: 0 },
                { label: 'Today', count: 0 }
              ]).map((day, dIdx) => {
                const heightPct = Math.max(Math.round((day.count / maxTrendVal) * 100), 8);
                const isToday = dIdx === (analytics.dailyTrend?.length || 7) - 1;

                return (
                  <div key={dIdx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-mono font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                      {day.count}
                    </span>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isToday ? 'bg-[#1E8A38]' : 'bg-slate-200 group-hover:bg-[#F36F21]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-[9px] font-black text-slate-400 mt-2 truncate max-w-[34px]">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Top Scanned Assets Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-[#F36F21]" />
                <span>Top Scanned Assets</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Frequency</span>
            </div>

            <div className="space-y-3">
              {analytics.topAssets && analytics.topAssets.length > 0 ? (
                analytics.topAssets.map((asset, aIdx) => {
                  const maxAssetCount = analytics.topAssets[0]?.count || 1;
                  const barPct = Math.round((asset.count / maxAssetCount) * 100);

                  return (
                    <div key={aIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center space-x-1 font-mono truncate max-w-[150px]">
                          <Car className="w-3.5 h-3.5 text-[#1E8A38] shrink-0" />
                          <span>{asset.vehicleNumber || asset.tag}</span>
                        </span>
                        <span className="text-slate-900 font-black">{asset.count} scans</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E8A38] to-[#F36F21] rounded-full"
                          style={{ width: `${barPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 text-xs py-4">
                  No frequent asset scan records yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* EVENT AUDIT DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#1E8A38]" />
                <h3 className="text-base font-black text-slate-900">Scan Event Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Event Type & Action</span>
                <div>{getEventBadge(selectedLog.eventType)}</div>
              </div>

              {/* Dedicated Message / Reason Content Box */}
              {(selectedLog.message || selectedLog.reason || selectedLog.notes) && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message / Reason Text</span>
                  </span>
                  <div className="text-xs font-bold text-slate-900 bg-white p-3 rounded-xl border border-blue-100 shadow-xs leading-relaxed">
                    {selectedLog.message || selectedLog.reason || selectedLog.notes}
                  </div>
                  {selectedLog.notes && selectedLog.notes !== selectedLog.message && selectedLog.notes !== selectedLog.reason && (
                    <p className="text-[11px] font-mono text-slate-500 pt-1">
                      Details: {selectedLog.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Caller / Scanner</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedLog.callerPhone || selectedLog.scannerPhone ? `+91 ${selectedLog.callerPhone || selectedLog.scannerPhone}` : 'Visitor (Anonymous)'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Registered Owner</span>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">
                    {selectedLog.userId?.name || 'Visitor'} {selectedLog.userId?.phone ? `(+91 ${selectedLog.userId.phone})` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Vehicle / Tag Code</span>
                  <div className="font-mono font-black text-[#1E8A38] mt-0.5">
                    {selectedLog.vehicleNumber || selectedLog.vehicleId?.vehicleNumber || selectedLog.vehicleId?.itemName || selectedLog.copyCode || selectedLog.productId || 'N/A'}
                  </div>
                  {(selectedLog.vehicleNumber || selectedLog.vehicleId?.vehicleNumber) && (
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Tag ID: {selectedLog.copyCode || selectedLog.productId}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Device Platform</span>
                  <div className="font-bold text-slate-700 mt-0.5 flex items-center space-x-1">
                    {selectedLog.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Monitor className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{selectedLog.device || 'Mobile'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">IP Address</span>
                  <div className="font-mono font-bold text-slate-700 mt-0.5 truncate">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">Device Platform</span>
                  <div className="font-bold text-slate-700 mt-0.5 flex items-center space-x-1">
                    {selectedLog.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Monitor className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{selectedLog.device || 'Mobile'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400">Timestamp</span>
                <div className="font-mono text-slate-700 mt-0.5">
                  {new Date(selectedLog.createdAt).toLocaleString('en-GB')}
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-2xl transition cursor-pointer"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
