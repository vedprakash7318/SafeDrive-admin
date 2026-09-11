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

export default function PartnerOrders() {
  const { authHeader, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Dispatching / Updating Status
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewPageOpen, setViewPageOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    orderStatus: 'DISPATCHED',
    courierPartner: '',
    trackingNumber: '',
    trackingLink: '',
    adminNotes: ''
  });
  const [dispatchMethod, setDispatchMethod] = useState('SHIPPRIME');
  
  // Tag Allocation State
  const [availableTags, setAvailableTags] = useState([]);
  const [assignedTagIds, setAssignedTagIds] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [batchSearch, setBatchSearch] = useState('');
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const batchDropdownRef = useRef(null);
  
  const [receiptFile, setReceiptFile] = useState(null);
  
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
      }
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
        setBatchDropdownOpen(false);
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
      const res = await axios.get(`${API_BASE}/admin/partner-orders`, authHeader);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
    if (search) {
      const query = search.toLowerCase();
      return o.orderNumber?.toLowerCase().includes(query) ||
             o.partnerName?.toLowerCase().includes(query) ||
             o.partnerPhone?.toLowerCase().includes(query);
    }
    return true;
  });

  const openUpdateModal = async (order) => {
    setSelectedOrder(order);
    setActionError('');
    setStatusForm({
      orderStatus: order.orderStatus === 'PROCESSING' || order.orderStatus === 'PENDING' ? 'DISPATCHED' : order.orderStatus,
      courierPartner: order.courierPartner || '',
      trackingNumber: order.trackingNumber || '',
      adminNotes: order.adminNotes || ''
    });
    setAssignedTagIds(order.assignedTagIds ? order.assignedTagIds.map(t => t._id || t) : []);
    setTagSearch('');
    setTagDropdownOpen(false);
    setDispatchMethod('SHIPPRIME');
    setReceiptFile(null);

    if (order.orderStatus === 'PROCESSING' || order.orderStatus === 'PENDING') {
      try {
        const res = await axios.get(`${API_BASE}/admin/partner-orders/available-tags`, {
          headers: authHeader.headers,
          params: { category: order.category || 'Car', limit: 50000 }
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
          headers: { ...authHeader.headers, 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          uploadedReceiptUrl = uploadRes.data.receiptUrl;
        } else {
          throw new Error('Failed to upload receipt');
        }
      }

      const payload = { ...statusForm };
      
      const isDispatchMode = statusForm.orderStatus === 'DISPATCHED' || statusForm.orderStatus === 'SHIPPED';
      
      if (isDispatchMode) {
        if (assignedTagIds.length !== selectedOrder.quantity) {
          setActionError(`Please select exactly ${selectedOrder.quantity} tags for this order.`);
          setUpdating(false);
          return;
        }
        
        payload.assignedTagIds = assignedTagIds;
        
        if (dispatchMethod === 'POST_OFFICE') {
          if (!payload.trackingNumber) {
            setActionError('Please enter Tracking Number for manual dispatch.');
            setUpdating(false);
            return;
          }
          payload.courierPartner = 'Post Office';
          if (uploadedReceiptUrl) {
            payload.shippingLabelUrl = uploadedReceiptUrl;
          }
        } else {
          payload.courierPartner = 'ShipPrime';
        }
      }

      const res = await axios.put(
        `${API_BASE}/admin/partner-orders/${selectedOrder._id}/status`,
        payload,
        authHeader
      );
      if (res.data.success) {
        setActionSuccess(`Order updated to ${res.data.data ? res.data.data.orderStatus : statusForm.orderStatus}`);
        setUpdateModalOpen(false);
        fetchOrders();
        setTimeout(() => setActionSuccess(''), 4000);
        
        // Auto-open shipping label if generated
        if (res.data.data?.shippingLabelUrl) {
          window.open(res.data.data.shippingLabelUrl, '_blank');
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
      confirmButtonText: 'Yes, update it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE}/admin/partner-orders/${orderId}/status`,
        { paymentStatus: newPaymentStatus },
        authHeader
      );
      if (res.data.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}.`);
        setSelectedOrder(res.data.data || { ...selectedOrder, paymentStatus: newPaymentStatus });
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update payment status');
    }
  };

  const handleCancelProcessingOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "Are you sure you want to cancel this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE}/admin/partner-orders/${orderId}/status`,
        { orderStatus: 'CANCELLED' },
        authHeader
      );
      if (res.data.success) {
        toast.success('Order cancelled successfully.');
        setSelectedOrder(res.data.data || { ...selectedOrder, orderStatus: 'CANCELLED' });
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const handleCancelShipment = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Shipment?',
      text: "Are you sure you want to cancel this ShipPrime shipment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.post(`${API_BASE}/admin/partner-orders/${orderId}/shipprime-cancel`, {}, authHeader);
      if (res.data.success) {
        toast.success('Shipment Cancelled');
        fetchOrders();
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
      confirmButtonText: 'Yes, initiate return!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.post(`${API_BASE}/admin/partner-orders/${orderId}/shipprime-return`, {}, authHeader);
      if (res.data.success) {
        toast.success('Return Shipment Initiated');
        fetchOrders();
        setViewPageOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate return');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    const result = await Swal.fire({
      title: 'Mark as Delivered?',
      text: "Are you sure this order is delivered? This will transfer the assigned tags to the Partner's inventory.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, mark delivered!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_BASE}/admin/partner-orders/${orderId}/status`,
        { orderStatus: 'DELIVERED' },
        authHeader
      );
      if (res.data.success) {
        toast.success('Order marked as Delivered.');
        fetchOrders();
        setViewPageOpen(false);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'PROCESSING': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DISPATCHED': 
      case 'SHIPPED': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
      case 'RETURNED': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
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
                <span>Partner Bulk Orders</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage B2B orders, dispatch bulk tags to dealers and franchisees.
              </p>
            </div>

            <button
              onClick={fetchOrders}
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

          {/* 2. FILTERS & SEARCH */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order #, Partner Name, Phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1D56A5]"
              >
                <option value="ALL">All Delivery Status</option>
                <option value="PENDING">🕒 Pending</option>
                <option value="PROCESSING">⏳ Processing</option>
                <option value="DISPATCHED">🚚 Dispatched</option>
                <option value="DELIVERED">✅ Delivered</option>
                <option value="CANCELLED">❌ Cancelled</option>
                <option value="RETURNED">↩️ Returned</option>
              </select>
            </div>
          </div>

          {/* 3. ORDERS TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5]" />
                <span>Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-300" />
                <p>No partner orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Order ID & Date</th>
                      <th className="py-3.5 px-4">Partner Details</th>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Quantity</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Delivery Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-slate-900 text-xs">{o.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{o.partnerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">📞 {o.partnerPhone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 whitespace-nowrap">{o.productName}</div>
                          <span className="inline-flex items-center space-x-1 bg-[#E9DFEE] text-[#1D56A5] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap mt-1">
                            <span>🏷️</span><span>{o.category || 'N/A'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap shadow-sm">
                            <span className="text-[#1D56A5] text-sm leading-none">📦</span>
                            <span className="font-black text-slate-900 text-sm">{o.quantity}</span>
                            <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">PCS</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm">₹{o.grandTotal}</div>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-[#259A3A] border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {o.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center space-x-1 border text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(o.orderStatus)}`}>
                            <span>{o.orderStatus}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openViewPage(o)}
                            className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => openUpdateModal(o)}
                            className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-[#1D56A5] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                          >
                            {(o.orderStatus === 'PROCESSING' || o.orderStatus === 'PENDING') ? (
                              <>
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch</span>
                              </>
                            ) : (
                              <span>Edit Status</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. UPDATE STATUS / DISPATCH MODAL */}
      {updateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {(selectedOrder.orderStatus === 'PROCESSING' || selectedOrder.orderStatus === 'PENDING')
                    ? 'Dispatch Bulk Order' 
                    : 'Update Order Delivery'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Order: {selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
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
                  <div className="font-bold text-slate-900">{selectedOrder.partnerName} ({selectedOrder.partnerPhone})</div>
                  <span className="bg-[#1D56A5] text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black">
                    Qty: {selectedOrder.quantity} PCS
                  </span>
                </div>
                <div className="text-slate-600 font-semibold flex items-center space-x-1.5">
                  <span>📦 {selectedOrder.productName}</span>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                {(() => {
                  const isDispatchMode = selectedOrder.orderStatus === 'PROCESSING' || selectedOrder.orderStatus === 'PENDING';
                  
                  return (
                    <>
                      {!isDispatchMode && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Delivery Status *
                          </label>
                          <select
                            value={statusForm.orderStatus}
                            onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
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

                      {isDispatchMode && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-white relative" ref={dropdownRef}>
                          <label className="flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            <span>Allocate Tags ({assignedTagIds.length} / {selectedOrder.quantity})</span>
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Total Available: {availableTags.length}
                            </span>
                          </label>
                          
                          <div className="flex flex-wrap gap-2 my-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (availableTags.length < selectedOrder.quantity) {
                                  toast.error(`Not enough available tags. Required: ${selectedOrder.quantity}`);
                                  return;
                                }
                                const tagsToSelect = availableTags.slice(0, selectedOrder.quantity).map(t => t._id);
                                setAssignedTagIds(tagsToSelect);
                              }}
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[10px] font-bold px-3 py-1.5 rounded-md transition"
                            >
                              Bulk Select {selectedOrder.quantity} Tags
                            </button>
                            <div className="relative" ref={batchDropdownRef}>
                              <div
                                onClick={() => setBatchDropdownOpen(!batchDropdownOpen)}
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-md transition cursor-pointer flex justify-between items-center min-w-[150px]"
                              >
                                <span>Select Batches...</span>
                                <span className="ml-2 text-[10px]">▼</span>
                              </div>
                              
                              {batchDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-20 w-64 flex flex-col">
                                  <input
                                    type="text"
                                    placeholder="Search Batch Name..."
                                    value={batchSearch}
                                    onChange={(e) => setBatchSearch(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 mb-2 shrink-0"
                                  />
                                  <div className="overflow-y-auto max-h-40 space-y-1 flex-1">
                                    {(() => {
                                      const uniqueBatches = [...new Set(availableTags.map(t => t.batchId))].filter(Boolean);
                                      const filteredBatches = uniqueBatches.filter(b => b.toLowerCase().includes(batchSearch.toLowerCase()));
                                      
                                      if (filteredBatches.length === 0) {
                                        return <div className="text-[10px] text-slate-400 text-center py-2">No batches found.</div>;
                                      }
                                      
                                      return filteredBatches.map(batch => {
                                        const count = availableTags.filter(t => t.batchId === batch).length;
                                        return (
                                          <div
                                            key={batch}
                                            onClick={() => {
                                              const batchTags = availableTags.filter(t => t.batchId === batch).map(t => t._id);
                                              if (batchTags.length === 0) {
                                                toast.error('No tags found for this batch.');
                                                return;
                                              }
                                              
                                              const limit = selectedOrder.quantity - assignedTagIds.length;
                                              if (limit <= 0) {
                                                toast.error('Quantity already fulfilled.');
                                                return;
                                              }
                                              
                                              const toAssign = batchTags.slice(0, limit);
                                              setAssignedTagIds(prev => [...new Set([...prev, ...toAssign])]);
                                              
                                              if (toAssign.length < limit) {
                                                toast.error(`Added ${toAssign.length} tags. Still need ${limit - toAssign.length} more.`);
                                              } else {
                                                toast.success(`Added ${toAssign.length} tags from ${batch}`);
                                              }
                                            }}
                                            className="px-2 py-1.5 hover:bg-emerald-50 rounded-lg cursor-pointer text-xs flex justify-between items-center transition"
                                          >
                                            <span className="font-bold text-slate-700 truncate max-w-[150px]">{batch}</span>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">{count}</span>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setAssignedTagIds([])}
                              className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-md transition"
                            >
                              Clear
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500 font-medium">Need more tags?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setUpdateModalOpen(false);
                                navigate('/inventory');
                              }}
                              className="text-[10px] text-[#1D56A5] font-bold hover:underline"
                            >
                              Create new batch
                            </button>
                          </div>

                          <div
                            onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 mb-2 cursor-pointer flex justify-between items-center"
                          >
                            <span className="truncate max-w-[90%]">
                              {assignedTagIds.length > 0
                                ? `${assignedTagIds.length} tag(s) selected`
                                : "Click to view inventory tags..."}
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
                                              if (assignedTagIds.length < selectedOrder.quantity) {
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
                                  Upload Receipt (PDF/Image)
                                </label>
                                <input
                                  type="file"
                                  accept="application/pdf,image/*"
                                  onChange={(e) => setReceiptFile(e.target.files[0])}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5] text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1D56A5] file:text-white hover:file:bg-[#164382] cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Courier Partner Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. India Post"
                                  value={statusForm.courierPartner}
                                  onChange={(e) => setStatusForm({ ...statusForm, courierPartner: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#1D56A5]"
                                />
                              </div>
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
                          disabled={updating || (isDispatchMode && assignedTagIds.length !== selectedOrder.quantity)}
                          className="px-5 py-2.5 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold rounded-xl flex items-center space-x-2 shadow-md shadow-[#1D56A5]/25 disabled:opacity-50"
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

      {/* 5. VIEW DETAILS PAGE */}
      {viewPageOpen && selectedOrder && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
            <div>
              <button 
                onClick={() => setViewPageOpen(false)}
                className="mb-4 inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg leading-none">←</span>
                <span>Back to Partner Orders</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
                <FileText className="w-7 h-7 text-[#1D56A5]" />
                <span>Partner Order Details</span>
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
                <p className="text-2xl font-black text-emerald-600">₹{selectedOrder.grandTotal}</p>
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

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Status</p>
                <p className="text-2xl font-black text-[#1D56A5]">{selectedOrder.orderStatus}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedOrder.shippingLabelUrl && (
                    <a
                      href={selectedOrder.shippingLabelUrl}
                      target="_blank"
                      download="Shipping_Label_Receipt.pdf"
                      rel="noopener noreferrer"
                      className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                    >
                      🖨️ Download Label / Receipt
                    </a>
                  )}
                  {(selectedOrder.orderStatus === 'PROCESSING' || selectedOrder.orderStatus === 'PENDING') && (
                    <button
                      onClick={() => handleCancelProcessingOrder(selectedOrder._id)}
                      className="inline-block bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                  {(selectedOrder.orderStatus === 'DISPATCHED' || selectedOrder.orderStatus === 'SHIPPED') && selectedOrder.trackingNumber && selectedOrder.courierPartner !== 'Post Office' && (
                    <button
                      onClick={() => handleCancelShipment(selectedOrder._id)}
                      className="inline-block bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                    >
                      ❌ Cancel Shipment
                    </button>
                  )}
                  {(selectedOrder.orderStatus === 'DISPATCHED' || selectedOrder.orderStatus === 'SHIPPED') && (
                    <button
                      onClick={() => handleMarkDelivered(selectedOrder._id)}
                      className="inline-block bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}
                  {selectedOrder.orderStatus === 'DELIVERED' && selectedOrder.courierPartner !== 'Post Office' && (
                    <button
                      onClick={() => handleReturnShipment(selectedOrder._id)}
                      className="inline-block bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                    >
                      ↩️ Initiate Return
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Partner Info */}
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                  <User className="w-4 h-4" /> <span>Partner & Shipping</span>
                </h3>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Partner Name</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedOrder.partnerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Phone</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedOrder.partnerPhone}</span>
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
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{selectedOrder.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Quantity</span>
                      <span className="font-black text-slate-900">{selectedOrder.quantity} Units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Tags */}
            <div>
              <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>{selectedOrder.orderStatus === 'CANCELLED' ? 'Previously Assigned Tags (History)' : 'Assigned Tags'}</span>
              </h3>
              {selectedOrder.assignedTagIds && selectedOrder.assignedTagIds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedOrder.assignedTagIds.map(tag => (
                    <div key={tag._id || tag} className={`border p-4 rounded-2xl flex items-center space-x-3 shadow-sm ${selectedOrder.orderStatus === 'CANCELLED' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
                      <div className={`p-2 rounded-xl ${selectedOrder.orderStatus === 'CANCELLED' ? 'bg-red-100' : 'bg-indigo-50'}`}>
                        <QrCode className={`w-5 h-5 ${selectedOrder.orderStatus === 'CANCELLED' ? 'text-red-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-black ${selectedOrder.orderStatus === 'CANCELLED' ? 'text-red-900 line-through opacity-70' : 'text-slate-900'}`}>{tag.productId}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${selectedOrder.orderStatus === 'DELIVERED' ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {selectedOrder.orderStatus === 'DELIVERED' ? 'Transferred to Partner' : 'Assigned to Order'}
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

          </div>
        </div>
      )}
    </div>
  );
}
