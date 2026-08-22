import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  QrCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State for Dispatching / Updating Status
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    deliveryStatus: 'DISPATCHED',
    courierPartner: '',
    trackingNumber: '',
    adminNotes: ''
  });
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          status: statusFilter,
          type: typeFilter
        }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch order stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      deliveryStatus: order.deliveryStatus === 'PROCESSING' ? 'DISPATCHED' : order.deliveryStatus,
      courierPartner: order.courierPartner || '',
      trackingNumber: order.trackingNumber || '',
      adminNotes: order.adminNotes || ''
    });
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/admin/orders/${selectedOrder._id}/status`,
        statusForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setActionSuccess(`Order updated to ${res.data.order.deliveryStatus}`);
        setUpdateModalOpen(false);
        fetchOrders();
        fetchStats();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <span className="p-2 bg-[#E9DFEE] text-[#1D56A5] rounded-2xl">
              <Package className="w-6 h-6" />
            </span>
            <span>Customer Orders & Deliveries</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer kit purchases, accept orders, dispatch physical stickers, and monitor QR claim activations.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOrders();
            fetchStats();
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. STATS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-[#1D56A5] rounded-2xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Physical: <strong className="text-slate-900">{stats.physicalOrders}</strong> | Digital: <strong className="text-slate-900">{stats.digitalOrders}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200/70 shadow-xs bg-amber-50/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Dispatch</p>
                <h3 className="text-2xl font-black text-amber-900 mt-1">{stats.pendingDispatch}</h3>
              </div>
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-amber-700 mt-2 font-medium">Awaiting courier dispatch</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-indigo-200/70 shadow-xs bg-indigo-50/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-[#1D56A5] uppercase tracking-wider">Dispatched / En Route</p>
                <h3 className="text-2xl font-black text-[#1D56A5] mt-1">{stats.dispatched}</h3>
              </div>
              <div className="p-2.5 bg-indigo-100 text-[#1D56A5] rounded-2xl">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Delivered: <strong className="text-slate-900">{stats.delivered}</strong></p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-emerald-200/70 shadow-xs bg-emerald-50/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-black text-emerald-900 mt-1">₹{stats.totalRevenue?.toLocaleString()}</h3>
              </div>
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium">Claimed QRs: <strong className="text-slate-900">{stats.claimedQRs}</strong></p>
          </div>
        </div>
      )}

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer Name, Email, Phone, SD Code..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Delivery Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1D56A5]"
          >
            <option value="ALL">All Delivery Status</option>
            <option value="PROCESSING">⏳ Pending Dispatch</option>
            <option value="DISPATCHED">🚚 Dispatched</option>
            <option value="DELIVERED">✅ Delivered</option>
          </select>

          {/* Product Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1D56A5]"
          >
            <option value="ALL">All Medium Types</option>
            <option value="PHYSICAL">📦 Physical Kit</option>
            <option value="DIGITAL">💻 Digital E-QR</option>
          </select>
        </div>
      </div>

      {/* 4. ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5]" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p>No orders found matching the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Product & Category</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">QR Claim Status</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 text-xs">{o.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{o.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">📞 {o.customerPhone}</div>
                      <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                      {o.deliveryAddress && (
                        <div className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-tight">
                          📍 {o.deliveryAddress}
                          {o.landmark && <span className="text-slate-400 font-normal"> (Near {o.landmark})</span>}
                          {o.city && `, ${o.city}`}
                          {o.state && ` ${o.state}`}
                          {o.pincode && <span className="font-mono font-bold text-slate-700"> - {o.pincode}</span>}
                        </div>
                      )}
                    </td>

                    {/* Product & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{o.productName}</div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="inline-block bg-[#E9DFEE] text-[#1D56A5] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          🏷️ {o.qrFor}
                        </span>
                        {o.productType === 'DIGITAL' ? (
                          <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                            💻 DIGITAL
                          </span>
                        ) : (
                          <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                            📦 PHYSICAL
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-sm">₹{o.amount}</div>
                      <span className="inline-block bg-emerald-50 text-[#259A3A] text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                        {o.paymentStatus}
                      </span>
                    </td>

                    {/* QR Claim Status */}
                    <td className="py-3.5 px-4">
                      {o.isClaimed ? (
                        <div>
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Claimed ({o.claimedProductId || 'SD Kit'})</span>
                          </span>
                          {o.claimedAt && (
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              {new Date(o.claimedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Pending First Scan</span>
                        </span>
                      )}
                    </td>

                    {/* Delivery Status */}
                    <td className="py-3.5 px-4">
                      {o.deliveryStatus === 'PROCESSING' && (
                        <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Processing</span>
                        </span>
                      )}
                      {(o.deliveryStatus === 'DISPATCHED' || o.deliveryStatus === 'SHIPPED') && (
                        <div>
                          <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#1D56A5] border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <Truck className="w-3 h-3 text-[#1D56A5]" />
                            <span>Dispatched</span>
                          </span>
                          {o.courierPartner && (
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {o.courierPartner} {o.trackingNumber ? `(${o.trackingNumber})` : ''}
                            </div>
                          )}
                        </div>
                      )}
                      {o.deliveryStatus === 'DELIVERED' && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {o.productType === 'PHYSICAL' && (
                        <button
                          onClick={() => openUpdateModal(o)}
                          className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-[#1D56A5] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Update Status</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. UPDATE STATUS / DISPATCH MODAL */}
      {updateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Update Order Delivery</h3>
                <p className="text-xs text-slate-500 font-mono">Order: {selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs mb-4 space-y-1">
              <div className="font-bold text-slate-900">{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
              <div className="text-slate-600">
                📍 {selectedOrder.deliveryAddress}
                {selectedOrder.landmark && <span> (Near {selectedOrder.landmark})</span>}
                {selectedOrder.city && `, ${selectedOrder.city}`}
                {selectedOrder.state && ` ${selectedOrder.state}`}
                {selectedOrder.pincode && <span className="font-mono font-bold text-slate-900"> - {selectedOrder.pincode}</span>}
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Status *
                </label>
                <select
                  value={statusForm.deliveryStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, deliveryStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                >
                  <option value="PROCESSING">⏳ Processing (In Warehouse)</option>
                  <option value="DISPATCHED">🚚 Dispatched / Out for Delivery</option>
                  <option value="DELIVERED">✅ Delivered to Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Courier / Delivery Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue Dart, Delhivery, Speed Post, Hand Delivered"
                  value={statusForm.courierPartner}
                  onChange={(e) => setStatusForm({ ...statusForm, courierPartner: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Courier Tracking # / AWB
                </label>
                <input
                  type="text"
                  placeholder="e.g. BD987654321IN"
                  value={statusForm.trackingNumber}
                  onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional delivery notes"
                  value={statusForm.adminNotes}
                  onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold rounded-xl flex items-center space-x-2 shadow-md shadow-[#1D56A5]/25"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save & Update</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
