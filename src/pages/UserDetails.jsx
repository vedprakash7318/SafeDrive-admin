import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Car,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Package,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Gift,
  PlusCircle,
  MessageSquare,
  Tag,
  Eye,
  Truck,
  Clock,
  Smartphone,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';
import SafeDriveQRCode from '../components/SafeDriveQRCode';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalKits: 0,
    activeKits: 0,
    pendingKits: 0,
    expiredKits: 0,
    totalVehicles: 0,
    totalOrders: 0,
    totalPayments: 0,
    totalSpent: 0
  });
  const [kits, setKits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quotaLedger, setQuotaLedger] = useState([]);

  // Deep-Dive Modal State
  const [viewingKitModal, setViewingKitModal] = useState(null);

  // Renewal Modal State
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedKitToRenew, setSelectedKitToRenew] = useState(null);
  const [renewForm, setRenewForm] = useState({
    validityDays: 365,
    bonusCalls: 10,
    bonusMessages: 20,
    paymentAmount: 199,
    reason: 'Annual Subscription Renewal'
  });
  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState('');

  // Add Quota / Top-Up Modal State
  const [addQuotaModalOpen, setAddQuotaModalOpen] = useState(false);
  const [selectedKitForQuota, setSelectedKitForQuota] = useState(null);
  const [addQuotaForm, setAddQuotaForm] = useState({
    calls: 10,
    messages: 20,
    validityDays: 0,
    source: 'ADMIN_GRANT',
    amountPaid: 0,
    paymentId: '',
    reason: 'Complimentary Quota Credit by Admin'
  });
  const [addingQuota, setAddingQuota] = useState(false);
  const [addQuotaSuccess, setAddQuotaSuccess] = useState('');

  // Master Edit User Modal State
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [savingUserEdit, setSavingUserEdit] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    address: '',
    role: 'USER',
    status: 'ACTIVE'
  });

  const openEditUserModal = () => {
    if (!userData) return;
    setEditUserForm({
      name: userData.name || '',
      phone: userData.phone || '',
      email: userData.email || '',
      whatsappNumber: userData.whatsappNumber || '',
      address: userData.address || '',
      role: userData.role || 'USER',
      status: userData.status || 'ACTIVE'
    });
    setEditUserModalOpen(true);
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setSavingUserEdit(true);
    try {
      const res = await axios.put(`${API_BASE}/admin/users/${userData._id}`, editUserForm, authHeader);
      if (res.data.success) {
        setEditUserModalOpen(false);
        fetchUserDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user profile');
    } finally {
      setSavingUserEdit(false);
    }
  };

  // Expanded Payments per QR Kit
  const [expandedKitPayments, setExpandedKitPayments] = useState({});

  const toggleKitPayments = (prodId) => {
    setExpandedKitPayments((prev) => ({ ...prev, [prodId]: !prev[prodId] }));
  };

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/admin/users/${id}`, authHeader);
      if (res.data.success) {
        setUserData(res.data.user);
        setStats(res.data.stats || {});
        setKits(res.data.kits || []);
        setVehicles(res.data.vehicles || []);
        setOrders(res.data.orders || []);
        setPayments(res.data.payments || []);
        setQuotaLedger(res.data.quotaLedger || []);
      }
    } catch (err) {
      console.error('Fetch user details error:', err);
      setError(err.response?.data?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  // Open Renew Modal
  const openRenewModal = (kit) => {
    setSelectedKitToRenew(kit);
    setRenewForm({
      validityDays: 365,
      bonusCalls: 10,
      bonusMessages: 20,
      paymentAmount: 199,
      reason: 'Admin Manual Renewal'
    });
    setRenewSuccess('');
    setRenewModalOpen(true);
  };

  // Open Add Quota Modal
  const openAddQuotaModal = (kit) => {
    setSelectedKitForQuota(kit);
    setAddQuotaForm({
      calls: 10,
      messages: 20,
      validityDays: 0,
      source: 'ADMIN_GRANT',
      amountPaid: 0,
      paymentId: '',
      reason: 'Complimentary Quota Credit by Admin'
    });
    setAddQuotaSuccess('');
    setAddQuotaModalOpen(true);
  };

  // Handle Add Quota Submit
  const handleAddQuotaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKitForQuota) return;

    setAddingQuota(true);
    setAddQuotaSuccess('');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/add-quota`,
        {
          qrId: selectedKitForQuota.primaryQRId,
          ...addQuotaForm
        },
        authHeader
      );
      if (res.data.success) {
        setAddQuotaSuccess(res.data.message);
        setTimeout(() => {
          setAddQuotaModalOpen(false);
          fetchUserDetails();
        }, 1200);
      }
    } catch (err) {
      console.error('Add quota error:', err);
      alert(err.response?.data?.message || 'Failed to add quota');
    } finally {
      setAddingQuota(false);
    }
  };

  // Handle Renew Submit
  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKitToRenew) return;

    setRenewing(true);
    setRenewSuccess('');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/qr/${selectedKitToRenew.primaryQRId}/renew`,
        renewForm,
        authHeader
      );
      if (res.data.success) {
        setRenewSuccess(res.data.message);
        setTimeout(() => {
          setRenewModalOpen(false);
          fetchUserDetails();
        }, 1200);
      }
    } catch (err) {
      console.error('Renewal error:', err);
      alert(err.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async () => {
    if (!userData) return;
    const newStatus = userData.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await axios.put(`${API_BASE}/admin/users/${userData._id}/status`, { status: newStatus }, authHeader);
      if (res.data.success) {
        setUserData({ ...userData, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1D56A5] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading user account details & history...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-[#E94E1A] rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">User Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested user could not be found.'}</p>
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center space-x-2 bg-[#1D56A5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP BAR NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#1D56A5] text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-md shadow-[#1D56A5]/25">
            {userData.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-black text-slate-900 leading-tight">{userData.name}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                userData.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                ● {userData.status}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {userData.role}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-mono">
              <span>📱 {userData.phone}</span>
              {userData.email && <span>✉️ {userData.email}</span>}
              <span className="text-slate-400">Joined: {new Date(userData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openEditUserModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition bg-[#1D56A5] hover:bg-[#164382] text-white shadow-2xs flex items-center space-x-1.5"
          >
            <span>✏️ Master Edit User</span>
          </button>

          <button
            onClick={handleToggleUserStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              userData.status === 'ACTIVE'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            {userData.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
          </button>

          <button
            onClick={fetchUserDetails}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-[#1D56A5]" />
          </button>
        </div>
      </div>

      {/* 2. ANALYTICS METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total QR Kits Purchased */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Kits</span>
            <Package className="w-4.5 h-4.5 text-[#1D56A5]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalKits || 0}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {stats.activeKits || 0} Active • {stats.pendingKits || 0} Pending Scan
          </p>
        </div>

        {/* Digital QR Passes */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Digital Pass</span>
            <Smartphone className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.digitalKits || 0}</div>
          <p className="text-[10px] text-indigo-700/80 mt-1 font-medium">Instant Virtual E-Pass</p>
        </div>

        {/* Pending Delivery / Physical Stickers */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Physical Pending</span>
            <Truck className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.physicalPendingKits || 0}</div>
          <p className="text-[10px] text-amber-700 mt-1 font-medium">Awaiting Sticker Delivery</p>
        </div>

        {/* Active Registered */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active Live</span>
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.activeKits || 0}</div>
          <p className="text-[10px] text-emerald-700 mt-1 font-medium">Bound with Live Vehicles</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Spent</span>
            <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{(stats.totalSpent || 0).toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{stats.totalPayments || 0} Transactions</p>
        </div>
      </div>

      {/* 3. PROFILE & CONTACT DETAILS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <User className="w-4 h-4 text-[#1D56A5]" />
          <span>Customer Profile & Delivery Address</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Details</span>
            <div className="font-bold text-slate-900 text-sm">{userData.name}</div>
            <div className="text-slate-600 font-mono">📱 Mobile: {userData.phone}</div>
            {userData.whatsappNumber && <div className="text-slate-600 font-mono">💬 WhatsApp: {userData.whatsappNumber}</div>}
            <div className="text-slate-600 font-mono">✉️ Email: {userData.email || 'N/A'}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery & Billing Address</span>
            <div className="text-slate-800 font-medium leading-relaxed">
              📍 {userData.address || 'Address not provided'}
              {userData.landmark && <span className="text-slate-500"> (Near {userData.landmark})</span>}
              {userData.city && `, ${userData.city}`}
              {userData.state && ` ${userData.state}`}
              {userData.pincode && <span className="font-bold text-slate-900 font-mono"> - {userData.pincode}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PURCHASED & LINKED QR SAFETY KITS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-[#1D56A5]" />
              <span>Purchased & Linked QR Kits ({kits.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unique QR Kits owned by this user with live vehicle bindings, calling quotas, and renewal actions
            </p>
          </div>
        </div>

        {kits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center text-slate-400 text-xs">
            No QR safety kits or orders purchased by this user yet.
          </div>
        ) : (
          <div className="space-y-4">
            {kits.map((kit, idx) => {
              const isPaymentsExpanded = !!expandedKitPayments[kit.productId];
              const kitPayments = kit.payments || [];
              const isActive = kit.status === 'ACTIVE';
              const isPending = kit.status === 'PENDING_DELIVERY_SCAN' || kit.isPendingOrder;

              return (
                <div
                  key={kit.productId || idx}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 transition hover:border-slate-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
                    {/* Kit Header */}
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#E9DFEE] text-[#1D56A5] flex items-center justify-center font-black flex-shrink-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-base">
                            {kit.isPendingOrder ? `Order: ${kit.order?.productName || kit.qrFor}` : kit.productId}
                          </span>
                          {kit.quantity > 1 && (
                            <span className="bg-[#1D56A5] text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                              📦 {kit.quantity} Kits
                            </span>
                          )}
                          <span className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            🏷️ {kit.qrFor || 'Car'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            kit.qrType === 'DIGITAL'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {kit.qrType === 'DIGITAL' ? '💻 DIGITAL' : '📦 PHYSICAL'}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            ● {isActive ? 'ACTIVE' : isPending ? 'PENDING DELIVERY & SCAN' : kit.status}
                          </span>
                        </div>

                        {/* Sticker Copies / Order details */}
                        <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-slate-500">
                          {kit.copies && kit.copies.length > 0 ? (
                            <>
                              <span>Copies:</span>
                              {kit.copies.map((c) => (
                                <span
                                  key={c._id || c.copyCode}
                                  className="font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]"
                                >
                                  {c.copyCode}
                                </span>
                              ))}
                              <span className="text-slate-400 ml-2">Batch: {kit.batchId}</span>
                            </>
                          ) : (
                            <span className="font-mono text-slate-500">
                              Order: <strong>#{kit.order?.orderNumber || 'Physical Shipment'}</strong> • Qty: <strong>{kit.quantity || 1} {kit.quantity === 1 ? 'Kit' : 'Kits'}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive && (
                        <>
                          <button
                            onClick={() => openAddQuotaModal(kit)}
                            className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add Quota / Top-Up</span>
                          </button>

                          <button
                            onClick={() => openRenewModal(kit)}
                            className="inline-flex items-center space-x-1 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Renew QR</span>
                          </button>
                        </>
                      )}

                      {kit.primaryQRId ? (
                        <div className="flex items-center space-x-1.5">
                          <Link
                            to={`/qr-users/${kit.productId || kit.primaryQRId}`}
                            className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-[#259A3A] font-bold px-3 py-2 rounded-xl text-xs transition border border-emerald-200"
                            title="Open Dedicated QR User & Vehicle View Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View QR Details ↗</span>
                          </Link>

                          {kit.primaryPublicToken && (
                            <a
                              href={`${PUBLIC_SCAN_BASE}/scan/${kit.primaryPublicToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-[#1D56A5] font-bold px-2.5 py-2 rounded-xl text-xs transition border border-blue-200"
                              title="Test Public Scan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Public Scan</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <Link
                          to="/orders"
                          className="inline-flex items-center space-x-1 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Manage Shipment ↗</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Kit Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                    {/* Vehicle info */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Vehicle</span>
                      {kit.vehicle ? (
                        <div>
                          <div className="font-mono font-black text-slate-900 text-sm">{kit.vehicle.vehicleNumber}</div>
                          <div className="text-slate-600 font-bold">{kit.vehicle.vehicleBrand} {kit.vehicle.vehicleName}</div>
                          {(kit.activatedByName || kit.activatedByPhone) && (
                            <div className="text-[10px] text-[#1D56A5] font-bold mt-1 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
                              👤 Activated by: {kit.activatedByName || 'Recipient'} ({kit.activatedByPhone})
                            </div>
                          )}
                          {kit.vehicle.emergencyContacts && kit.vehicle.emergencyContacts.length > 0 && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              Emergency: {kit.vehicle.emergencyContacts.map(c => `${c.name} (${c.number})`).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : isPending ? (
                        <div className="text-amber-800 text-[11px] leading-relaxed">
                          📦 <strong>Physical Delivery:</strong> Awaiting sticker delivery to customer & scan activation.
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">No vehicle linked yet</div>
                      )}
                    </div>

                    {/* Quota Balances */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calling & SMS Quota</span>
                      {kit.wallet ? (
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-emerald-800">
                            📞 <strong>{kit.wallet.callBalance}</strong> Voice Calls Left
                            {kit.quantity > 1 && (
                              <span className="text-[10px] text-emerald-700 font-mono font-medium block">
                                (10 calls per kit × {kit.quantity} kits)
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-[#1D56A5]">
                            💬 <strong>{kit.wallet.messageBalance}</strong> SMS Alerts Left
                            {kit.quantity > 1 && (
                              <span className="text-[10px] text-[#1D56A5] font-mono font-medium block">
                                (20 messages per kit × {kit.quantity} kits)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            Used: {kit.wallet.totalCallsUsed || 0} calls, {kit.wallet.totalMessagesUsed || 0} SMS
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-700 text-xs space-y-1">
                          <div>
                            📞 <strong className="text-emerald-700">{10 * (kit.quantity || 1)} Voice Calls</strong>
                            {kit.quantity > 1 && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                (10 calls per kit × {kit.quantity} kits)
                              </span>
                            )}
                          </div>
                          <div>
                            💬 <strong className="text-[#1D56A5]">{20 * (kit.quantity || 1)} SMS Alerts</strong>
                            {kit.quantity > 1 && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                (20 messages per kit × {kit.quantity} kits)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            Included with kit purchase
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Validity & Payments Summary */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validity & Payments</span>
                      <div className="font-mono font-bold text-slate-900">
                        {kit.expiryDate ? (
                          <span>⏱️ Expiry: {new Date(kit.expiryDate).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-amber-800">🚚 Delivery: {kit.deliveryStatus || 'PROCESSING'}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {kit.quantity > 1 ? (
                          <>
                            Order Total: <strong className="text-slate-900 font-mono">₹{kit.totalPaidAmount || kit.order?.amount}</strong>
                            <span className="text-slate-500 font-mono block"> (₹{kit.unitPrice || 299} × {kit.quantity} = ₹{kit.totalPaidAmount || kit.order?.amount})</span>
                          </>
                        ) : (
                          <>
                            Price Paid: <strong className="text-slate-900 font-mono">₹{kit.totalPaidAmount || kit.order?.amount || 299}</strong>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. QUOTA LEDGER & ADD-ON TOP-UP HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            <span>Quota Balance Ledger & Transaction History ({quotaLedger.length} Records)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete audit trail of all free initial quotas, addon pack top-ups, renewal bonuses, and scan calls/SMS
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Kit Set ID</th>
                <th className="px-4 py-3.5">Transaction Type</th>
                <th className="px-4 py-3.5">Source & Details</th>
                <th className="px-4 py-3.5">Cost / Payment</th>
                <th className="px-4 py-3.5">Performed By</th>
                <th className="px-4 py-3.5">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {quotaLedger.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400 text-xs">
                    No quota usage or add-on ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                quotaLedger.map((q, idx) => {
                  const isCredit = q.type === 'CREDIT';
                  return (
                    <tr key={q._id || idx} className="hover:bg-slate-50/80 transition">
                      {/* Date */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString()} {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Kit / Product Set */}
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {q.kitProductId || q.productId || 'Kit Set'}
                      </td>

                      {/* Type & Amount */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                              isCredit
                                ? 'bg-emerald-50 text-[#259A3A] border-[#259A3A]/30'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {isCredit ? `+${q.quantity}` : `-${q.quantity}`} {q.category}
                          </span>
                        </div>
                      </td>

                      {/* Source & Description */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          {q.source === 'INITIAL_FREE' && (
                            <span className="bg-blue-50 text-[#1D56A5] font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
                              🎁 Initial Free Quota
                            </span>
                          )}
                          {q.source === 'ADMIN_GRANT' && (
                            <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-purple-200">
                              👑 Admin Gift / Top-Up
                            </span>
                          )}
                          {q.source === 'PURCHASE_ADDON' && (
                            <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                              💳 Purchased Add-On
                            </span>
                          )}
                          {q.source === 'RENEWAL' && (
                            <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-indigo-200">
                              🔄 Subscription Renewal
                            </span>
                          )}
                          {q.source === 'SCAN_USAGE' && (
                            <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                              ⚡ Scan Usage
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">{q.reason}</div>
                        {q.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{q.notes}</div>}
                      </td>

                      {/* Payment / Cost */}
                      <td className="px-4 py-3.5">
                        {q.amountPaid > 0 ? (
                          <div>
                            <span className="font-black text-slate-900">₹{q.amountPaid}</span>
                            {q.paymentId && (
                              <div className="font-mono text-[10px] text-slate-400">{q.paymentId}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">Free / Incl.</span>
                        )}
                      </td>

                      {/* Performed By */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-600 font-semibold">
                        {q.performedBy || 'System'}
                      </td>

                      {/* Balance After */}
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900 text-xs">
                        {q.balanceAfter} {q.category === 'CALL' ? 'Calls' : 'SMS'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. ALL USER PAYMENTS & ORDERS HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#1D56A5]" />
            <span>Complete Customer Payment Ledger ({payments.length} Transactions)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Payment ID</th>
                <th className="px-5 py-3.5">Order Number</th>
                <th className="px-5 py-3.5">Activated QR Kit(s)</th>
                <th className="px-5 py-3.5">Purpose & Quantity</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400 text-xs">
                    No payment transactions recorded for this user yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const matchingOrder = orders.find(o => o.orderNumber === p.orderId || o.razorpayOrderId === p.orderId);
                  const qty = matchingOrder?.quantity || p.metadata?.quantity || 1;
                  const unitPrice = matchingOrder?.unitPrice || Math.round(p.amount / qty);

                  // Find which active QR Kits are associated with this payment / order
                  const linkedActiveKits = kits.filter(k => 
                    !k.isPendingOrder && (
                      k.order?.orderNumber === p.orderId ||
                      k.order?._id === matchingOrder?._id ||
                      (k.payments && k.payments.some(kp => kp._id === p._id || kp.paymentId === p.paymentId)) ||
                      (matchingOrder?.allocatedQRIds && k.copies?.some(c => matchingOrder.allocatedQRIds.some(aqId => (aqId?._id || aqId)?.toString() === (c._id || c)?.toString()))) ||
                      (matchingOrder?.claimedProductId === k.productId)
                    )
                  );

                  return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{p.paymentId}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{p.orderId}</td>
                    <td className="px-5 py-3.5">
                      {linkedActiveKits.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {linkedActiveKits.map(k => (
                            <span key={k.productId} className="bg-blue-50 text-[#1D56A5] font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center space-x-1">
                              <span>🏷️ {k.productId}</span>
                              {k.copies && k.copies.length > 0 && (
                                <span className="text-[9px] text-slate-400 font-normal">({k.copies.map(c => c.copyCode).join(', ')})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : matchingOrder && matchingOrder.productType === 'PHYSICAL' && !matchingOrder.isClaimed ? (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          📦 Pending Delivery & Scan
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {p.purpose}
                        </span>
                        {qty > 1 && (
                          <span className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                            📦 {qty} Kits
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-slate-900 text-sm">₹{p.amount}</div>
                      {qty > 1 && (
                        <div className="font-mono text-[10px] text-slate-500 font-medium">
                          ₹{unitPrice} × {qty} = ₹{p.amount} ({qty} Kits)
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        p.status === 'SUCCESSFUL'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        ● {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-500 font-mono">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. ADD QUOTA / TOP-UP MODAL */}
      {addQuotaModalOpen && selectedKitForQuota && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  <span>Add / Top-Up Quota Balance</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Kit: {selectedKitForQuota.productId}</p>
              </div>
              <button
                onClick={() => setAddQuotaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addQuotaSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                ✓ {addQuotaSuccess}
              </div>
            )}

            <form onSubmit={handleAddQuotaSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Add Extra Calls
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addQuotaForm.calls}
                    onChange={(e) => setAddQuotaForm({ ...addQuotaForm, calls: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Add Extra SMS
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addQuotaForm.messages}
                    onChange={(e) => setAddQuotaForm({ ...addQuotaForm, messages: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Extend Validity (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={addQuotaForm.validityDays}
                  onChange={(e) => setAddQuotaForm({ ...addQuotaForm, validityDays: e.target.value })}
                  placeholder="0 (leave 0 if only adding quota)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Source / Type *
                </label>
                <select
                  value={addQuotaForm.source}
                  onChange={(e) => setAddQuotaForm({ ...addQuotaForm, source: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="ADMIN_GRANT">👑 Admin Complimentary Gift / Top-Up (Free)</option>
                  <option value="PURCHASE_ADDON">💳 Add-On Purchase (Offline / Cash Top-Up)</option>
                  <option value="ADMIN_ADJUSTMENT">⚙️ Admin Correction / Adjustment</option>
                </select>
              </div>

              {addQuotaForm.source === 'PURCHASE_ADDON' && (
                <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Amount Collected (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addQuotaForm.amountPaid}
                      onChange={(e) => setAddQuotaForm({ ...addQuotaForm, amountPaid: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payment / Cash Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CASH-101 / UPI"
                      value={addQuotaForm.paymentId}
                      onChange={(e) => setAddQuotaForm({ ...addQuotaForm, paymentId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  value={addQuotaForm.reason}
                  onChange={(e) => setAddQuotaForm({ ...addQuotaForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddQuotaModalOpen(false)}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingQuota}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {addingQuota ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Credit Quota Balance</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. RENEWAL MODAL */}
      {renewModalOpen && selectedKitToRenew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-[#1D56A5]" />
                  <span>Renew QR Subscription</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Kit: {selectedKitToRenew.productId}</p>
              </div>
              <button
                onClick={() => setRenewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renewSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                ✓ {renewSuccess}
              </div>
            )}

            <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Extension Days *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={renewForm.validityDays}
                  onChange={(e) => setRenewForm({ ...renewForm, validityDays: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bonus Calls
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={renewForm.bonusCalls}
                    onChange={(e) => setRenewForm({ ...renewForm, bonusCalls: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bonus SMS
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={renewForm.bonusMessages}
                    onChange={(e) => setRenewForm({ ...renewForm, bonusMessages: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Renewal Payment Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={renewForm.paymentAmount}
                  onChange={(e) => setRenewForm({ ...renewForm, paymentAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Renewal Reason / Notes
                </label>
                <input
                  type="text"
                  value={renewForm.reason}
                  onChange={(e) => setRenewForm({ ...renewForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRenewModalOpen(false)}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewing}
                  className="w-2/3 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {renewing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm & Renew Kit</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. DEEP-DIVE QR & CUSTOMER INSPECTION MODAL */}
      {viewingKitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in zoom-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-2xl my-6 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E9DFEE] text-[#1D56A5] flex items-center justify-center font-black flex-shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-mono font-black text-lg text-slate-900 leading-tight">
                      {viewingKitModal.productId}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      viewingKitModal.qrType === 'DIGITAL'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {viewingKitModal.qrType === 'DIGITAL' ? '💻 DIGITAL PASS' : '📦 PHYSICAL STICKER KIT'}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      viewingKitModal.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      ● {viewingKitModal.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Customer: {userData.name} (📱 {userData.phone})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingKitModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Visual & Direct Scan Link */}
            {viewingKitModal.primaryPublicToken && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
                  <SafeDriveQRCode
                    value={`${PUBLIC_SCAN_BASE}/${viewingKitModal.primaryPublicToken}`}
                    size={110}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900">
                    Live Public Incident Scan Link
                  </div>
                  <div className="font-mono text-slate-500 text-[11px] break-all">
                    {`${PUBLIC_SCAN_BASE}/${viewingKitModal.primaryPublicToken}`}
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <a
                      href={`${PUBLIC_SCAN_BASE}/${viewingKitModal.primaryPublicToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center space-x-1 shadow-2xs text-[11px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Scan Page ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Registered Vehicle & Contacts */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Protected Vehicle & Emergency Contacts
              </span>
              {viewingKitModal.vehicle ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Plate Number</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {viewingKitModal.vehicle.vehicleNumber}
                    </div>
                    <div className="text-slate-600 mt-1 font-bold">
                      {viewingKitModal.vehicle.vehicleBrand} {viewingKitModal.vehicle.vehicleName}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Emergency Contacts</div>
                    {viewingKitModal.vehicle.emergencyContacts && viewingKitModal.vehicle.emergencyContacts.length > 0 ? (
                      <div className="space-y-1">
                        {viewingKitModal.vehicle.emergencyContacts.map((c, i) => (
                          <div key={i} className="text-slate-800 font-medium">
                            <strong>{c.name}:</strong> 📱 {c.number}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">No emergency contacts saved</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  📦 <strong>Awaiting Registration:</strong> Physical or digital kit purchased. Once scanned with customer OTP, vehicle and emergency contacts will bind here.
                </div>
              )}
            </div>

            {/* Quota Balances & Usage */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Calling & SMS Balance
              </span>
              {viewingKitModal.wallet ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/50">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Calls Left</span>
                    <span className="font-mono font-black text-emerald-700 text-lg">
                      {viewingKitModal.wallet.callBalance}
                    </span>
                  </div>

                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/50">
                    <span className="text-[10px] font-bold text-[#1D56A5] uppercase block">SMS Left</span>
                    <span className="font-mono font-black text-[#1D56A5] text-lg">
                      {viewingKitModal.wallet.messageBalance}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Calls Used</span>
                    <span className="font-mono font-black text-slate-800 text-lg">
                      {viewingKitModal.wallet.totalCallsUsed || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">SMS Used</span>
                    <span className="font-mono font-black text-slate-800 text-lg">
                      {viewingKitModal.wallet.totalMessagesUsed || 0}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Standard 10 Calls & 20 SMS quota active upon first scan registration.
                </div>
              )}
            </div>

            {/* Add-Ons & Top-Ups History on this Kit */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Add-On Booster Packages on this Kit
              </span>
              {viewingKitModal.addons && viewingKitModal.addons.length > 0 ? (
                <div className="space-y-1.5">
                  {viewingKitModal.addons.map((a, i) => (
                    <div
                      key={a._id || i}
                      className="bg-purple-50/60 border border-purple-200/60 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-purple-950">
                          {a.packageName || a.reason}
                        </div>
                        <div className="text-[10px] text-purple-700 font-mono">
                          +{a.quantity} {a.category} ({a.source}) • {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-black text-purple-900 font-mono">
                        {a.amountPaid > 0 ? `₹${a.amountPaid}` : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic">
                  No additional booster add-ons purchased on this kit yet.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingKitModal(null)}
                className="w-full bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-[#1D56A5]/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER EDIT USER MODAL */}
      {editUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D56A5] flex items-center justify-center font-bold text-sm">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Admin Edit User Profile</h3>
                  <p className="text-[11px] text-slate-500">Update account details, role, and status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    value={editUserForm.whatsappNumber}
                    onChange={(e) => setEditUserForm({ ...editUserForm, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Delivery / Residential Address</label>
                <textarea
                  rows="2"
                  value={editUserForm.address}
                  onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="USER">USER (Customer)</option>
                    <option value="ADMIN">ADMIN (Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Account Status</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUserEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1D56A5] hover:bg-[#164382] rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {savingUserEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>💾 Save User Profile</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
