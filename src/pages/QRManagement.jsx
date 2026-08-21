import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SafeDriveQRCode from '../components/SafeDriveQRCode';
import {
  QrCode,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Settings,
  Tag as TagIcon,
  CheckCircle,
  Clock,
  ShieldAlert,
  Layers2,
  Box,
  Copy,
  Calendar,
  X
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

const PUBLIC_SCAN_BASE = import.meta.env.VITE_PUBLIC_SCAN_BASE_URL || 'http://localhost:5174/q';

export default function QRManagement() {
  const { authHeader } = useAuth();

  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrFilter, setQrFilter] = useState('ALL');
  const [qrTagFilter, setQrTagFilter] = useState('ALL');
  const [qrTypeFilter, setQrTypeFilter] = useState('ALL');
  const [qrSearch, setQrSearch] = useState('');

  // Tags, QR Types & Next Sequence Number
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [qrTypes, setQrTypes] = useState([]);
  const [selectedQRType, setSelectedQRType] = useState('');
  const [nextSeq, setNextSeq] = useState({ nextNumber: 1, formattedCode: 'SD001' });

  // Generate Batch Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    quantity: 10,
    initialCalls: 10,
    initialMessages: 20,
    validityDays: 365,
    renewalAmount: 199
  });
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState('');

  // Print Mode Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Manual Renewal Modal
  const [renewModalQR, setRenewModalQR] = useState(null);
  const [renewForm, setRenewForm] = useState({ validityDays: 365, bonusCalls: 10, bonusMessages: 20 });
  const [renewing, setRenewing] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/tags`, authHeader);
      if (res.data.success) {
        setTags(res.data.tags);
        if (res.data.tags.length > 0 && !selectedTag) {
          setSelectedTag(res.data.tags[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQRTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/qr-types`, authHeader);
      if (res.data.success) {
        setQrTypes(res.data.types);
        if (res.data.types.length > 0 && !selectedQRType) {
          setSelectedQRType(res.data.types[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextSeq = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/next-number`, authHeader);
      if (res.data.success) {
        setNextSeq(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const tagQuery = qrTagFilter !== 'ALL' ? `&batchId=${qrTagFilter}` : '';
      const typeQuery = qrTypeFilter !== 'ALL' ? `&qrType=${qrTypeFilter}` : '';
      const res = await axios.get(
        `${API_BASE}/admin/qr?status=${qrFilter}&search=${qrSearch}${tagQuery}${typeQuery}&limit=100`,
        authHeader
      );
      if (res.data.success) {
        setQrs(res.data.qrs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchQRTypes();
    fetchNextSeq();
    fetchQRs();
  }, [qrFilter, qrTagFilter, qrTypeFilter]);

  // Generate Batch
  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setGeneratingBatch(true);
    setBatchSuccess('');
    try {
      const chosenTypeObj = qrTypes.find((t) => t.name === selectedQRType);
      const payload = {
        quantity: batchForm.quantity,
        tag: selectedTag,
        qrTypeName: selectedQRType,
        qrTypeId: chosenTypeObj?._id,
        initialCalls: batchForm.initialCalls,
        initialMessages: batchForm.initialMessages,
        validityDays: batchForm.validityDays,
        renewalAmount: batchForm.renewalAmount
      };
      const res = await axios.post(`${API_BASE}/admin/qr/generate`, payload, authHeader);
      if (res.data.success) {
        setBatchSuccess(res.data.message);
        fetchQRs();
        fetchNextSeq();
        fetchTags();
        fetchQRTypes();
        setTimeout(() => {
          setShowGenerateModal(false);
          setBatchSuccess('');
        }, 1800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating batch');
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Toggle QR Status (Active / Suspended)
  const handleToggleQRStatus = async (qr) => {
    const nextStatus = qr.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to change status of ${qr.copyCode} to ${nextStatus}?`)) return;
    try {
      const res = await axios.put(`${API_BASE}/admin/qr/${qr._id}/status`, { status: nextStatus }, authHeader);
      if (res.data.success) {
        fetchQRs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  // Manual Renewal
  const handleAdminRenew = async (e) => {
    e.preventDefault();
    if (!renewModalQR) return;
    setRenewing(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/qr/${renewModalQR._id}/renew`, renewForm, authHeader);
      if (res.data.success) {
        alert(res.data.message);
        setRenewModalQR(null);
        fetchQRs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew QR');
    } finally {
      setRenewing(false);
    }
  };

  const selectedTypeObj = qrTypes.find((t) => t.name === selectedQRType);
  const currentCopiesPerSet = selectedTypeObj?.copiesPerSet || 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <QrCode className="w-8 h-8 text-indigo-600" />
            <span>QR Inventory & Generator</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Fixed Prefix <strong className="text-indigo-600 font-mono">SD</strong> • Auto Incremented IDs • Custom QR Types & Tags
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setBatchSuccess('');
              fetchNextSeq();
              setShowGenerateModal(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Generate QR Batch</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet View</span>
          </button>

          <button
            onClick={() => {
              fetchQRs();
              fetchNextSeq();
              fetchTags();
              fetchQRTypes();
            }}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-slate-200 rounded-3xl shadow-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Code (e.g. SD001C1)..."
            value={qrSearch}
            onChange={(e) => setQrSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQRs()}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 w-full md:w-60"
          />
        </div>

        {/* QR Type, Tag & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={qrTypeFilter}
            onChange={(e) => setQrTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700"
          >
            <option value="ALL">📦 All QR Types</option>
            {qrTypes.map((t) => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={qrTagFilter}
            onChange={(e) => setQrTagFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700"
          >
            <option value="ALL">🏷️ All Tags</option>
            {tags.map((t) => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex space-x-1">
            {['ALL', 'ACTIVE', 'IN STOCK', 'EXPIRED', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setQrFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  qrFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QRs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">QR Copy Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">QR Product Type</th>
                <th className="px-6 py-4">Tag</th>
                <th className="px-6 py-4">Configured Quota</th>
                <th className="px-6 py-4">Owner & Vehicle</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qrs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-xs">
                    No QR codes found. Click <strong>+ Generate QR Batch</strong> to create stickers.
                  </td>
                </tr>
              ) : (
                qrs.map((qr) => (
                  <tr key={qr._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 flex items-center space-x-2">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>{qr.copyCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          qr.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : qr.status === 'IN STOCK'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : qr.status === 'EXPIRED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {qr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        📦 {qr.qrType || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                        🏷️ {qr.batchId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-700">
                      <div>
                        <span className="text-emerald-600 font-bold">{qr.initialCalls || 10}</span> Calls •{' '}
                        <span className="text-blue-600 font-bold">{qr.initialMessages || 20}</span> Msgs
                      </div>
                      <div className="text-[10px] text-slate-500">Renewal: ₹{qr.renewalAmount || 199}</div>
                    </td>
                    <td className="px-6 py-4">
                      {qr.userId ? (
                        <div>
                          <div className="font-bold text-slate-900">{qr.userId.name}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {qr.vehicleId?.vehicleBrand} {qr.vehicleId?.vehicleName} ({qr.vehicleId?.vehicleNumber})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unregistered</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {qr.expiryDate ? new Date(qr.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {qr.userId && (
                        <button
                          onClick={() => {
                            setRenewModalQR(qr);
                            setRenewForm({ validityDays: 365, bonusCalls: 10, bonusMessages: 20 });
                          }}
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          Renew
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleQRStatus(qr)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                          qr.status === 'SUSPENDED'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                        }`}
                      >
                        {qr.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE QR BATCH MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <Plus className="w-6 h-6 text-indigo-600" />
                  <span>Generate New QR Batch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure batch quantity, QR type, tag binding, and initial starter quota
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {batchSuccess && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{batchSuccess}</span>
              </div>
            )}

            <form onSubmit={handleGenerateBatch} className="space-y-5">
              {/* Top Auto Start Indicator */}
              <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 px-4 py-2.5 rounded-2xl">
                <span className="text-xs text-indigo-800 font-semibold">Auto Start Product Code:</span>
                <span className="font-mono font-black text-indigo-900 text-sm">{nextSeq.formattedCode}</span>
              </div>

              {/* 3 Main Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prefix */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Prefix (Fixed)</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-indigo-700 font-mono font-black text-sm flex items-center justify-between">
                    <span>SD</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-sans font-bold">Standard</span>
                  </div>
                </div>

                {/* QR Type Selector */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">QR Type *</label>
                    <Link
                      to="/settings/qr-types"
                      className="text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      + Manage
                    </Link>
                  </div>
                  <select
                    value={selectedQRType}
                    onChange={(e) => setSelectedQRType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                    required
                  >
                    {qrTypes.map((t) => (
                      <option key={t._id} value={t.name}>
                        📦 {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Selector */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Batch Tag *</label>
                    <Link
                      to="/settings/tags"
                      className="text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      + Manage
                    </Link>
                  </div>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                    required
                  >
                    {tags.map((t) => (
                      <option key={t._id} value={t.name}>
                        🏷️ {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quantity of Sets *</label>
                <input
                  type="number"
                  value={batchForm.quantity}
                  onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  min="1"
                  max="500"
                  required
                />
                <div className="text-xs text-indigo-700 font-semibold mt-1">
                  ⚡ <strong>{batchForm.quantity} sets</strong> × {currentCopiesPerSet} copies = <strong className="text-indigo-900">{batchForm.quantity * currentCopiesPerSet} physical stickers</strong> ({currentCopiesPerSet === 1 ? 'C1' : `C1 to C${currentCopiesPerSet}`})
                </div>
              </div>

              {/* Quota & Validity Config */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Initial Calls</label>
                  <input
                    type="number"
                    value={batchForm.initialCalls}
                    onChange={(e) => setBatchForm({ ...batchForm, initialCalls: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Initial Messages</label>
                  <input
                    type="number"
                    value={batchForm.initialMessages}
                    onChange={(e) => setBatchForm({ ...batchForm, initialMessages: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={batchForm.validityDays}
                    onChange={(e) => setBatchForm({ ...batchForm, validityDays: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Renewal (₹)</label>
                  <input
                    type="number"
                    value={batchForm.renewalAmount}
                    onChange={(e) => setBatchForm({ ...batchForm, renewalAmount: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl transition text-sm hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingBatch}
                  className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {generatingBatch ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Generate {batchForm.quantity * currentCopiesPerSet} Stickers ({selectedQRType})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SHEET MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <div>
                <h2 className="text-xl font-black text-slate-900">Printable QR Stickers Sheet</h2>
                <p className="text-xs text-slate-500">Showing {qrs.length} QR Code Copies ready for print</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700"
                >
                  🖨️ Print Now
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {qrs.map((qr) => (
                <div
                  key={qr._id}
                  className="border-2 border-dashed border-slate-300 p-6 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50"
                >
                  <div className="text-xs font-black tracking-widest text-indigo-700 mb-1">SAFE DRIVE VEHICLE SAFETY</div>
                  <div className="text-lg font-black text-slate-900 mb-1">{qr.copyCode}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mb-2">Type: {qr.qrType || 'Standard'}</div>

                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-3">
                    <SafeDriveQRCode value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`} size={145} />
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-700">SCAN TO CONTACT OWNER</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Includes {qr.initialCalls || 10} Calls • {qr.initialMessages || 20} Messages
                  </div>
                  <div className="text-[9px] text-indigo-600 font-bold mt-0.5">Tag: {qr.batchId}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL RENEWAL MODAL */}
      {renewModalQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Manual QR Renewal ({renewModalQR.copyCode})</h3>
              <button onClick={() => setRenewModalQR(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAdminRenew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Validity Extension (Days)</label>
                <input
                  type="number"
                  value={renewForm.validityDays}
                  onChange={(e) => setRenewForm({ ...renewForm, validityDays: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bonus Calls</label>
                  <input
                    type="number"
                    value={renewForm.bonusCalls}
                    onChange={(e) => setRenewForm({ ...renewForm, bonusCalls: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bonus Messages</label>
                  <input
                    type="number"
                    value={renewForm.bonusMessages}
                    onChange={(e) => setRenewForm({ ...renewForm, bonusMessages: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
                ⭐ <strong>Rule Enforced:</strong> Existing unused quota balance will be automatically preserved.
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewModalQR(null)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewing}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
                >
                  {renewing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Renewal</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
