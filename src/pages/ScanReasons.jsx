import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ListChecks,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Ban,
  Unlock,
  Car,
  MoreHorizontal,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Archive,
  Layers,
  Search,
  Bike,
  Truck,
  Bell,
  MapPin,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

const getReasonIcon = (iconKey) => {
  switch (iconKey) {
    // Non-Vehicle Specific Icons
    case 'missing':
    case 'lost':
    case 'search': return Search;
    case 'other':
    case 'message': return MessageSquare || MoreHorizontal;

    // Vehicle Specific Icons
    case 'ban': return Ban;
    case 'unlock': return Unlock;
    case 'car': return Car;
    case 'bike': return Bike;
    case 'truck': return Truck;

    // Universal / General Icons
    case 'alert':
    case 'warning': return AlertTriangle;
    case 'bell': return Bell;
    case 'location':
    case 'mappin': return MapPin;
    case 'shield': return Shield;
    default: return HelpCircle;
  }
};

const getReasonColorClasses = (color) => {
  switch (color) {
    case 'red': return 'bg-red-50 text-red-500 border border-red-200';
    case 'green': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'blue': return 'bg-blue-50 text-blue-600 border border-blue-200';
    case 'rose': return 'bg-rose-50 text-rose-600 border border-rose-200';
    case 'purple': return 'bg-purple-50 text-purple-600 border border-purple-200';
    case 'amber': return 'bg-amber-50 text-amber-600 border border-amber-200';
    default: return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
  }
};

export default function ScanReasons() {
  const { authHeader } = useAuth();

  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState('active'); // 'active' | 'trash'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'VEHICLE' | 'NON_VEHICLE'

  // New Reason Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    iconKey: 'alert',
    color: 'indigo',
    applicableTo: 'ALL',
    isOtherType: false
  });
  const [creating, setCreating] = useState(false);

  // Edit Reason Modal
  const [editingReason, setEditingReason] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReasons = async (showTrash = viewTab === 'trash') => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/scan-reasons?showDeleted=${showTrash ? 'true' : 'false'}`,
        authHeader
      );
      if (res.data.success) {
        setReasons(res.data.reasons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons(viewTab === 'trash');
  }, [viewTab]);

  // Filtered reasons based on categoryFilter
  const filteredReasons = reasons.filter((r) => {
    if (categoryFilter === 'ALL') return true;
    const cat = r.applicableTo || r.category || 'ALL';
    return cat === categoryFilter || cat === 'ALL';
  });

  // Create Reason
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/scan-reasons`, newForm, authHeader);
      if (res.data.success) {
        setShowAddModal(false);
        setNewForm({
          title: '',
          description: '',
          iconKey: 'alert',
          color: 'indigo',
          applicableTo: 'ALL',
          isOtherType: false
        });
        fetchReasons(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating reason');
    } finally {
      setCreating(false);
    }
  };

  // Update Reason
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingReason) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/scan-reasons/${editingReason._id}`,
        editingReason,
        authHeader
      );
      if (res.data.success) {
        setEditingReason(null);
        fetchReasons(viewTab === 'trash');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating reason');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (reason) => {
    try {
      await axios.put(
        `${API_BASE}/admin/scan-reasons/${reason._id}`,
        { isActive: !reason.isActive },
        authHeader
      );
      fetchReasons(viewTab === 'trash');
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Delete Reason (Soft Delete)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/admin/scan-reasons/${deleteTarget._id}`, authHeader);
      setDeleteTarget(null);
      fetchReasons(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting reason');
    } finally {
      setDeleting(false);
    }
  };

  // Restore Reason
  const handleRestore = async (reasonId) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/scan-reasons/${reasonId}/restore`, {}, authHeader);
      if (res.data.success) {
        fetchReasons(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error restoring reason');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
            <ListChecks className="w-7 h-7 text-indigo-600" />
            <span>Public QR Scan Reasons Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the list of reasons shown to anyone who scans a vehicle QR code (Add, Edit, Soft-Delete, or Restore)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Scan Reason</span>
          </button>
          <button
            onClick={() => fetchReasons(viewTab === 'trash')}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Toggle Tabs: Active vs Soft-Deleted Trash & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewTab('active')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewTab === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Reasons</span>
          </button>

          <button
            onClick={() => setViewTab('trash')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewTab === 'trash'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>🗑️ Soft-Deleted Reasons</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🌐 All ({reasons.length})
          </button>
          <button
            onClick={() => setCategoryFilter('VEHICLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === 'VEHICLE'
                ? 'bg-white text-emerald-700 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🚗 Vehicle Only
          </button>
          <button
            onClick={() => setCategoryFilter('NON_VEHICLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === 'NON_VEHICLE'
                ? 'bg-white text-amber-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🧳 Non-Vehicle (Luggage/Pet/Keys)
          </button>
        </div>
      </div>

      {/* Reasons Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {viewTab === 'active' ? `Active Scan Reasons (${filteredReasons.length})` : `Soft-Deleted Reasons (${filteredReasons.length})`}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold">
            {viewTab === 'active' ? '✨ Live on scanner interface' : '🛡️ Preserved for past scan history'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Visual Icon & Title</th>
                <th className="px-6 py-4">Applicable Category</th>
                <th className="px-6 py-4">Input Type</th>
                <th className="px-6 py-4">{viewTab === 'active' ? 'Status' : 'Deleted Date'}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReasons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400">
                    {viewTab === 'active' ? 'No scan reasons found matching selected criteria.' : 'Trash is empty.'}
                  </td>
                </tr>
              ) : (
                filteredReasons.map((r) => {
                  const Icon = getReasonIcon(r.iconKey);
                  const colorClass = getReasonColorClasses(r.color);
                  const cat = r.applicableTo || r.category || 'ALL';
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{r.title}</div>
                          {r.description && <div className="text-xs text-slate-500">{r.description}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cat === 'VEHICLE' ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            🚗 Vehicle Only
                          </span>
                        ) : cat === 'NON_VEHICLE' ? (
                          <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            🧳 Non-Vehicle Only
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            🌐 All / Universal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {r.isOtherType ? (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Opens Custom Textarea
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Direct Template
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {viewTab === 'active' ? (
                          <button
                            onClick={() => handleToggleActive(r)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                              r.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {r.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{r.isActive ? 'Active on QR' : 'Hidden'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {new Date(r.deletedAt || r.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {viewTab === 'active' ? (
                          <>
                            <button
                              onClick={() => setEditingReason({ ...r, applicableTo: r.applicableTo || r.category || 'ALL' })}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(r._id)}
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE REASON MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Add New Scan Reason</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Found Lost Luggage or Tyre Puncture"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {/* Category / Applicable To Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Applicable QR Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const iconKey = (newForm.iconKey === 'missing') ? 'car' : newForm.iconKey;
                      setNewForm({ ...newForm, applicableTo: 'VEHICLE', iconKey });
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      newForm.applicableTo === 'VEHICLE'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🚗</span>
                    <span>Vehicle Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const iconKey = (newForm.iconKey !== 'other') ? 'missing' : 'other';
                      setNewForm({ ...newForm, applicableTo: 'NON_VEHICLE', iconKey });
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      newForm.applicableTo === 'NON_VEHICLE'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🧳</span>
                    <span>Non-Vehicle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, applicableTo: 'ALL' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      newForm.applicableTo === 'ALL'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🌐</span>
                    <span>All / Universal</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Icon Style</label>
                  <select
                    value={newForm.iconKey}
                    onChange={(e) => setNewForm({ ...newForm, iconKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {newForm.applicableTo === 'NON_VEHICLE' && (
                      <>
                        <option value="missing">🔍 Missing / Lost & Found (missing)</option>
                        <option value="other">💬 Others / Custom Note (other)</option>
                      </>
                    )}

                    {newForm.applicableTo === 'VEHICLE' && (
                      <>
                        <option value="car">🚗 Vehicle / Movement (car)</option>
                        <option value="ban">🚫 No Parking / Restriction (ban)</option>
                        <option value="unlock">🔓 Unlocked / Open Window (unlock)</option>
                        <option value="bike">🏍️ Bike / Two-Wheeler (bike)</option>
                        <option value="truck">🚚 Truck / Heavy Vehicle (truck)</option>
                        <option value="alert">⚠️ Warning / Emergency (alert)</option>
                        <option value="other">💬 Custom Text / Message (other)</option>
                      </>
                    )}

                    {newForm.applicableTo === 'ALL' && (
                      <>
                        <option value="missing">🔍 Missing / Lost & Found (missing)</option>
                        <option value="car">🚗 Vehicle / Movement (car)</option>
                        <option value="ban">🚫 No Parking / Restriction (ban)</option>
                        <option value="unlock">🔓 Unlocked / Open Window (unlock)</option>
                        <option value="bike">🏍️ Bike / Two-Wheeler (bike)</option>
                        <option value="truck">🚚 Truck / Heavy Vehicle (truck)</option>
                        <option value="alert">⚠️ Warning / Emergency (alert)</option>
                        <option value="bell">🔔 Notification Bell (bell)</option>
                        <option value="location">📍 Location / Towing (location)</option>
                        <option value="shield">🛡️ Shield / Security (shield)</option>
                        <option value="other">💬 Custom Text / Message (other)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Badge Color</label>
                  <select
                    value={newForm.color}
                    onChange={(e) => setNewForm({ ...newForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm"
                  >
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="rose">Rose</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="otherCheck"
                  checked={newForm.isOtherType}
                  onChange={(e) => setNewForm({ ...newForm, isOtherType: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="otherCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Prompt user to type custom text when selected
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>+ Add Reason</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REASON MODAL */}
      {editingReason && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Edit Scan Reason</h3>
              <button onClick={() => setEditingReason(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason Title</label>
                <input
                  type="text"
                  value={editingReason.title}
                  onChange={(e) => setEditingReason({ ...editingReason, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {/* Category / Applicable To Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Applicable QR Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const iconKey = (editingReason.iconKey === 'missing') ? 'car' : editingReason.iconKey;
                      setEditingReason({ ...editingReason, applicableTo: 'VEHICLE', category: 'VEHICLE', iconKey });
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      (editingReason.applicableTo || editingReason.category) === 'VEHICLE'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🚗</span>
                    <span>Vehicle Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const iconKey = (editingReason.iconKey !== 'other') ? 'missing' : 'other';
                      setEditingReason({ ...editingReason, applicableTo: 'NON_VEHICLE', category: 'NON_VEHICLE', iconKey });
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      (editingReason.applicableTo || editingReason.category) === 'NON_VEHICLE'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🧳</span>
                    <span>Non-Vehicle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingReason({ ...editingReason, applicableTo: 'ALL', category: 'ALL' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center justify-center ${
                      (!editingReason.applicableTo && !editingReason.category) || (editingReason.applicableTo || editingReason.category) === 'ALL'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base mb-0.5">🌐</span>
                    <span>All / Universal</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Icon Style</label>
                  <select
                    value={editingReason.iconKey}
                    onChange={(e) => setEditingReason({ ...editingReason, iconKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {(editingReason.applicableTo === 'NON_VEHICLE' || editingReason.category === 'NON_VEHICLE') && (
                      <>
                        <option value="missing">🔍 Missing / Lost & Found (missing)</option>
                        <option value="other">💬 Others / Custom Note (other)</option>
                      </>
                    )}

                    {(editingReason.applicableTo === 'VEHICLE' || editingReason.category === 'VEHICLE') && (
                      <>
                        <option value="car">🚗 Vehicle / Movement (car)</option>
                        <option value="ban">🚫 No Parking / Restriction (ban)</option>
                        <option value="unlock">🔓 Unlocked / Open Window (unlock)</option>
                        <option value="bike">🏍️ Bike / Two-Wheeler (bike)</option>
                        <option value="truck">🚚 Truck / Heavy Vehicle (truck)</option>
                        <option value="alert">⚠️ Warning / Emergency (alert)</option>
                        <option value="other">💬 Custom Text / Message (other)</option>
                      </>
                    )}

                    {(!editingReason.applicableTo || editingReason.applicableTo === 'ALL' || (!editingReason.applicableTo && editingReason.category === 'ALL')) && (
                      <>
                        <option value="missing">🔍 Missing / Lost & Found (missing)</option>
                        <option value="car">🚗 Vehicle / Movement (car)</option>
                        <option value="ban">🚫 No Parking / Restriction (ban)</option>
                        <option value="unlock">🔓 Unlocked / Open Window (unlock)</option>
                        <option value="bike">🏍️ Bike / Two-Wheeler (bike)</option>
                        <option value="truck">🚚 Truck / Heavy Vehicle (truck)</option>
                        <option value="alert">⚠️ Warning / Emergency (alert)</option>
                        <option value="bell">🔔 Notification Bell (bell)</option>
                        <option value="location">📍 Location / Towing (location)</option>
                        <option value="shield">🛡️ Shield / Security (shield)</option>
                        <option value="other">💬 Custom Text / Message (other)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Color</label>
                  <select
                    value={editingReason.color}
                    onChange={(e) => setEditingReason({ ...editingReason, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm"
                  >
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="rose">Rose</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="editOtherCheck"
                  checked={editingReason.isOtherType}
                  onChange={(e) => setEditingReason({ ...editingReason, isOtherType: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="editOtherCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Prompt user to type custom text when selected
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReason(null)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Delete Reason?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong className="text-slate-900">"{deleteTarget.title}"</strong>? It will be soft-deleted and can be restored anytime from Trash.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Yes, Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
