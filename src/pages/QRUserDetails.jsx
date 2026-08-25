import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UserCheck,
  ArrowLeft,
  RefreshCw,
  Phone,
  MessageSquare,
  PhoneCall,
  Car,
  QrCode,
  ShieldCheck,
  Calendar,
  Gift,
  PlusCircle,
  Clock,
  ExternalLink,
  MapPin,
  X,
  CreditCard,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  User
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function QRUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Modals
  const [addQuotaModalOpen, setAddQuotaModalOpen] = useState(false);
  const [selectedKitForQuota, setSelectedKitForQuota] = useState(null);
  const [addQuotaForm, setAddQuotaForm] = useState({ calls: 10, messages: 20, reason: 'Admin Top-Up' });
  const [quotaSubmitting, setQuotaSubmitting] = useState(false);
  const [quotaSuccess, setQuotaSuccess] = useState('');

  // Edit Vehicle & Contacts Modal
  const [editVehicleModalOpen, setEditVehicleModalOpen] = useState(false);
  const [editVehicleForm, setEditVehicleForm] = useState({
    vehicleId: '',
    vehicleBrand: '',
    vehicleName: '',
    vehicleNumber: '',
    contact1Name: '',
    contact1Phone: '',
    contact2Name: '',
    contact2Phone: ''
  });
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);

  // Edit Driver Profile & Address Modal
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    userId: '',
    name: '',
    phone: '',
    whatsappNumber: '',
    gender: 'MALE',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const fetchQRUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/admin/qr-users/${id}`, authHeader);
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message || 'Failed to load QR user details');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error loading QR user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRUserDetails();
  }, [id]);

  const handleOpenQuotaModal = (kit) => {
    setSelectedKitForQuota(kit);
    setAddQuotaForm({ calls: 10, messages: 20, reason: 'Admin Direct Top-Up' });
    setQuotaSuccess('');
    setAddQuotaModalOpen(true);
  };

  const handleAddQuotaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKitForQuota) return;
    setQuotaSubmitting(true);
    setQuotaSuccess('');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/users/add-quota`,
        {
          qrId: selectedKitForQuota.primaryQRId,
          calls: Number(addQuotaForm.calls) || 0,
          messages: Number(addQuotaForm.messages) || 0,
          source: 'ADMIN_GRANT',
          reason: addQuotaForm.reason || 'Admin Gift Quota'
        },
        authHeader
      );
      if (res.data.success) {
        setQuotaSuccess('✓ Quota added successfully!');
        setTimeout(() => {
          setAddQuotaModalOpen(false);
          fetchQRUserDetails();
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add quota');
    } finally {
      setQuotaSubmitting(false);
    }
  };

  const handleOpenEditVehicle = (veh) => {
    if (!veh) return;
    setEditVehicleForm({
      vehicleId: veh._id,
      vehicleBrand: veh.vehicleBrand || '',
      vehicleName: veh.vehicleName || '',
      vehicleNumber: veh.vehicleNumber || '',
      contact1Name: veh.emergencyContacts?.[0]?.name || '',
      contact1Phone: veh.emergencyContacts?.[0]?.number || '',
      contact2Name: veh.emergencyContacts?.[1]?.name || '',
      contact2Phone: veh.emergencyContacts?.[1]?.number || ''
    });
    setEditVehicleModalOpen(true);
  };

  const handleEditVehicleSubmit = async (e) => {
    e.preventDefault();
    setVehicleSubmitting(true);
    try {
      const res = await axios.put(
        `${API_BASE}/admin/vehicles/${editVehicleForm.vehicleId}`,
        {
          vehicleBrand: editVehicleForm.vehicleBrand,
          vehicleName: editVehicleForm.vehicleName,
          vehicleNumber: editVehicleForm.vehicleNumber,
          emergencyContacts: [
            { name: editVehicleForm.contact1Name, number: editVehicleForm.contact1Phone },
            { name: editVehicleForm.contact2Name, number: editVehicleForm.contact2Phone }
          ]
        },
        authHeader
      );
      if (res.data.success) {
        setEditVehicleModalOpen(false);
        fetchQRUserDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleOpenEditProfile = (u) => {
    if (!u) return;
    setEditProfileForm({
      userId: u._id,
      name: u.name || '',
      phone: u.phone || '',
      whatsappNumber: u.whatsappNumber || '',
      gender: u.gender || 'MALE',
      address: u.address || '',
      city: u.city || '',
      state: u.state || '',
      pincode: u.pincode || '',
      landmark: u.landmark || ''
    });
    setEditProfileModalOpen(true);
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      const targetId = editProfileForm.userId || id;
      const res = await axios.put(
        `${API_BASE}/admin/users/${targetId}`,
        {
          name: editProfileForm.name,
          phone: editProfileForm.phone,
          whatsappNumber: editProfileForm.whatsappNumber,
          gender: editProfileForm.gender,
          address: editProfileForm.address,
          city: editProfileForm.city,
          state: editProfileForm.state,
          pincode: editProfileForm.pincode,
          landmark: editProfileForm.landmark
        },
        authHeader
      );
      if (res.data.success) {
        setEditProfileModalOpen(false);
        fetchQRUserDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#259A3A] animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading QR User Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">QR User Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'No active QR user found for this identifier.'}</p>
        <Link
          to="/qr-users"
          className="inline-flex items-center space-x-2 bg-[#259A3A] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to QR Users</span>
        </Link>
      </div>
    );
  }

  const { qrUser, kits = [], vehicles = [], payments = [], quotaLedger = [] } = data;
  const primaryKit = kits[0] || {};
  const primaryVehicle = primaryKit.vehicle || vehicles[0] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{qrUser.name || 'Vehicle Owner'}</h1>
              <span className="bg-emerald-50 text-[#259A3A] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                🚗 QR VEHICLE HOLDER
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              📱 {qrUser.phone} • Registered Via QR Scan Activation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {primaryKit.primaryPublicToken && (
            <a
              href={`${PUBLIC_SCAN_BASE}/scan/${primaryKit.primaryPublicToken}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D56A5] border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Public Scan Page</span>
            </a>
          )}
          <button
            onClick={fetchQRUserDetails}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-[#259A3A]" />
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calling Quota Balance</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center space-x-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            <span>{primaryKit.wallet?.callBalance ?? 10} Calls</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Used: {primaryKit.wallet?.totalCallsUsed ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SMS Alerts Balance</div>
          <div className="text-2xl font-black text-purple-700 mt-1 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>{primaryKit.wallet?.messageBalance ?? 20} SMS</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Used: {primaryKit.wallet?.totalMessagesUsed ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Expiry</div>
          <div className="text-lg font-black text-slate-900 mt-1 font-mono">
            {primaryKit.expiryDate ? new Date(primaryKit.expiryDate).toLocaleDateString() : 'Active (1 Year)'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Renewal: ₹{primaryKit.renewalAmount || 199}/yr
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#1D56A5]">Purchased By (Buyer)</div>
          <div className="text-sm font-black text-slate-900 mt-1 truncate">
            {primaryKit.buyer?.name || 'Direct / Store'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {primaryKit.buyer?.phone || 'Self'}
          </div>
        </div>
      </div>

      {/* 3. MAIN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Driver Profile & Vehicle Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver Profile & Full Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#259A3A]" />
                  <span>Driver Personal Profile & Address</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Demographic, contact, and address verification data</p>
              </div>

              <button
                onClick={() => handleOpenEditProfile(qrUser)}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile & Address</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{qrUser.name || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile Phone</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{qrUser.phone || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Gender</span>
                <span className="font-bold text-slate-800 text-xs uppercase">{qrUser.gender || 'NOT SPECIFIED'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">WhatsApp Number</span>
                <span className="font-mono text-slate-700 text-xs">{qrUser.whatsappNumber || qrUser.phone || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Full Address</span>
                <span className="font-medium text-slate-700 text-xs flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>
                    {qrUser.address || 'N/A'}
                    {qrUser.landmark ? `, Landmark: ${qrUser.landmark}` : ''}
                    {qrUser.city ? `, ${qrUser.city}` : ''}
                    {qrUser.state ? `, ${qrUser.state}` : ''}
                    {qrUser.pincode ? ` - ${qrUser.pincode}` : ''}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Protected Vehicle Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                  <Car className="w-5 h-5 text-[#259A3A]" />
                  <span>Protected Vehicle Details</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Vehicle bound to this QR sticker set</p>
              </div>

              {primaryVehicle && (
                <button
                  onClick={() => handleOpenEditVehicle(primaryVehicle)}
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Vehicle & Contacts</span>
                </button>
              )}
            </div>

            {primaryVehicle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">License Plate</span>
                    <span className="font-mono font-black text-slate-900 text-base">{primaryVehicle.vehicleNumber}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Make & Model</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {primaryVehicle.vehicleBrand} {primaryVehicle.vehicleName}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Product Category (Locked)</span>
                    </span>
                    <span className="font-black text-[#1D56A5] text-sm uppercase flex items-center space-x-1">
                      <span>{primaryKit.qrFor || 'Car'}</span>
                      <span className="text-[9px] text-amber-700 font-normal bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        Immutable
                      </span>
                    </span>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    🚨 Emergency Contacts Configured:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {primaryVehicle.emergencyContacts?.map((c, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-amber-200/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Contact #{i + 1}: {c.name}</div>
                          <div className="font-mono text-slate-600 text-xs mt-0.5">{c.number}</div>
                        </div>
                        <a
                          href={`tel:${c.number}`}
                          className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                          title="Call Contact"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs">
                No vehicle currently registered with this QR kit.
              </div>
            )}
          </div>

          {/* QR Stickers Set */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-[#1D56A5]" />
                  <span>Assigned QR Kit ({primaryKit.productId})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Physical sticker copies in this kit set</p>
              </div>

              <button
                onClick={() => handleOpenQuotaModal(primaryKit)}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Quota / Top-Up</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryKit.copies?.map((c) => (
                <div
                  key={c.copyCode}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {c.copyCode}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Batch: {primaryKit.batchId}</div>
                  </div>

                  <a
                    href={`${PUBLIC_SCAN_BASE}/scan/${c.publicToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white text-[#1D56A5] rounded-lg border border-slate-200 hover:bg-blue-50 transition"
                    title="Test Public Scan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Buyer & Quota Quick Actions */}
        <div className="space-y-6">
          {/* Buyer Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#1D56A5]" />
              <span>Original Order & Buyer</span>
            </h3>

            {primaryKit.buyer ? (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Buyer Name</span>
                  <Link
                    to={`/users/${primaryKit.buyer._id}`}
                    className="font-bold text-slate-900 text-sm hover:text-[#1D56A5] hover:underline"
                  >
                    {primaryKit.buyer.name}
                  </Link>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile & Email</span>
                  <div className="font-mono text-slate-700">{primaryKit.buyer.phone}</div>
                  <div className="font-mono text-slate-500 text-[11px]">{primaryKit.buyer.email}</div>
                </div>

                {primaryKit.orderNumber && (
                  <div className="pt-2 border-t border-blue-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Order Number</span>
                    <span className="font-mono font-bold text-slate-800">#{primaryKit.orderNumber}</span>
                  </div>
                )}

                <Link
                  to={`/users/${primaryKit.buyer._id}`}
                  className="inline-block font-bold text-[#1D56A5] hover:underline text-[11px] pt-1"
                >
                  View Buyer Orders & All Kits →
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-500 text-xs">
                Direct QR Activation
              </div>
            )}
          </div>

          {/* Direct Payments made by this QR User */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Payments by this QR User ({payments.length})</span>
            </h3>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400">
                No direct renewal or addon payments made by this driver yet. Future renewals from the user portal will record here.
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{p.purpose}</div>
                      <div className="font-mono text-[10px] text-slate-400">{p.paymentId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">₹{p.amount}</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. QUOTA ACTIVITY & AUDIT LEDGER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            <span>Quota Balance Ledger & Activity History ({quotaLedger.length} Records)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of initial credits, top-ups, scan calls/SMS usages, and renewal bonuses
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Source & Reason</th>
                <th className="px-4 py-3.5">Performed By</th>
                <th className="px-4 py-3.5">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {quotaLedger.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-400 text-xs">
                    No quota usage or ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                quotaLedger.map((q, idx) => {
                  const isCredit = q.type === 'CREDIT';
                  return (
                    <tr key={q._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString()} {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                            isCredit
                              ? 'bg-emerald-50 text-[#259A3A] border-[#259A3A]/30'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {isCredit ? `+${q.quantity}` : `-${q.quantity}`} {q.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{q.source}</div>
                        <div className="text-[11px] text-slate-500">{q.reason}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-semibold">{q.performedBy || 'System'}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
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

      {/* 5. MODAL: ADD QUOTA */}
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

            {quotaSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                {quotaSuccess}
              </div>
            )}

            <form onSubmit={handleAddQuotaSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Add Calls
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
                    Add SMS
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
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={addQuotaForm.reason}
                  onChange={(e) => setAddQuotaForm({ ...addQuotaForm, reason: e.target.value })}
                  placeholder="e.g. Complimentary top-up"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddQuotaModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quotaSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {quotaSubmitting ? 'Adding...' : 'Grant Quota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: EDIT VEHICLE & EMERGENCY CONTACTS */}
      {editVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                  <Car className="w-5 h-5 text-[#259A3A]" />
                  <span>Edit Vehicle & Emergency Contacts</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Plate: {editVehicleForm.vehicleNumber}</p>
              </div>
              <button
                onClick={() => setEditVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={editVehicleForm.vehicleBrand}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, vehicleBrand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Model / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editVehicleForm.vehicleName}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, vehicleName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  required
                  value={editVehicleForm.vehicleNumber}
                  onChange={(e) => setEditVehicleForm({ ...editVehicleForm, vehicleNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-black"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Emergency Contact 1:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Contact 1 Name"
                    value={editVehicleForm.contact1Name}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, contact1Name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Contact 1 Mobile Number"
                    value={editVehicleForm.contact1Phone}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, contact1Phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Emergency Contact 2:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Contact 2 Name"
                    value={editVehicleForm.contact2Name}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, contact2Name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Contact 2 Mobile Number"
                    value={editVehicleForm.contact2Phone}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, contact2Phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditVehicleModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vehicleSubmitting}
                  className="bg-[#259A3A] hover:bg-[#208432] text-white font-bold px-5 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {vehicleSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: EDIT DRIVER PROFILE & ADDRESS */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#259A3A]" />
                  <span>Edit Driver Profile & Address</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Mobile: {editProfileForm.phone}</p>
              </div>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={editProfileForm.gender}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="NOT_SPECIFIED">Not Specified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={editProfileForm.whatsappNumber}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address / House No.
                </label>
                <input
                  type="text"
                  required
                  value={editProfileForm.address}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                  placeholder="e.g. Flat 101, Green Heights"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.landmark}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, landmark: e.target.value })}
                    placeholder="Near City Hospital"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.city}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, city: e.target.value })}
                    placeholder="Lucknow"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.state}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })}
                    placeholder="Uttar Pradesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.pincode}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, pincode: e.target.value })}
                    placeholder="226001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="bg-[#259A3A] hover:bg-[#208432] text-white font-bold px-5 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {profileSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
