import React, { useState, useEffect, useRef } from 'react';
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
  DollarSign,
  X,
  Printer,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState(() => localStorage.getItem('ordersTabFilter') || 'PHYSICAL');

  useEffect(() => {
    localStorage.setItem('ordersTabFilter', typeFilter);
  }, [typeFilter]);

  // Modal State for Dispatching / Updating Status
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewPageOpen, setViewPageOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    deliveryStatus: 'DISPATCHED',
    courierPartner: '',
    trackingNumber: '',
    trackingLink: '',
    adminNotes: ''
  });
  const [dispatchMethod, setDispatchMethod] = useState('SHIPPRIME');
  const [receiptFile, setReceiptFile] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [assignedTagIds, setAssignedTagIds] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Refund State
  const [refundForm, setRefundForm] = useState({ amount: '', reference: '', notes: '' });
  const [customerBankDetails, setCustomerBankDetails] = useState(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        headers: { Authorization: `Bearer ${token}` },
        params: { type: typeFilter }
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

  const openUpdateModal = async (order) => {
    setSelectedOrder(order);
    setActionError('');
    setStatusForm({
      deliveryStatus: order.deliveryStatus === 'PROCESSING' ? 'DISPATCHED' : order.deliveryStatus,
      courierPartner: order.courierPartner || '',
      trackingNumber: order.trackingNumber || '',
      adminNotes: order.adminNotes || ''
    });
    setAssignedTagIds([]);
    setTagSearch('');
    setTagDropdownOpen(false);

    if (order.productType === 'PHYSICAL') {
      try {
        const res = await axios.get(`${API_BASE}/admin/orders/available-tags`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { qrFor: order.qrFor }
        });
        if (res.data.success) {
          setAvailableTags(res.data.tags);
        }
      } catch (err) {
        console.error('Failed to fetch available tags:', err);
      }
    }

    setUpdateModalOpen(true);
  };

  const openViewPage = (order) => {
    setSelectedOrder(order);
    setViewPageOpen(true);
  };

  const openRefundModal = async () => {
    if (!selectedOrder) return;
    setRefundModalOpen(true);
    setRefundForm({ amount: selectedOrder.amount, reference: '', notes: '' });
    setLoadingBankDetails(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/users/${selectedOrder.userId._id || selectedOrder.userId}/bank-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.bankDetails) {
        setCustomerBankDetails(res.data.bankDetails);
      } else {
        setCustomerBankDetails(null);
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
      setCustomerBankDetails(null);
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    setActionError('');
    try {
      let uploadedReceiptUrl = '';
      if (dispatchMethod === 'POST_OFFICE' && receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadRes = await axios.post(`${API_BASE}/admin/orders/upload-receipt`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          uploadedReceiptUrl = uploadRes.data.receiptUrl;
        } else {
          throw new Error('Failed to upload receipt');
        }
      }

      const payload = { ...statusForm, assignedTagIds };
      if (statusForm.deliveryStatus === 'DISPATCHED' && dispatchMethod === 'POST_OFFICE') {
        payload.courierPartner = 'Post Office';
        if (uploadedReceiptUrl) {
          payload.shippingLabelUrl = uploadedReceiptUrl;
        }
      }

      const res = await axios.patch(
        `${API_BASE}/admin/orders/${selectedOrder._id}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setActionSuccess(`Order updated to ${res.data.order.deliveryStatus}`);
        setUpdateModalOpen(false);
        fetchOrders();
        fetchStats();
        setTimeout(() => setActionSuccess(''), 4000);
        
        // Auto-open shipping label if generated
        if (res.data.order.shippingLabelUrl) {
          window.open(res.data.order.shippingLabelUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setActionError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    const result = await Swal.fire({
      title: 'Update Payment Status?',
      text: `Mark order as ${newPaymentStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, update it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/orders/${orderId}/status`,
        { paymentStatus: newPaymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}.`);
        setSelectedOrder(res.data.order);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleCancelProcessingOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "Are you sure you want to cancel this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/orders/${orderId}/status`,
        { deliveryStatus: 'CANCELLED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Order cancelled successfully.');
        setSelectedOrder(res.data.order);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleCancelShipment = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Shipment?',
      text: "Are you sure you want to cancel this ShipPrime shipment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.post(`${API_BASE}/admin/orders/${orderId}/shipprime-cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success('Shipment Cancelled');
        fetchOrders();
        fetchStats();
        setViewPageOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel shipment');
    }
  };

  const handleReturnShipment = async (orderId) => {
    const result = await Swal.fire({
      title: 'Initiate Return?',
      text: "Are you sure you want to initiate a return (reverse pickup) for this ShipPrime shipment?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, initiate return!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.post(`${API_BASE}/admin/orders/${orderId}/shipprime-return`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success('Return Shipment Initiated');
        fetchOrders();
        fetchStats();
        setViewPageOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate return');
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!refundForm.amount || !refundForm.reference) {
      alert('Amount and Reference number are required');
      return;
    }
    setProcessingRefund(true);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/orders/${selectedOrder._id}/refund`,
        { refundAmount: refundForm.amount, refundReference: refundForm.reference, refundNotes: refundForm.notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setActionSuccess('Refund marked as PROCESSED');
        setSelectedOrder(res.data.order);
        fetchOrders();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {!viewPageOpen && (
        <>
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
            Track customer tag purchases, accept orders, dispatch physical stickers, and monitor QR claim activations.
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders / Tags</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {stats.totalOrders} <span className="text-base text-slate-400 font-medium ml-1">({stats.totalKits} Tags)</span>
                </h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-[#1D56A5] rounded-2xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Physical: <strong className="text-slate-900">{stats.physicalKits} Tags</strong> | Digital: <strong className="text-slate-900">{stats.digitalKits} Tags</strong>
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

          <div className="bg-white p-5 rounded-3xl border border-red-200/70 shadow-xs bg-red-50/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Cancelled</p>
                <h3 className="text-2xl font-black text-red-900 mt-1">{stats.cancelled || 0}</h3>
              </div>
              <div className="p-2.5 bg-red-100 text-red-700 rounded-2xl">
                <X className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-red-700 mt-2 font-medium">Cancelled orders</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-orange-200/70 shadow-xs bg-orange-50/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Returned</p>
                <h3 className="text-2xl font-black text-orange-900 mt-1">{stats.returned || 0}</h3>
              </div>
              <div className="p-2.5 bg-orange-100 text-orange-700 rounded-2xl">
                <RefreshCw className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-orange-700 mt-2 font-medium">Returned orders</p>
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

      {/* 3. TABS */}
      <div className="flex space-x-2 border-b border-slate-200 mb-2">
        <button
          onClick={() => setTypeFilter('PHYSICAL')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${typeFilter === 'PHYSICAL' ? 'border-[#1D56A5] text-[#1D56A5]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Physical Orders
        </button>
        <button
          onClick={() => setTypeFilter('DIGITAL')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${typeFilter === 'DIGITAL' ? 'border-[#1D56A5] text-[#1D56A5]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Digital Orders
        </button>
        <button
          onClick={() => setTypeFilter('ALL')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${typeFilter === 'ALL' ? 'border-[#1D56A5] text-[#1D56A5]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          All Orders
        </button>
      </div>

      {/* 4. FILTERS & SEARCH */}
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
            <option value="PROCESSING">⏳ Processing / New Order</option>
            <option value="DISPATCHED">🚚 Dispatched</option>
            <option value="DELIVERED">✅ Delivered</option>
            <option value="CANCELLED">❌ Cancelled</option>
            <option value="RETURNED">↩️ Returned</option>
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
                  <th className="py-3.5 px-4">Ordered Qty</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">QR Claim Status</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((o) => {
                  const qty = o.quantity || 1;
                  const unitPrice = o.unitPrice || Math.round(o.amount / qty);

                  return (
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
                      </td>

                      {/* Product & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 whitespace-nowrap">{o.productName}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {o.qrFor && !o.productName.toLowerCase().includes(o.qrFor.toLowerCase()) && (
                            <span className="inline-flex items-center space-x-1 bg-[#E9DFEE] text-[#1D56A5] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                              <span>🏷️</span><span>{o.qrFor}</span>
                            </span>
                          )}
                          {o.productType && !o.productName.toLowerCase().includes(o.productType.toLowerCase()) && (
                            o.productType === 'DIGITAL' ? (
                              <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200 whitespace-nowrap">
                                <span>💻</span><span>DIGITAL</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                                <span>📦</span><span>PHYSICAL</span>
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Ordered Quantity */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap shadow-sm">
                          <span className="text-[#1D56A5] text-sm leading-none">📦</span>
                          <span className="font-black text-slate-900 text-sm">{qty}</span>
                          <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">{qty === 1 ? 'Tag' : 'Tags'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">₹{o.amount}</div>
                        <div className="text-[10px] text-slate-400 font-mono">₹{unitPrice} × {qty}</div>
                        <span className="inline-block bg-emerald-50 text-[#259A3A] text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                          {o.paymentStatus}
                        </span>
                      </td>

                      {/* QR Allotment Status */}
                      <td className="py-3.5 px-4">
                        {o.productType === 'DIGITAL' ? (
                          (() => {
                            const allocatedTags = (o.allocatedQRIds && o.allocatedQRIds.length > 0)
                              ? [...new Set(o.allocatedQRIds.map(q => q?.productId || q))].filter(Boolean)
                              : (o.claimedProductId ? [o.claimedProductId] : []);

                            const tagsLabel = allocatedTags.length > 0
                              ? allocatedTags.length <= 4
                                ? allocatedTags.join(', ')
                                : `${allocatedTags[0]} to ${allocatedTags[allocatedTags.length - 1]} (${allocatedTags.length} Tags)`
                              : (o.claimedProductId || 'SD Digital Pass');

                            return o.isClaimed ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Registered ({tagsLabel})</span>
                                </span>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Digital E-Pass Active • {o.claimedAt ? new Date(o.claimedAt).toLocaleDateString() : 'Active'}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                  <span>Allotted ({tagsLabel})</span>
                                </span>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Pending User Scan & Activation
                                </div>
                              </div>
                            );
                          })()
                        ) : o.isClaimed ? (
                          <div>
                            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Registered ({o.claimedProductId || 'SD Tag'})</span>
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
                            <span>Pending Delivery & Scan</span>
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
                            {o.shippingLabelUrl && (
                              <div className="mt-1">
                                <a
                                  href={o.shippingLabelUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-300"
                                >
                                  <span>🖨️ Label</span>
                                </a>
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
                        {o.deliveryStatus === 'CANCELLED' && (
                          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <X className="w-3 h-3 text-red-600" />
                            <span>Cancelled</span>
                          </span>
                        )}
                        {o.deliveryStatus === 'RETURNED' && (
                          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <RefreshCw className="w-3 h-3 text-amber-600" />
                            <span>Returned</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openViewPage(o)}
                          className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {o.productType === 'PHYSICAL' && (
                          <button
                            onClick={() => openUpdateModal(o)}
                            className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-[#1D56A5] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                          >
                            {o.deliveryStatus === 'PROCESSING' ? (
                              <>
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch</span>
                              </>
                            ) : (
                              <span>Edit Status</span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* 5. UPDATE STATUS / DISPATCH MODAL */}
      {updateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedOrder.deliveryStatus === 'PROCESSING' && selectedOrder.productType === 'PHYSICAL' 
                    ? 'Dispatch Order' 
                    : 'Update Order Delivery'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Order: {selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-2 -mr-2 flex-1">
              {actionError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs mb-4 space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900">{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                  <span className="bg-[#1D56A5] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black">
                    Qty: {selectedOrder.quantity || 1} {selectedOrder.quantity === 1 ? 'Tag' : 'Tags'}
                  </span>
                </div>
                <div className="text-slate-600 font-semibold flex items-center space-x-1.5">
                  <span>📦 {selectedOrder.productName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-800">Total: ₹{selectedOrder.amount}</span>
                </div>
                <div className="text-slate-600">
                  📍 {selectedOrder.deliveryAddress}
                  {selectedOrder.landmark && <span> (Near {selectedOrder.landmark})</span>}
                  {selectedOrder.city && `, ${selectedOrder.city}`}
                  {selectedOrder.state && ` ${selectedOrder.state}`}
                  {selectedOrder.pincode && <span className="font-mono font-bold text-slate-900"> - {selectedOrder.pincode}</span>}
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                {(() => {
                  const isDispatchMode = selectedOrder.deliveryStatus === 'PROCESSING' && selectedOrder.productType === 'PHYSICAL';
                  
                  return (
                    <>
                      {!isDispatchMode && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Delivery Status *
                          </label>
                          <select
                            value={statusForm.deliveryStatus}
                            onChange={(e) => setStatusForm({ ...statusForm, deliveryStatus: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                          >
                            <option value="PROCESSING">⏳ Processing</option>
                            <option value="DISPATCHED">🚚 Dispatched</option>
                            <option value="DELIVERED">✅ Delivered</option>
                            <option value="CANCELLED">❌ Cancelled</option>
                            <option value="RETURNED">↩️ Returned</option>
                          </select>
                        </div>
                      )}

                      {selectedOrder.productType === 'PHYSICAL' && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-white relative" ref={dropdownRef}>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Assign Printed Tags ({assignedTagIds.length} / {selectedOrder.quantity || 1})
                          </label>
                          <p className="text-[9px] text-slate-500 mb-2">Select {selectedOrder.quantity || 1} tags of type: {selectedOrder.qrFor}</p>

                          <div
                            onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 mb-2 cursor-pointer flex justify-between items-center"
                          >
                            <span className="truncate max-w-[90%]">
                              {assignedTagIds.length > 0
                                ? assignedTagIds.map(id => availableTags.find(t => t._id === id)?.productId).filter(Boolean).join(', ') || `${assignedTagIds.length} tag(s) selected`
                                : "Click to select tags..."}
                            </span>
                            <span className="text-[10px]">▼</span>
                          </div>

                          {tagDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-10 max-h-48 flex flex-col">
                              <input
                                type="text"
                                placeholder="Search Tag ID or Code..."
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 mb-2 shrink-0"
                              />

                              <div className="overflow-y-auto space-y-1 flex-1">
                                {availableTags.filter(t => t.productId.toLowerCase().includes(tagSearch.toLowerCase()) || t.copyCode.toLowerCase().includes(tagSearch.toLowerCase())).length === 0 ? (
                                  <div className="text-[10px] text-slate-400 text-center py-2">No available tags found.</div>
                                ) : (
                                  availableTags
                                    .filter(t => t.productId.toLowerCase().includes(tagSearch.toLowerCase()) || t.copyCode.toLowerCase().includes(tagSearch.toLowerCase()))
                                    .map(tag => {
                                      const isSelected = assignedTagIds.includes(tag._id);
                                      return (
                                        <div
                                          key={tag._id}
                                          onClick={() => {
                                            if (isSelected) {
                                              setAssignedTagIds(assignedTagIds.filter(id => id !== tag._id));
                                            } else {
                                              if (assignedTagIds.length < (selectedOrder.quantity || 1)) {
                                                setAssignedTagIds([...assignedTagIds, tag._id]);
                                              }
                                            }
                                          }}
                                          className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg cursor-pointer border text-xs ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                          <span>{tag.productId} ({tag.qrFor || 'Physical'})</span>
                                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                      );
                                    })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isDispatchMode && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3">
                            Dispatch Method
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="dispatchMethod" 
                                value="SHIPPRIME" 
                                checked={dispatchMethod === 'SHIPPRIME'} 
                                onChange={(e) => setDispatchMethod(e.target.value)}
                                className="text-[#1D56A5] focus:ring-[#1D56A5]"
                              />
                              <span className="text-sm font-semibold text-slate-800">ShipPrime (Automated)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="dispatchMethod" 
                                value="POST_OFFICE" 
                                checked={dispatchMethod === 'POST_OFFICE'} 
                                onChange={(e) => setDispatchMethod(e.target.value)}
                                className="text-[#1D56A5] focus:ring-[#1D56A5]"
                              />
                              <span className="text-sm font-semibold text-slate-800">Post Office (Manual)</span>
                            </label>
                          </div>

                          {dispatchMethod === 'POST_OFFICE' && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Tracking ID *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. EU123456789IN"
                                  value={statusForm.trackingNumber}
                                  onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Tracking Link
                                </label>
                                <input
                                  type="url"
                                  placeholder="e.g. https://www.indiapost.gov.in"
                                  value={statusForm.trackingLink}
                                  onChange={(e) => setStatusForm({ ...statusForm, trackingLink: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Upload Receipt / Label (PDF or Image)
                                </label>
                                <input
                                  type="file"
                                  accept="application/pdf,image/*"
                                  onChange={(e) => setReceiptFile(e.target.files[0])}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-600 focus:outline-none focus:border-[#1D56A5]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!isDispatchMode && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Courier / Delivery Partner
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Blue Dart, Delhivery"
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
                        </>
                      )}

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

                      <div className="flex justify-end space-x-2 pt-2 pb-2">
                        <button
                          type="button"
                          onClick={() => setUpdateModalOpen(false)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updating || (isDispatchMode && assignedTagIds.length === 0)}
                          className="px-5 py-2.5 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold rounded-xl flex items-center space-x-2 shadow-md shadow-[#1D56A5]/25"
                        >
                          {updating ? (
                            <span>{isDispatchMode ? 'Dispatching...' : 'Saving...'}</span>
                          ) : (
                            <span>{isDispatchMode ? (dispatchMethod === 'POST_OFFICE' ? 'Dispatch via Post Office' : 'Dispatch & Print Label') : 'Save & Update'}</span>
                          )}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* The View Details Page is rendered conditionally above. But we removed it from here. We will place it at the top of the return block. Wait, I can just conditionally render the main content vs the view content. */}
      {viewPageOpen && selectedOrder && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
            <div>
              <button 
                onClick={() => setViewPageOpen(false)}
                className="mb-4 inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg leading-none">←</span>
                <span>Back to Orders</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
                <FileText className="w-7 h-7 text-[#1D56A5]" />
                <span>Order Details</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 flex items-center space-x-2">
                <span>{selectedOrder.orderNumber}</span>
                <span className="text-slate-300">•</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Top Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Amount</p>
                <p className="text-2xl font-black text-emerald-600">₹{selectedOrder.amount}</p>
                <div className="text-xs font-bold text-slate-600 mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span>{selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (ONLINE)'} - {selectedOrder.paymentStatus}</span>
                  {selectedOrder.paymentMethod === 'COD' && selectedOrder.paymentStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder._id, 'PAID')}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-[10px] sm:text-xs transition font-bold"
                    >
                      Mark as PAID
                    </button>
                  )}
                </div>
              </div>
              {selectedOrder.productType === 'DIGITAL' ? (
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] uppercase font-bold text-indigo-500 mb-1">Fulfillment Status</p>
                  <p className="text-2xl font-black text-indigo-700">Instant Delivery</p>
                  <p className="text-xs font-bold text-indigo-600/70 mt-1 flex items-center space-x-1">
                    <span>✓ Digital E-Pass</span>
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Status</p>
                  <p className="text-2xl font-black text-[#1D56A5]">{selectedOrder.deliveryStatus}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedOrder.shippingLabelUrl && (
                      <a
                        href={selectedOrder.shippingLabelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                      >
                        🖨️ Download Label
                      </a>
                    )}
                    {selectedOrder.deliveryStatus === 'PROCESSING' && (
                      <button
                        onClick={() => handleCancelProcessingOrder(selectedOrder._id)}
                        className="inline-block bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                      >
                        ❌ Cancel Order
                      </button>
                    )}
                    {selectedOrder.deliveryStatus === 'DISPATCHED' && selectedOrder.trackingNumber && (
                      <button
                        onClick={() => handleCancelShipment(selectedOrder._id)}
                        className="inline-block bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                      >
                        ❌ Cancel Shipment
                      </button>
                    )}
                    {selectedOrder.deliveryStatus === 'DELIVERED' && (
                      <button
                        onClick={() => handleReturnShipment(selectedOrder._id)}
                        className="inline-block bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                      >
                        ↩️ Initiate Return
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                  <User className="w-4 h-4" /> <span>Customer & Shipping</span>
                </h3>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Name</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Phone</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Delivery Address</span>
                    <span className="font-bold text-slate-900 text-sm leading-relaxed block">
                      {selectedOrder.deliveryAddress}
                      {selectedOrder.landmark && ` (Near ${selectedOrder.landmark})`}
                      {selectedOrder.city && `, ${selectedOrder.city}`}
                      {selectedOrder.state && ` ${selectedOrder.state}`}
                      {selectedOrder.pincode && ` - ${selectedOrder.pincode}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                  <Package className="w-4 h-4" /> <span>Product Details</span>
                </h3>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base">{selectedOrder.productName}</p>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{selectedOrder.productType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Quantity</span>
                      <span className="font-black text-slate-900">{selectedOrder.quantity || 1} Units</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Unit Price</span>
                      <span className="font-black text-slate-900">₹{selectedOrder.unitPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Tags */}
            {selectedOrder.productType === 'PHYSICAL' && (
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span>{selectedOrder.deliveryStatus === 'CANCELLED' ? 'Previously Assigned Tags (History)' : 'Assigned Physical Tags'}</span>
                </h3>
                {selectedOrder.allocatedQRIds && selectedOrder.allocatedQRIds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedOrder.allocatedQRIds.map(tag => (
                      <div key={tag._id || tag} className={`border p-4 rounded-2xl flex items-center space-x-3 shadow-sm ${selectedOrder.deliveryStatus === 'CANCELLED' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
                        <div className={`p-2 rounded-xl ${selectedOrder.deliveryStatus === 'CANCELLED' ? 'bg-red-100' : 'bg-indigo-50'}`}>
                          <QrCode className={`w-5 h-5 ${selectedOrder.deliveryStatus === 'CANCELLED' ? 'text-red-600' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-black ${selectedOrder.deliveryStatus === 'CANCELLED' ? 'text-red-900 line-through opacity-70' : 'text-slate-900'}`}>{tag.productId}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${selectedOrder.deliveryStatus === 'CANCELLED' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {selectedOrder.deliveryStatus === 'CANCELLED' ? 'Freed (Returned to Stock)' : 'Assigned to Order'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <QrCode className="w-8 h-8 text-slate-300 mb-2" />
                    <p>No tags have been assigned to this order yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Refund Management */}
            {selectedOrder.deliveryStatus === 'CANCELLED' && selectedOrder.paymentStatus === 'PAID' && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Refund Management</span>
                </h3>
                
                {selectedOrder.refundStatus === 'PROCESSED' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-100">
                      <span className="text-emerald-800 font-black text-lg flex items-center space-x-2">
                        <CheckCircle2 className="w-6 h-6" /> <span>Refund Processed</span>
                      </span>
                      <span className="text-emerald-700 text-sm font-bold font-mono bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-100">
                        {new Date(selectedOrder.refundDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-emerald-900">
                      <div>
                        <span className="opacity-70 text-xs font-bold uppercase tracking-wider block mb-1">Amount Refunded</span>
                        <span className="font-black text-2xl">₹{selectedOrder.refundAmount}</span>
                      </div>
                      <div>
                        <span className="opacity-70 text-xs font-bold uppercase tracking-wider block mb-1">Reference / UTR Number</span>
                        <span className="font-black font-mono text-lg">{selectedOrder.refundReference}</span>
                      </div>
                      {selectedOrder.refundNotes && (
                        <div className="col-span-full pt-4 border-t border-emerald-100/50">
                          <span className="opacity-70 text-xs font-bold uppercase tracking-wider block mb-1">Admin Notes</span>
                          <span className="font-semibold text-sm">{selectedOrder.refundNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <p className="text-base font-black text-slate-900">Refund is Pending</p>
                      <p className="text-sm font-semibold text-slate-500 mt-1">This order was cancelled but the customer's payment has not been refunded yet.</p>
                    </div>
                    <button
                      onClick={() => {
                        openRefundModal();
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition flex items-center space-x-2 whitespace-nowrap w-full sm:w-auto justify-center"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Process Refund Now</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                  <span>Process Refund</span>
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Order {selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Bank Details */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                <h4 className="text-xs font-black text-slate-500 uppercase mb-3">Customer Bank / UPI Details</h4>
                {loadingBankDetails ? (
                  <p className="text-sm text-slate-500 animate-pulse">Loading details...</p>
                ) : customerBankDetails ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {customerBankDetails.upiId && (
                      <div className="col-span-2 mb-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-indigo-900/70 text-xs uppercase font-bold block mb-1">UPI ID</span>
                        <span className="font-black text-indigo-700">{customerBankDetails.upiId}</span>
                      </div>
                    )}
                    <div><span className="text-slate-500 text-xs block mb-0.5">Bank</span> <span className="font-bold text-slate-900">{customerBankDetails.bankName || '-'}</span></div>
                    <div><span className="text-slate-500 text-xs block mb-0.5">Holder</span> <span className="font-bold text-slate-900">{customerBankDetails.accountHolderName || '-'}</span></div>
                    <div><span className="text-slate-500 text-xs block mb-0.5">A/C No</span> <span className="font-mono font-bold text-slate-900">{customerBankDetails.accountNumber || '-'}</span></div>
                    <div><span className="text-slate-500 text-xs block mb-0.5">IFSC</span> <span className="font-mono font-bold text-slate-900">{customerBankDetails.ifscCode || '-'}</span></div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">No Bank Details Provided</p>
                      <p className="text-xs text-amber-700/80 mt-1">The user has not saved their bank details. Please contact them or process refund manually.</p>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => {
                handleRefundSubmit(e).then(() => {
                  setRefundModalOpen(false);
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Refund Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">UTR / Reference No.</label>
                    <input
                      type="text"
                      required
                      value={refundForm.reference}
                      onChange={(e) => setRefundForm({ ...refundForm, reference: e.target.value })}
                      placeholder="e.g. UPI Ref"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={refundForm.notes}
                    onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
                    placeholder="Reason or extra info"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processingRefund}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition disabled:opacity-50 flex justify-center items-center space-x-2"
                  >
                    {processingRefund ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span>Confirm & Mark as Refunded</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
