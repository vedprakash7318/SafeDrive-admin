import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Zap,
  Phone,
  MessageSquare,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Info
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function ExtraPricing() {
  const { authHeader } = useAuth();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Package Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPkgForm, setNewPkgForm] = useState({ name: '', category: 'CALL', quantity: 10, price: 49 });
  const [creating, setCreating] = useState(false);

  // Edit Package Modal
  const [editingPkg, setEditingPkg] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/packages`, authHeader);
      if (res.data.success) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Create Package
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/packages`, newPkgForm, authHeader);
      if (res.data.success) {
        setShowAddModal(false);
        setNewPkgForm({ name: '', category: 'CALL', quantity: 10, price: 49 });
        fetchPackages();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating booster package');
    } finally {
      setCreating(false);
    }
  };

  // Update Package
  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    if (!editingPkg) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/packages/${editingPkg._id}`,
        { name: editingPkg.name, price: editingPkg.price, quantity: editingPkg.quantity },
        authHeader
      );
      if (res.data.success) {
        setEditingPkg(null);
        fetchPackages();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update package');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async (pkgId) => {
    if (!confirm('Are you sure you want to remove this top-up package?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/packages/${pkgId}`, authHeader);
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing package');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <Zap className="w-7 h-7 text-amber-500" />
            <span>Extra Quota Pricing & Booster Packs</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure rates for vehicle owners who want to purchase additional calls or messages
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="self-start flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Extra Booster Pack</span>
        </button>
      </div>

      {/* Immutability Banner */}
      <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-3xl flex items-center space-x-3 text-xs text-indigo-900">
        <Info className="w-5 h-5 flex-shrink-0 text-indigo-600" />
        <span>
          <strong>Quota Immutability Protection:</strong> Modifying package prices or quantities here only affects <strong>future purchases</strong>. Previous purchasers keep their current balance and receipt history safely unchanged.
        </span>
      </div>

      {/* Extra Calls Booster Packs */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Phone className="w-5 h-5 text-emerald-600" />
          <span>Extra Voice Call Top-Up Packages</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packages
            .filter((p) => p.category === 'CALL')
            .map((pkg) => (
              <div key={pkg._id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Extra Calls
                    </span>
                    <span className="text-2xl font-black text-slate-900">₹{pkg.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                  <p className="text-xs text-slate-500">
                    Adds <span className="font-bold text-emerald-600">+{pkg.quantity} Voice Calls</span> to vehicle owner's quota wallet.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setEditingPkg(pkg)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Price / Qty</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Extra Messages Booster Packs */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span>Extra Message & Alert Top-Up Packages</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packages
            .filter((p) => p.category === 'MESSAGE')
            .map((pkg) => (
              <div key={pkg._id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      Extra Messages
                    </span>
                    <span className="text-2xl font-black text-slate-900">₹{pkg.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                  <p className="text-xs text-slate-500">
                    Adds <span className="font-bold text-blue-600">+{pkg.quantity} SMS / WhatsApp</span> alerts to vehicle owner's quota wallet.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setEditingPkg(pkg)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Price / Qty</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* CREATE PACKAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Create Extra Booster Pack</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Calls Mega Top-Up"
                  value={newPkgForm.name}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={newPkgForm.category}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-slate-900 text-sm font-semibold"
                  >
                    <option value="CALL">CALL</option>
                    <option value="MESSAGE">MESSAGE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quota</label>
                  <input
                    type="number"
                    value={newPkgForm.quantity}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newPkgForm.price}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-bold"
                    required
                  />
                </div>
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
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Pack</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACKAGE MODAL */}
      {editingPkg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Edit Pack: {editingPkg.name}</h3>
              <button onClick={() => setEditingPkg(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name</label>
                <input
                  type="text"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingPkg.price}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quantity ({editingPkg.category})</label>
                  <input
                    type="number"
                    value={editingPkg.quantity}
                    onChange={(e) => setEditingPkg({ ...editingPkg, quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
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
    </div>
  );
}
