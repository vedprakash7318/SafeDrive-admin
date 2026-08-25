import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle,
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  User,
  Inbox
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function ContactMessages() {
  const { authHeader } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Selected message for detailed modal view
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${API_BASE}/admin/contact-messages?status=${statusFilter}&search=${encodeURIComponent(search)}`,
        authHeader
      );
      if (res.data.success) {
        setMessages(res.data.messages || []);
        setUnreadCount(res.data.unreadCount || 0);
        setTotalCount(res.data.totalCount || (res.data.messages || []).length);
      }
    } catch (err) {
      console.error('Fetch contact messages error:', err);
      setError(err.response?.data?.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  // Toggle or Mark Read / Unread
  const handleToggleRead = async (message, newIsRead) => {
    setUpdatingId(message._id);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/contact-messages/${message._id}/read`,
        { isRead: newIsRead },
        authHeader
      );
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, isRead: newIsRead, status: newIsRead ? 'READ' : 'UNREAD' } : m))
        );
        if (selectedMessage && selectedMessage._id === message._id) {
          setSelectedMessage((prev) => ({ ...prev, isRead: newIsRead, status: newIsRead ? 'READ' : 'UNREAD' }));
        }
        setUnreadCount((prev) => (newIsRead ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update message status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete message
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/admin/contact-messages/${deleteTarget._id}`,
        authHeader
      );
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget._id));
        if (selectedMessage && selectedMessage._id === deleteTarget._id) {
          setSelectedMessage(null);
        }
        setDeleteTarget(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  // Quick Open Modal & Auto Mark as Read
  const handleViewMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleToggleRead(msg, true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-[#1D56A5] border border-indigo-100">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>Contact Messages & Inquiries</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customer inquiries, bulk requests, and support queries submitted via the contact page.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-black shadow-2xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{unreadCount} Unread Inquiry</span>
            </div>
          )}
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Messages ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('UNREAD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${
              statusFilter === 'UNREAD'
                ? 'bg-amber-500 text-white shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🔔 Unread ({unreadCount})
          </button>
          <button
            onClick={() => setStatusFilter('READ')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${
              statusFilter === 'READ'
                ? 'bg-white text-emerald-700 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ✓ Read ({Math.max(0, totalCount - unreadCount)})
          </button>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, query..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1D56A5] hover:bg-[#164382] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* 3. MESSAGES LIST / TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Sender Details</th>
                <th className="px-6 py-4">Contact Channels</th>
                <th className="px-6 py-4">Message / Query Preview</th>
                <th className="px-6 py-4">Received Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5] mx-auto mb-2" />
                    <span>Loading contact messages...</span>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <span>No contact inquiries found matching criteria.</span>
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`transition hover:bg-slate-50/80 ${
                      !msg.isRead ? 'bg-amber-50/30 font-semibold' : ''
                    }`}
                  >
                    {/* 1. Sender */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                          !msg.isRead ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {msg.name ? msg.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                            <span>{msg.name || 'Anonymous User'}</span>
                            {!msg.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="New Unread Message" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {msg._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact Phone & Email */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`tel:${msg.phone}`}
                            className="font-mono text-xs font-bold text-slate-900 hover:text-[#1D56A5] transition flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {msg.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${msg.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(msg.name || '')},%20regarding%20your%20SafeDrive%20Tag%20inquiry...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 transition"
                            title="Reply on WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>
                        {msg.email ? (
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-[11px] text-slate-500 hover:text-[#1D56A5] transition flex items-center space-x-1 truncate max-w-[180px]"
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{msg.email}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No email provided</span>
                        )}
                      </div>
                    </td>

                    {/* 3. Message Preview */}
                    <td className="px-6 py-4 max-w-xs">
                      <div
                        onClick={() => handleViewMessage(msg)}
                        className="cursor-pointer group"
                      >
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed group-hover:text-[#1D56A5] transition">
                          {msg.message}
                        </p>
                        <span className="text-[10px] text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition inline-flex items-center space-x-0.5 mt-0.5">
                          <span>Click to read full message</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </td>

                    {/* 4. Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center space-x-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* 5. Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!msg.isRead ? (
                        <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>UNREAD</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>READ</span>
                        </span>
                      )}
                    </td>

                    {/* 6. Actions */}
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewMessage(msg)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="View Full Inquiry"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleRead(msg, !msg.isRead)}
                        disabled={updatingId === msg._id}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1 ${
                          !msg.isRead
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title={!msg.isRead ? 'Mark as Read' : 'Mark as Unread'}
                      >
                        {updatingId === msg._id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : !msg.isRead ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Mark Read</span>
                          </>
                        ) : (
                          <span>Mark Unread</span>
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(msg)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MESSAGE DETAILS MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#1D56A5] flex items-center justify-center font-black text-lg border border-indigo-100">
                  {selectedMessage.name ? selectedMessage.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{selectedMessage.name || 'Anonymous User'}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Received on {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Contacts Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mobile Number</span>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="font-mono font-bold text-slate-900 hover:text-[#1D56A5] flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {selectedMessage.phone}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Email Address</span>
                  {selectedMessage.email ? (
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="font-bold text-slate-900 hover:text-[#1D56A5] flex items-center space-x-1 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedMessage.email}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                Inquiry Message:
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-medium">
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <a
                href={`https://wa.me/91${selectedMessage.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedMessage.name || '')},%20this%20is%20SafeDrive%20Tag%20Support%20regarding%20your%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20"
              >
                <span>💬 Reply on WhatsApp</span>
              </a>

              {selectedMessage.email && (
                <a
                  href={`mailto:${selectedMessage.email}?subject=SafeDrive%20Tag%20Support%20Response`}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Delete Contact Message?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this inquiry from <strong className="text-slate-900">"{deleteTarget.name}"</strong>?
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-red-600/25 disabled:opacity-50"
              >
                {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
