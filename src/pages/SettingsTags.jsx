import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Tag as TagIcon,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
  Archive,
  Layers
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function SettingsTags() {
  const { authHeader } = useAuth();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState('active'); // 'active' | 'trash'

  // New Tag Form (ONLY 1 TEXT FIELD)
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Tag State (ONLY 1 TEXT FIELD)
  const [editingTag, setEditingTag] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalTag, setDeleteModalTag] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = async (showTrash = viewTab === 'trash') => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/tags?showDeleted=${showTrash ? 'true' : 'false'}`,
        authHeader
      );
      if (res.data.success) {
        setTags(res.data.tags);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags(viewTab === 'trash');
  }, [viewTab]);

  // Create Tag (Only Name)
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/tags`,
        { name: newTagName },
        authHeader
      );
      if (res.data.success) {
        setShowAddModal(false);
        setNewTagName('');
        fetchTags(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating tag');
    } finally {
      setCreating(false);
    }
  };

  // Update Tag (Only Name)
  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editingTag || !editingTag.name.trim()) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/tags/${editingTag._id}`,
        { name: editingTag.name },
        authHeader
      );
      if (res.data.success) {
        setEditingTag(null);
        fetchTags(viewTab === 'trash');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tag');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Tag (Soft Delete)
  const confirmDeleteTag = async () => {
    if (!deleteModalTag) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE}/admin/tags/${deleteModalTag._id}`, authHeader);
      if (res.data.success) {
        setDeleteModalTag(null);
        fetchTags(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting tag');
    } finally {
      setDeleting(false);
    }
  };

  // Restore Tag
  const handleRestoreTag = async (tagId) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/tags/${tagId}/restore`, {}, authHeader);
      if (res.data.success) {
        fetchTags(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error restoring tag');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
            <TagIcon className="w-7 h-7 text-indigo-600" />
            <span>Batch Tags Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and organize partner batch tags (e.g. SHOWROOM-LUCKNOW, DEALER-NORTH)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch Tag</span>
          </button>
          <button
            onClick={() => fetchTags(viewTab === 'trash')}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Toggle Tabs: Active vs Soft-Deleted Trash */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewTab('active')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            viewTab === 'active'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Batch Tags</span>
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
          <span>🗑️ Soft-Deleted Tags</span>
        </button>
      </div>

      {/* Tags List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {viewTab === 'active' ? `Active Batch Tags (${tags.length})` : `Soft-Deleted Tags (${tags.length})`}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold">
            {viewTab === 'active' ? '✨ Available in QR Generator' : '🛡️ Preserved for old batch tracking'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tag Name</th>
                <th className="px-6 py-4">QR Sets Created</th>
                <th className="px-6 py-4">{viewTab === 'active' ? 'Created Date' : 'Deleted Date'}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-xs text-slate-400">
                    {viewTab === 'active' ? 'No active batch tags found.' : 'Trash is empty. No soft-deleted tags.'}
                  </td>
                </tr>
              ) : (
                tags.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700 flex items-center space-x-2">
                      <TagIcon className="w-4 h-4 text-indigo-500" />
                      <span>{t.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3 py-1 rounded-full">
                        {t.totalSets || 0} Sets ({ (t.totalSets || 0) * 2 } Stickers)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(viewTab === 'active' ? t.createdAt : (t.deletedAt || t.updatedAt)).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {viewTab === 'active' ? (
                        <>
                          <button
                            onClick={() => setEditingTag(t)}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteModalTag(t)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreTag(t._id)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TAG MODAL (ONLY 1 TEXT FIELD) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <TagIcon className="w-5 h-5 text-indigo-600" />
                <span>Add New Batch Tag</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHOWROOM-WEST, DEALER-NORTH"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm uppercase focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  autoFocus
                  required
                />
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
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>+ Save Tag</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TAG MODAL (ONLY 1 TEXT FIELD) */}
      {editingTag && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <TagIcon className="w-5 h-5 text-indigo-600" />
                <span>Edit Batch Tag</span>
              </h3>
              <button onClick={() => setEditingTag(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm uppercase focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  autoFocus
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
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
      {deleteModalTag && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Delete Tag?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove tag <strong className="text-slate-900 font-mono">{deleteModalTag.name}</strong>? It will be soft-deleted and can be restored anytime from Trash.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setDeleteModalTag(null)}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTag}
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
