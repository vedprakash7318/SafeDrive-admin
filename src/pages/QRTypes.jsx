import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Box,
  Layers2,
  RotateCcw,
  Archive,
  Layers,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function QRTypes() {
  const { authHeader } = useAuth();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState('active'); // 'active' | 'trash'

  // New Type Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newCategory, setNewCategory] = useState('VEHICLE');
  const [newCopiesPerSet, setNewCopiesPerSet] = useState(2);
  const [creating, setCreating] = useState(false);

  // Edit Type Modal
  const [editingType, setEditingType] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Soft Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTypes = async (showTrash = viewTab === 'trash') => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/qr-types?showDeleted=${showTrash ? 'true' : 'false'}`,
        authHeader
      );
      if (res.data.success) {
        setTypes(res.data.types);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes(viewTab === 'trash');
  }, [viewTab]);

  // Create Type
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/qr-types`,
        {
          name: newTypeName,
          category: newCategory,
          isVehicle: newCategory === 'VEHICLE',
          copiesPerSet: Number(newCopiesPerSet) || 2
        },
        authHeader
      );
      if (res.data.success) {
        setShowAddModal(false);
        setNewTypeName('');
        setNewCategory('VEHICLE');
        setNewCopiesPerSet(2);
        fetchTypes(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating QR type');
    } finally {
      setCreating(false);
    }
  };

  // Update Type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingType || !editingType.name.trim()) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/qr-types/${editingType._id}`,
        {
          name: editingType.name,
          category: editingType.category || 'VEHICLE',
          isVehicle: editingType.category !== 'NON_VEHICLE',
          copiesPerSet: Number(editingType.copiesPerSet) || 2
        },
        authHeader
      );
      if (res.data.success) {
        setEditingType(null);
        fetchTypes(viewTab === 'trash');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating QR type');
    } finally {
      setUpdating(false);
    }
  };

  // Soft Delete Type
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/admin/qr-types/${deleteTarget._id}`, authHeader);
      setDeleteTarget(null);
      fetchTypes(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing QR type');
    } finally {
      setDeleting(false);
    }
  };

  // Restore Soft-Deleted Type
  const handleRestore = async (typeId) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/qr-types/${typeId}/restore`, {}, authHeader);
      if (res.data.success) {
        fetchTypes(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error restoring QR type');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1D56A5] text-white flex items-center justify-center shadow-lg shadow-[#1D56A5]/25 flex-shrink-0">
            <Layers2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              QR For (Vehicles / Items)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure vehicle/item categories (Car, Bike, Luggage, Door) and how many sticker copies (C1, C2...) are generated per set
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add QR For Category</span>
          </button>
          <button
            onClick={() => fetchTypes(viewTab === 'trash')}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Toggle Tabs: Active vs Soft-Deleted Trash */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewTab('active')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            viewTab === 'active'
              ? 'bg-[#1D56A5] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Categories</span>
        </button>

        <button
          onClick={() => setViewTab('trash')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            viewTab === 'trash'
              ? 'bg-[#E94E1A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Soft-Deleted Trash</span>
        </button>
      </div>

      {/* Types Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            {viewTab === 'active' ? `Active Types (${types.length})` : `Deleted Types (${types.length})`}
          </span>
          <span className="text-[11px] text-[#1D56A5] font-semibold">
            {viewTab === 'active' ? '✨ Configured copies will auto-generate per set' : '🛡️ Preserved in DB for old QR integrity'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">QR Type / Name</th>
                <th className="px-5 py-3.5">Category & Verification Flow</th>
                <th className="px-5 py-3.5">Copies Generated Per Set</th>
                <th className="px-5 py-3.5">Total Sets Created</th>
                <th className="px-5 py-3.5">{viewTab === 'active' ? 'Created Date' : 'Deleted Date'}</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-xs text-slate-400">
                    {viewTab === 'active' ? 'No active QR types found.' : 'Trash is empty. No soft-deleted items.'}
                  </td>
                </tr>
              ) : (
                types.map((t) => {
                  const copies = t.copiesPerSet || 2;
                  const isVehicleType = t.isVehicle !== false && t.category !== 'NON_VEHICLE';
                  return (
                    <tr key={t._id} className="hover:bg-[#E9DFEE]/20 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                        <Box className="w-4 h-4 text-[#1D56A5]" />
                        <span>{t.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isVehicleType ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                            <span>🚗 Vehicle (Plate Verification)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                            <span>🧳 Non-Vehicle (4-Digit PIN)</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/25 text-xs font-bold px-2.5 py-0.5 rounded-md">
                          <Copy className="w-3 h-3 text-[#1D56A5]" />
                          <span>{copies} {copies === 1 ? 'Copy (C1)' : `Copies (C1..C${copies})`}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <span className="bg-[#E9DFEE]/70 text-[#1D56A5] border border-[#1D56A5]/20 font-bold px-2 py-0.5 rounded">
                          {t.totalSets || 0} Sets ({ (t.totalSets || 0) * copies } Stickers)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(viewTab === 'active' ? t.createdAt : (t.deletedAt || t.updatedAt)).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        {viewTab === 'active' ? (
                          <>
                            <button
                              onClick={() => setEditingType({
                                ...t,
                                category: t.category || (t.isVehicle === false ? 'NON_VEHICLE' : 'VEHICLE'),
                                copiesPerSet: t.copiesPerSet || 2
                              })}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(t)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-[#E94E1A] border border-[#E94E1A]/30 font-semibold px-2.5 py-1 rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(t._id)}
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-[#259A3A] border border-[#259A3A]/30 font-bold px-2.5 py-1 rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
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

      {/* CREATE TYPE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Box className="w-5 h-5 text-[#1D56A5]" />
                <span>Add New QR Type</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type / Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Car, Bike, Luggage, Bag, Pet Tag, Key Fob"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item Category & Verification Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory('VEHICLE')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      newCategory === 'VEHICLE'
                        ? 'border-[#1D56A5] bg-blue-50/70 text-[#1D56A5] ring-2 ring-[#1D56A5]/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">🚗 Vehicle Tag</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-normal">Number plate verification (Car, Bike, etc.)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('NON_VEHICLE')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      newCategory === 'NON_VEHICLE'
                        ? 'border-[#F36F21] bg-orange-50/70 text-[#F36F21] ring-2 ring-[#F36F21]/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">🧳 Non-Vehicle (PIN)</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-normal">Generates unique 4-digit PIN printed on tag</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Number of Copies Generated per Set *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCopiesPerSet}
                    onChange={(e) => setNewCopiesPerSet(e.target.value)}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                    required
                  />
                  <div className="text-xs text-slate-500">
                    {newCopiesPerSet == 1 && 'Single sticker (C1)'}
                    {newCopiesPerSet == 2 && '2 stickers per set (C1, C2)'}
                    {newCopiesPerSet > 2 && `${newCopiesPerSet} stickers per set (C1 to C${newCopiesPerSet})`}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>+ Save Type</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TYPE MODAL */}
      {editingType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#1D56A5]" />
                <span>Edit QR Type</span>
              </h3>
              <button onClick={() => setEditingType(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type Name *
                </label>
                <input
                  type="text"
                  value={editingType.name}
                  onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item Category & Verification Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingType({ ...editingType, category: 'VEHICLE' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      (editingType.category || 'VEHICLE') === 'VEHICLE'
                        ? 'border-[#1D56A5] bg-blue-50/70 text-[#1D56A5] ring-2 ring-[#1D56A5]/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">🚗 Vehicle Tag</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-normal">Number plate verification</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingType({ ...editingType, category: 'NON_VEHICLE' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      editingType.category === 'NON_VEHICLE'
                        ? 'border-[#F36F21] bg-orange-50/70 text-[#F36F21] ring-2 ring-[#F36F21]/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">🧳 Non-Vehicle (PIN)</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-normal">4-digit PIN printed on tag</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Number of Copies Generated per Set *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingType.copiesPerSet || 2}
                    onChange={(e) => setEditingType({ ...editingType, copiesPerSet: e.target.value })}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                    required
                  />
                  <div className="text-xs text-slate-500">
                    {editingType.copiesPerSet == 1 && 'Single sticker (C1)'}
                    {editingType.copiesPerSet == 2 && '2 stickers per set (C1, C2)'}
                    {editingType.copiesPerSet > 2 && `${editingType.copiesPerSet} stickers per set (C1 to C${editingType.copiesPerSet})`}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
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
            <div className="w-12 h-12 bg-red-50 text-[#E94E1A] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#E94E1A]/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-900 mb-1">Delete QR Type?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove <strong className="text-slate-900">"{deleteTarget.name}"</strong>? It will be soft-deleted and can be restored anytime from Trash.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-1/2 bg-[#E94E1A] hover:bg-[#d84414] text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs flex items-center justify-center space-x-2"
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
