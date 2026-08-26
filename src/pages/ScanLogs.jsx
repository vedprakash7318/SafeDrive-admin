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
  Car
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
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-brand-green border border-brand-green/30">
            <Phone className="w-3 h-3" />
            <span>Voice Call</span>
          </span>
        );
      case 'WHATSAPP_INITIATED':
      case 'SMS_INITIATED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-600/30">
            <MessageSquare className="w-3 h-3" />
            <span>Message Sent</span>
          </span>
        );
      case 'PLATE_VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Plate Verified</span>
          </span>
        );
      case 'PLATE_FAILED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Wrong 4-Digits</span>
          </span>
        );
      case 'REGISTRATION_VIEW':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Tag className="w-3 h-3" />
            <span>1st Time Scan</span>
          </span>
        );
      case 'SCAN_VIEW':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 border border-blue-200">
            <Eye className="w-3 h-3" />
            <span>Public Scan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-slate-900 flex items-center space-x-2">
            <span>QR Scan</span>
            <span className="text-brand-green">Logs</span>
            <span>&</span>
            <span className="text-brand-green">Audit History</span>
            <CheckCircle2 className="w-6 h-6 text-brand-green ml-2" fill="currentColor" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit log of all QR scans, verification attempts, voice calls, and message events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 bg-brand-green hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-brand-green/30 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Total Logs</div>
            <div className="text-xl font-black text-slate-900 leading-none mb-1">{total || 75}</div>
            <div className="text-[10px] text-slate-400 font-medium">All scan activities</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange flex-shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Voice Calls</div>
            <div className="text-xl font-black text-slate-900 leading-none mb-1">28</div>
            <div className="text-[10px] text-slate-400 font-medium">From scanned QR</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Messages</div>
            <div className="text-xl font-black text-slate-900 leading-none mb-1">32</div>
            <div className="text-[10px] text-slate-400 font-medium">Total messages sent</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Warnings</div>
            <div className="text-xl font-black text-slate-900 leading-none mb-1">15</div>
            <div className="text-[10px] text-slate-400 font-medium">Suspicious events</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Verified Scans</div>
            <div className="text-xl font-black text-slate-900 leading-none mb-1">48</div>
            <div className="text-[10px] text-slate-400 font-medium">Successful scans</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Table area */}
        <div className="w-full lg:w-[72%] xl:w-[75%] space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, plate, IP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-green"
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
              
              <select className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none hidden sm:block">
                <option>All Status</option>
              </select>

              <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                Total Logs: <span className="text-slate-800 font-black">{total}</span>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-green" />
                <span>Loading live scan logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No scan logs recorded yet matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-4 text-center w-10">#</th>
                      <th className="py-4 px-4">Timestamp</th>
                      <th className="py-4 px-4">Event Type</th>
                      <th className="py-4 px-4">Caller / Scanner Phone</th>
                      <th className="py-4 px-4">QR Sticker / Kit</th>
                      <th className="py-4 px-4">Asset Tag / Plate</th>
                      <th className="py-4 px-4">Registered Owner</th>
                      <th className="py-4 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log, idx) => (
                      <tr key={log._id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-4 px-4 text-center font-bold text-slate-400 text-xs">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                          <div className="font-bold text-slate-900">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getEventBadge(log.eventType)}
                          {log.notes && (
                            <div className="text-[10px] text-slate-500 font-mono mt-1 max-w-xs truncate">
                              {log.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono">
                          {log.callerPhone || log.scannerPhone ? (
                            <div>
                              <div className="text-slate-800 text-xs font-semibold">
                                +91 {log.callerPhone || log.scannerPhone}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Visitor Scan</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {log.copyCode || log.productId || 'SD013C1'}
                        </td>
                        <td className="py-4 px-4">
                          {log.vehicleNumber || log.vehicleId?.vehicleNumber ? (
                            <span className="text-brand-green font-bold text-xs">
                              {log.vehicleNumber || log.vehicleId?.vehicleNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unregistered</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {log.userId ? (
                            <div>
                              <Link
                                to={`/users/${log.userId._id}`}
                                className="font-bold text-slate-900 hover:text-brand-green hover:underline"
                              >
                                {log.userId.name}
                              </Link>
                              <div className="font-mono text-[11px] text-slate-500">{log.userId.phone}</div>
                            </div>
                          ) : (
                            <div>
                                <div className="font-bold text-slate-900">Visitor /</div>
                                <div className="text-[11px] text-slate-500">New User</div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {log.eventType === 'PLATE_FAILED' ? (
                            <div className="inline-flex items-center space-x-1 text-brand-orange text-xs font-semibold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Warning</span>
                            </div>
                          ) : log.eventType === 'SCAN_VIEW' ? (
                            <div className="inline-flex items-center space-x-1 text-blue-500 text-xs font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>Info</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-1 text-brand-green text-xs font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Success</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
              <div className="text-slate-500 font-medium">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                >
                  &lt;
                </button>
                <button className="px-3 py-1.5 bg-brand-green text-white rounded-lg font-bold">
                  {page}
                </button>
                {pages > page && (
                    <button className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg font-bold">
                    {page + 1}
                    </button>
                )}
                {pages > page + 1 && (
                    <button className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg font-bold">
                    {page + 2}
                    </button>
                )}
                <span className="px-2 text-slate-400">...</span>
                {pages > 3 && (
                    <button className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg font-bold">
                    {pages}
                    </button>
                )}
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>

              <div>
                <select className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none">
                    <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts area */}
        <div className="w-full lg:w-[28%] xl:w-[25%] space-y-6">
          
          {/* Events by Type */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Events by Type</h3>
            <div className="flex items-center justify-between">
                <div className="relative w-20 h-20">
                    {/* CSS-based Donut Chart placeholder */}
                    <div className="w-full h-full rounded-full border-[6px] border-slate-100" style={{ background: 'conic-gradient(#16A34A 0% 40%, #F97316 40% 63%, #3B82F6 63% 90%, #EAB308 90% 100%)', borderRadius: '50%' }}>
                        <div className="absolute inset-[6px] bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="space-y-2 text-[10px] flex-1 pl-4">
                    <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-600"><span className="w-2 h-2 rounded-full bg-brand-green mr-1.5"></span> Plate Verified</span>
                        <span className="font-semibold text-slate-900">48 (40%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-600"><span className="w-2 h-2 rounded-full bg-brand-orange mr-1.5"></span> Voice Call</span>
                        <span className="font-semibold text-slate-900">28 (23%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-600"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Message Sent</span>
                        <span className="font-semibold text-slate-900">32 (27%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-600"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span> Warnings</span>
                        <span className="font-semibold text-slate-900">15 (10%)</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Scans Over Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Scans Over Time</h3>
                <select className="bg-slate-50 border border-slate-200 text-[10px] font-semibold rounded-lg px-2 py-1 text-slate-600 focus:outline-none">
                    <option>This Week</option>
                </select>
            </div>
            
            {/* CSS-based Line Chart placeholder */}
            <div className="h-28 w-full relative flex items-end justify-between pt-4 pb-2 border-b border-l border-slate-100 px-2">
                {/* Y Axis labels */}
                <div className="absolute left-[-20px] bottom-2 top-4 flex flex-col justify-between text-[8px] text-slate-400">
                    <span>40</span>
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                    <span>0</span>
                </div>
                {/* Simulated Chart SVG */}
                <svg className="absolute inset-0 w-full h-full pt-4 pb-2 pl-2" preserveAspectRatio="none">
                    <path d="M0,60 C20,50 40,80 60,70 C80,60 100,20 120,40 C140,60 160,80 180,60 C200,40 220,70 240,60 C260,50 280,40 300,30 L300,100 L0,100 Z" fill="#16A34A" fillOpacity="0.1" />
                    <path d="M0,60 C20,50 40,80 60,70 C80,60 100,20 120,40 C140,60 160,80 180,60 C200,40 220,70 240,60 C260,50 280,40 300,30" fill="none" stroke="#16A34A" strokeWidth="2" />
                    {/* Dots */}
                    <circle cx="0" cy="60" r="2.5" fill="#16A34A" />
                    <circle cx="60" cy="70" r="2.5" fill="#16A34A" />
                    <circle cx="120" cy="40" r="2.5" fill="#16A34A" />
                    <circle cx="180" cy="60" r="2.5" fill="#16A34A" />
                    <circle cx="240" cy="60" r="2.5" fill="#16A34A" />
                    <circle cx="300" cy="30" r="2.5" fill="#16A34A" />
                </svg>
            </div>
            {/* X Axis labels */}
            <div className="flex justify-between text-[8px] text-slate-400 mt-2 px-1">
                <span>19 Aug</span>
                <span>20 Aug</span>
                <span>21 Aug</span>
                <span>22 Aug</span>
                <span>23 Aug</span>
                <span>24 Aug</span>
                <span>26 Aug</span>
            </div>
          </div>

          {/* Top Scanned Devices */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Top Scanned Devices</h3>
            
            <div className="space-y-4">
                <div className="flex items-center text-[10px] font-semibold">
                    <div className="w-24 text-slate-700 flex items-center"><Car className="w-3 h-3 mr-1.5"/> MH89UU8888</div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-brand-green" style={{ width: '80%' }}></div>
                    </div>
                    <div className="w-10 text-right text-slate-500"><span className="text-slate-900">32</span> Scans</div>
                </div>

                <div className="flex items-center text-[10px] font-semibold">
                    <div className="w-24 text-slate-700 flex items-center"><Car className="w-3 h-3 mr-1.5"/> UP78AB1234</div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-brand-orange" style={{ width: '50%' }}></div>
                    </div>
                    <div className="w-10 text-right text-slate-500"><span className="text-slate-900">18</span> Scans</div>
                </div>

                <div className="flex items-center text-[10px] font-semibold">
                    <div className="w-24 text-slate-700 flex items-center"><Car className="w-3 h-3 mr-1.5"/> DL10CD5678</div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-blue-500" style={{ width: '35%' }}></div>
                    </div>
                    <div className="w-10 text-right text-slate-500"><span className="text-slate-900">12</span> Scans</div>
                </div>

                <div className="flex items-center text-[10px] font-semibold">
                    <div className="w-24 text-slate-700 flex items-center"><Car className="w-3 h-3 mr-1.5"/> RJ14EF9012</div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-slate-400" style={{ width: '20%' }}></div>
                    </div>
                    <div className="w-10 text-right text-slate-500"><span className="text-slate-900">8</span> Scans</div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
