import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users as UsersIcon,
  RefreshCw,
  Search,
  Car,
  QrCode,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Eye,
  CheckCircle2,
  X,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function Users() {
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, authHeader);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (u) => {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Set user ${u.name} status to ${nextStatus}?`)) return;
    try {
      await axios.put(`${API_BASE}/admin/users/${u._id}/status`, { status: nextStatus }, authHeader);
      fetchUsers();
      if (selectedUser && selectedUser._id === u._id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.city && u.city.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCustomers = users.length;
  const totalQRsBought = users.reduce((sum, u) => sum + (u.totalQRsBought || 0), 0);
  const totalActiveQRs = users.reduce((sum, u) => sum + (u.activeQRsCount || 0), 0);
  const totalSoldQRs = users.reduce((sum, u) => sum + (u.soldQRsCount || 0), 0);
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <UsersIcon className="w-7 h-7 text-[#1D56A5]" />
            <span>Customer & Buyer Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View registered users, track bought QR sets, verify active vehicles, and review orders
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs transition active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 text-[#1D56A5] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* 2. SUMMARY KPI STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Buyers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCustomers}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#1D56A5]">Total QRs Bought</div>
          <div className="text-2xl font-black text-[#1D56A5] mt-1">{totalQRsBought}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#259A3A]">Active Protection</div>
          <div className="text-2xl font-black text-[#259A3A] mt-1">{totalActiveQRs}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Activation (Sold)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalSoldQRs}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spent</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Email, City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 border border-slate-200 w-full sm:w-auto justify-end">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                statusFilter === st
                  ? 'bg-[#1D56A5] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CUSTOMERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Customer Profile</th>
                <th className="px-6 py-3.5">QR Sets Bought</th>
                <th className="px-6 py-3.5">Active / Ready</th>
                <th className="px-6 py-3.5">Total Spent</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Loading users...' : 'No customers found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#E9DFEE]/20 transition">
                    {/* 1. Customer Profile */}
                    <td className="px-6 py-3.5">
                      <div
                        onClick={() => navigate(`/users/${u._id}`)}
                        className="font-bold text-slate-900 text-sm hover:text-[#1D56A5] cursor-pointer transition"
                      >
                        {u.name}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{u.phone}</span>
                        {u.email && <span>• {u.email}</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {u.city ? `${u.city}, ${u.state || ''}` : u.address}
                      </div>
                    </td>

                    {/* 2. QR Sets Bought */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                          📦 {u.totalQRsBought || u.qrs?.length || 0} Kits
                        </span>
                        {u.digitalQRsCount > 0 && (
                          <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-indigo-200">
                            💻 {u.digitalQRsCount} Digital
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Status Breakdown */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-50 text-[#259A3A] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#259A3A]/20">
                          {u.activeQRsCount || 0} Active
                        </span>
                        {u.soldQRsCount > 0 && (
                          <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                            {u.soldQRsCount} Pending Scan
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Total Spent */}
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">₹{u.totalSpent || 0}</div>
                      <div className="text-[10px] text-slate-400">{u.orders?.length || 0} Orders</div>
                    </td>

                    {/* 5. Account Status */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30'
                            : 'bg-red-50 text-[#E94E1A] border border-[#E94E1A]/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-[#259A3A]' : 'bg-[#E94E1A]'}`}></span>
                        <span>{u.status}</span>
                      </span>
                    </td>

                    {/* 6. Actions */}
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/users/${u._id}`)}
                        className="text-xs bg-[#1D56A5]/10 hover:bg-[#1D56A5] hover:text-white text-[#1D56A5] border border-[#1D56A5]/30 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition inline-flex items-center space-x-1 shadow-2xs ${
                          u.status === 'SUSPENDED'
                            ? 'bg-[#259A3A]/10 hover:bg-[#259A3A] hover:text-white text-[#259A3A] border-[#259A3A]/30'
                            : 'bg-[#E94E1A]/10 hover:bg-[#E94E1A] hover:text-white text-[#E94E1A] border-[#E94E1A]/30'
                        }`}
                      >
                        <span>{u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <span>{selectedUser.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedUser.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30'
                        : 'bg-red-50 text-[#E94E1A] border border-[#E94E1A]/30'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {selectedUser.phone} • Email: {selectedUser.email || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Delivery Address & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Delivery Address</div>
                  <div className="text-xs text-slate-800 font-medium leading-relaxed">
                    {selectedUser.address}, {selectedUser.city || ''} {selectedUser.state || ''}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Revenue</div>
                  <div className="text-xl font-black text-[#1D56A5]">₹{selectedUser.totalSpent || 0}</div>
                  <div className="text-[10px] text-slate-400">{selectedUser.orders?.length || 0} Orders</div>
                </div>
              </div>

              {/* ALLOCATED QR CODES LIST */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2 mb-3">
                  <QrCode className="w-4 h-4 text-[#1D56A5]" />
                  <span>Allocated QR Stickers ({selectedUser.qrs?.length || 0})</span>
                </h4>

                {(!selectedUser.qrs || selectedUser.qrs.length === 0) ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                    No QR codes allocated yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUser.qrs.map((qr) => (
                      <div
                        key={qr._id}
                        className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-black text-slate-900 text-sm">{qr.copyCode}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              qr.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30'
                                : 'bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/30'
                            }`}
                          >
                            {qr.status}
                          </span>
                        </div>

                        {qr.vehicleId && (
                          <div className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                            🚗 <strong>{qr.vehicleId.vehicleBrand} {qr.vehicleId.vehicleName}</strong> ({qr.vehicleId.vehicleNumber})
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                          <span>Expires: {qr.expiryDate ? new Date(qr.expiryDate).toLocaleDateString() : 'N/A'}</span>
                          <a
                            href={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1D56A5] font-bold hover:underline inline-flex items-center space-x-1"
                          >
                            <span>Scan Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ORDERS & INVOICES */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2 mb-3">
                  <ShoppingBag className="w-4 h-4 text-[#1D56A5]" />
                  <span>Order Transactions ({selectedUser.orders?.length || 0})</span>
                </h4>

                {(!selectedUser.orders || selectedUser.orders.length === 0) ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                    No orders on record.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {selectedUser.orders.map((ord) => (
                      <div key={ord._id} className="p-3.5 bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{ord.metadata?.productName || ord.purpose}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Order ID: {ord.orderId} • {new Date(ord.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#1D56A5]">₹{ord.amount}</div>
                          <span className="text-[9px] bg-emerald-50 text-[#259A3A] px-1.5 py-0.5 rounded font-bold">PAID</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
