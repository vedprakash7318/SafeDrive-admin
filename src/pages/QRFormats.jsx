import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Box,
  RotateCcw,
  Archive,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function QRFormats() {
  const { authHeader } = useAuth();

  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState('active'); // 'active' | 'trash'

  // Modal States - Only single text input as requested
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [editingFormat, setEditingFormat] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Soft Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFormats = async (showTrash = viewTab === 'trash') => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/qr-formats?showDeleted=${showTrash ? 'true' : 'false'}`,
        authHeader
      );
      if (res.data.success) {
        setFormats(res.data.formats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats(viewTab === 'trash');
  }, [viewTab]);

  // Create Format (Single text input)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/qr-formats`,
        { name: name.trim() },
        authHeader
      );
      if (res.data.success) {
        setShowAddModal(false);
        setName('');
        fetchFormats(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create QR Type');
    } finally {
      setCreating(false);
    }
  };

  // Update Format (Single text input)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingFormat || !editingFormat.name.trim()) return;

    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/qr-formats/${editingFormat._id}`,
        {
          name: editingFormat.name.trim(),
          isActive: editingFormat.isActive
        },
        authHeader
      );
      if (res.data.success) {
        setEditingFormat(null);
        fetchFormats(viewTab === 'trash');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update QR Type');
    } finally {
      setUpdating(false);
    }
  };

  // Soft Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/admin/qr-formats/${deleteTarget._id}`,
        authHeader
      );
      if (res.data.success) {
        setDeleteTarget(null);
        fetchFormats(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Restore
  const handleRestore = async (id) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/qr-formats/${id}/restore`,
        {},
        authHeader
      );
      if (res.data.success) {
        fetchFormats(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <Box className="w-7 h-7 text-[#1D56A5]" />
            <span>QR Type</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your QR types (e.g. Physical, Digital, PVC Card, etc.)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchFormats(viewTab === 'trash')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setName('');
              setShowAddModal(true);
            }}
            className="bg-[#1D56A5] hover:bg-[#164382] text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-[#1D56A5]/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add QR Type</span>
          </button>
        </div>
      </div>

      {/* Tabs: Active vs Archive */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            viewTab === 'active'
              ? 'bg-[#1D56A5] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Active QR Types</span>
        </button>
        <button
          onClick={() => setViewTab('trash')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            viewTab === 'trash'
              ? 'bg-[#E94E1A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived / Trash</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">QR Type Name</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && formats.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1D56A5]" />
                    Loading types...
                  </td>
                </tr>
              ) : formats.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">
                    No {viewTab === 'trash' ? 'archived' : 'active'} QR types found. Click "+ Add QR Type" to create one.
                  </td>
                </tr>
              ) : (
                formats.map((fmt) => (
                  <tr key={fmt._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1D56A5]"></span>
                        <span>{fmt.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {fmt.isActive !== false ? (
                        <span className="text-[10px] bg-emerald-50 text-[#259A3A] font-bold px-2.5 py-0.5 rounded-full border border-[#259A3A]/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {viewTab === 'trash' ? (
                        <button
                          onClick={() => handleRestore(fmt._id)}
                          className="bg-emerald-50 text-[#259A3A] hover:bg-[#259A3A] hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ml-auto text-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingFormat(fmt)}
                            className="p-2 text-slate-500 hover:text-[#1D56A5] hover:bg-slate-100 rounded-xl transition"
                            title="Edit Type"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(fmt)}
                            className="p-2 text-slate-500 hover:text-[#E94E1A] hover:bg-red-50 rounded-xl transition"
                            title="Delete Type"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. ADD MODAL (Only 1 Text Input) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">Add QR Type</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Physical, Digital, PVC..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="bg-[#1D56A5] hover:bg-[#164382] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save QR Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT MODAL (Only 1 Text Input) */}
      {editingFormat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">Edit QR Type</h3>
              <button onClick={() => setEditingFormat(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editingFormat.name}
                  onChange={(e) => setEditingFormat({ ...editingFormat, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFormat(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || !editingFormat.name.trim()}
                  className="bg-[#1D56A5] hover:bg-[#164382] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update QR Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E94E1A] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Archive QR Type?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to archive <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-[#E94E1A] hover:bg-[#c93f12] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
              >
                {deleting ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
