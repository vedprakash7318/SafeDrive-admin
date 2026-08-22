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
  Tag
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/scan-logs`, {
        ...authHeader,
        params: {
          page,
          limit: 30,
          eventType: eventTypeFilter,
          search
        }
      });
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
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
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30">
            <Phone className="w-3 h-3" />
            <span>Voice Call</span>
          </span>
        );
      case 'WHATSAPP_INITIATED':
      case 'SMS_INITIATED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/30">
            <MessageSquare className="w-3 h-3" />
            <span>Message / WhatsApp</span>
          </span>
        );
      case 'PLATE_VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Plate Verified</span>
          </span>
        );
      case 'PLATE_FAILED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Wrong 4-Digits</span>
          </span>
        );
      case 'REGISTRATION_VIEW':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Tag className="w-3 h-3" />
            <span>1st-Time Scan</span>
          </span>
        );
      case 'SCAN_VIEW':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Public Scan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <div className="p-2.5 bg-[#1D56A5]/10 text-[#1D56A5] rounded-2xl">
              <Activity className="w-7 h-7" />
            </div>
            <span>QR Scan Logs & Audit History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit log of all QR scans, verification attempts, voice calls, and message events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, plate, IP..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="SCAN_VIEW">Public Scan Views</option>
            <option value="PLATE_VERIFIED">Plate Verified</option>
            <option value="PLATE_FAILED">Plate Failed Attempts</option>
            <option value="CALL_INITIATED">Voice Calls</option>
            <option value="WHATSAPP_INITIATED">WhatsApp / Messages</option>
            <option value="REGISTRATION_VIEW">1st-Time Scan Registration</option>
          </select>

          <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            Total Logs: <span className="text-[#1D56A5] font-black">{total}</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5]" />
            <span>Loading live scan logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No scan logs recorded yet matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3.5 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">QR Sticker / Kit</th>
                  <th className="py-3.5 px-4">Asset Tag / Plate</th>
                  <th className="py-3.5 px-4">Registered Owner</th>
                  <th className="py-3.5 px-4">Device & IP</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log, idx) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    {/* Sr No */}
                    <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400 text-xs">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div className="font-bold text-slate-900">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>

                    {/* Event Type */}
                    <td className="py-3.5 px-4">
                      {getEventBadge(log.eventType)}
                      {log.notes && (
                        <div className="text-[10px] text-slate-500 font-mono mt-1 max-w-xs truncate">
                          {log.notes}
                        </div>
                      )}
                    </td>

                    {/* QR Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">
                        {log.copyCode || log.productId || 'QR'}
                      </span>
                    </td>

                    {/* Asset Tag / Plate */}
                    <td className="py-3.5 px-4">
                      {log.vehicleNumber || log.vehicleId?.vehicleNumber ? (
                        <span className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-bold px-2 py-0.5 rounded text-xs border border-[#1D56A5]/20">
                          {log.vehicleNumber || log.vehicleId?.vehicleNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unregistered</span>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4">
                      {log.userId ? (
                        <div>
                          <Link
                            to={`/users/${log.userId._id}`}
                            className="font-bold text-slate-900 hover:text-[#1D56A5] hover:underline"
                          >
                            {log.userId.name}
                          </Link>
                          <div className="font-mono text-[11px] text-slate-500">{log.userId.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Visitor / New</span>
                      )}
                    </td>

                    {/* Device & IP */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                        {log.device === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{log.device || 'Web'}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {log.publicToken && (
                        <a
                          href={`${PUBLIC_SCAN_BASE}/${log.publicToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-100 hover:bg-[#1D56A5] hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Scan</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-600">
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
