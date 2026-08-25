import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SafeDriveQRCode from '../components/SafeDriveQRCode';
import {
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Car,
  User,
  Phone,
  MessageSquare,
  Calendar,
  Layers2,
  Tag,
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Gift,
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function QRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  const [qr, setQr] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [siblingQRs, setSiblingQRs] = useState([]);
  const [quotaLedger, setQuotaLedger] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Master Edit Modal State
  const [showMasterEditModal, setShowMasterEditModal] = useState(false);
  const [savingMaster, setSavingMaster] = useState(false);
  const [editForm, setEditForm] = useState({
    renewalAmount: 199,
    status: 'ACTIVE',
    qrFor: 'Car',
    qrType: 'PHYSICAL',
    validityDays: 365,
    expiryDate: '',
    initialCalls: 10,
    initialMessages: 20,
    vehicleBrand: '',
    vehicleName: '',
    vehicleNumber: '',
    emergencyContacts: [{ name: '', number: '', relation: 'Family' }]
  });

  const openMasterEdit = () => {
    if (!qr) return;
    const v = qr.vehicleId;
    setEditForm({
      renewalAmount: qr.renewalAmount || 199,
      status: qr.status || 'ACTIVE',
      qrFor: qr.qrFor || 'Car',
      qrType: qr.qrType || 'PHYSICAL',
      validityDays: qr.validityDays || 365,
      expiryDate: qr.expiryDate ? new Date(qr.expiryDate).toISOString().slice(0, 10) : '',
      initialCalls: qr.initialCalls || 10,
      initialMessages: qr.initialMessages || 20,
      vehicleBrand: v?.vehicleBrand || '',
      vehicleName: v?.vehicleName || '',
      vehicleNumber: v?.vehicleNumber || '',
      emergencyContacts: v?.emergencyContacts && v.emergencyContacts.length > 0
        ? v.emergencyContacts.map(c => ({ name: c.name || '', number: c.number || '', relation: c.relation || 'Emergency Contact' }))
        : [{ name: '', number: '', relation: 'Family' }, { name: '', number: '', relation: 'Emergency' }]
    });
    setShowMasterEditModal(true);
  };

  const handleSaveMasterEdit = async (e) => {
    e.preventDefault();
    setSavingMaster(true);
    try {
      const res = await axios.put(`${API_BASE}/admin/qr/${qr._id}/details`, editForm, authHeader);
      if (res.data.success) {
        setShowMasterEditModal(false);
        fetchQR();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingMaster(false);
    }
  };

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/${id}`, authHeader);
      if (res.data.success) {
        setQr(res.data.qr);
        setWallet(res.data.wallet);
        setSiblingQRs(res.data.siblingQRs || []);
        setQuotaLedger(res.data.quotaLedger || []);
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load QR code details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQR();
  }, [id]);

  // Toggle QR Status (Active / Suspended)
  const handleToggleStatus = async () => {
    if (!qr) return;
    const nextStatus = qr.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to change status to ${nextStatus}?`)) return;
    try {
      const res = await axios.put(`${API_BASE}/admin/qr/${qr._id}/status`, { status: nextStatus }, authHeader);
      if (res.data.success) {
        setQr({ ...qr, status: nextStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const copyPublicUrl = () => {
    if (!qr) return;
    const url = `${PUBLIC_SCAN_BASE}/${qr.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1D56A5] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading QR Code record...</p>
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center my-10 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-[#E94E1A] mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-1">Record Not Found</h2>
        <p className="text-xs text-slate-500 mb-5">{error || 'Unable to retrieve QR data'}</p>
        <button
          onClick={() => navigate('/qr')}
          className="inline-flex items-center space-x-2 bg-[#1D56A5] text-white text-xs font-bold px-4 py-2.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </button>
      </div>
    );
  }

  const isAssigned = !!qr.userId;
  const vehicle = qr.vehicleId;
  const owner = qr.userId;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP BREADCRUMB & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Link to="/qr" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition">
                QR Inventory
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-[#1D56A5] font-mono">{qr.copyCode}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5 mt-0.5">
              <span>{qr.copyCode}</span>
              {/* Status Badge */}
              {qr.status === 'ACTIVE' && (
                <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30 text-xs font-bold px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#259A3A] animate-pulse"></span>
                  <span>ACTIVE</span>
                </span>
              )}
              {qr.status === 'IN STOCK' && (
                <span className="inline-flex items-center space-x-1.5 bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/30 text-xs font-bold px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D56A5]"></span>
                  <span>IN STOCK</span>
                </span>
              )}
              {qr.status === 'SOLD' && (
                <span className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span>SOLD</span>
                </span>
              )}
              {qr.status === 'EXPIRED' && (
                <span className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>EXPIRED</span>
                </span>
              )}
              {qr.status === 'SUSPENDED' && (
                <span className="inline-flex items-center space-x-1.5 bg-red-50 text-[#E94E1A] border border-[#E94E1A]/30 text-xs font-bold px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E94E1A]"></span>
                  <span>SUSPENDED</span>
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={openMasterEdit}
            className="flex items-center space-x-1.5 bg-[#1D56A5] hover:bg-[#164382] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <span>✏️ Master Edit Details</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <Printer className="w-4 h-4 text-[#1D56A5]" />
            <span>Print Sticker</span>
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center space-x-1.5 font-bold px-4 py-2 rounded-xl text-xs border transition shadow-2xs ${
              qr.status === 'SUSPENDED'
                ? 'bg-[#259A3A] hover:bg-[#1f8231] text-white border-[#259A3A]'
                : 'bg-white hover:bg-red-50 text-[#E94E1A] border-[#E94E1A]/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{qr.status === 'SUSPENDED' ? 'Activate QR' : 'Suspend QR'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DETAILS VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BRANDED QR CARD (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center">
            {/* Branded Header */}
            <div className="text-[10px] font-black tracking-widest text-[#1D56A5] uppercase mb-1">
              Safe Drive Vehicle Safety
            </div>
            <div className="text-xl font-black text-slate-900 font-mono mb-1">
              {qr.copyCode}
            </div>
            <div className="text-xs font-semibold text-slate-500 mb-4">
              Type: <strong className="text-slate-800">{qr.qrType || 'Standard'}</strong>
            </div>

            {/* QR SVG Preview with Brand Blue center badge */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner mb-4 flex items-center justify-center">
              <SafeDriveQRCode value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`} size={180} />
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 mb-4">
              SCAN TO CONTACT OWNER
            </div>

            {/* Public Link Copy Button */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={copyPublicUrl}
                className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 text-xs transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#259A3A]" />
                    <span className="text-[#259A3A]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#1D56A5]" />
                    <span>Copy Public Scan Link</span>
                  </>
                )}
              </button>

              <a
                href={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-1.5 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                <span>Open Public Scan Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tag & Batch Meta Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Batch & Tracking Details</h3>
            
            <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Batch Tag</span>
              <span className="bg-[#E9DFEE]/70 text-[#1D56A5] border border-[#1D56A5]/20 font-mono font-bold px-2 py-0.5 rounded">
                {qr.batchId}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Product Set ID</span>
              <span className="font-mono font-bold text-slate-800">{qr.productId}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Public Token</span>
              <span className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]">{qr.publicToken}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5">
              <span className="text-slate-500">Generated On</span>
              <span className="font-medium text-slate-800">
                {new Date(qr.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VEHICLE, QUOTA, RENEWAL & METRICS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. REGISTERED OWNER & VEHICLE DETAILS */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <Car className="w-4 h-4 text-[#1D56A5]" />
              <span>Assigned Vehicle & Owner Information</span>
            </h2>

            {isAssigned ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Owner Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registered Owner</div>
                    <div className="text-base font-bold text-slate-900">{owner?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#259A3A]" />
                      <span>{owner?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Vehicle Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Protected Vehicle</div>
                    <div className="text-base font-bold text-slate-900">
                      {vehicle?.vehicleBrand} {vehicle?.vehicleName}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#1D56A5] mt-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                      {vehicle?.vehicleNumber}
                    </div>
                  </div>
                </div>

                {/* Activated By Details */}
                {(qr.activatedByName || qr.activatedByPhone || qr.activationPhone) && (
                  <div className="p-3.5 bg-blue-50/70 border border-[#1D56A5]/25 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">👤</span>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Activated By (Recipient)</div>
                        <strong className="text-slate-900">{qr.activatedByName || 'Kit Recipient'}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Activation Mobile</div>
                      <span className="font-mono font-bold text-[#1D56A5]">{qr.activatedByPhone || qr.activationPhone}</span>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts if registered */}
                {vehicle?.emergencyContacts && vehicle.emergencyContacts.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-700 mb-2">Emergency Contacts:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vehicle.emergencyContacts.map((c, i) => (
                        <div key={i} className="p-3 bg-[#E9DFEE]/40 border border-[#1D56A5]/20 rounded-xl text-xs flex justify-between">
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span className="font-mono text-slate-600">{c.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-700">Unregistered Sticker (In Stock)</div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  This QR code has not yet been bound to any vehicle. It will automatically register upon first physical scan.
                </p>
              </div>
            )}
          </div>

          {/* 2. CONFIGURED STARTER QUOTA & EXPIRY */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#1D56A5]" />
              <span>Configured Quota & Lifecycle</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3.5 bg-emerald-50/60 border border-[#259A3A]/25 rounded-2xl text-center">
                <div className="text-[10px] font-bold uppercase text-[#259A3A]">Initial Calls</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{qr.initialCalls || 10}</div>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-[#1D56A5]/25 rounded-2xl text-center">
                <div className="text-[10px] font-bold uppercase text-[#1D56A5]">Initial SMS</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{qr.initialMessages || 20}</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Validity (Days)</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{qr.validityDays || 365}</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Annual Renewal</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">₹{qr.renewalAmount || 199}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 gap-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Activation Date:</span>
                <strong className="text-slate-900">
                  {qr.activationDate ? new Date(qr.activationDate).toLocaleDateString('en-GB') : 'Not Yet Activated'}
                </strong>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Expiry Date:</span>
                <strong className="text-slate-900">
                  {qr.expiryDate ? new Date(qr.expiryDate).toLocaleDateString('en-GB') : '—'}
                </strong>
              </div>
            </div>
          </div>



          {/* 4. QUOTA LEDGER & ADD-ON TOP-UP HISTORY */}
          {isAssigned && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs overflow-hidden">
              <div className="mb-4 flex items-center space-x-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Quota Breakdown & Add-On History ({quotaLedger.length} Records)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Change</th>
                      <th className="py-2.5 px-3">Source & Reason</th>
                      <th className="py-2.5 px-3">Cost / Payment</th>
                      <th className="py-2.5 px-3">By</th>
                      <th className="py-2.5 px-3">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {quotaLedger.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400 text-xs">
                          No quota top-ups or transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      quotaLedger.map((q) => {
                        const isCredit = q.type === 'CREDIT';
                        return (
                          <tr key={q._id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              {new Date(q.createdAt).toLocaleDateString('en-GB')}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                                  isCredit
                                    ? 'bg-emerald-50 text-[#259A3A] border-[#259A3A]/30'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                {isCredit ? `+${q.quantity}` : `-${q.quantity}`} {q.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-1 mb-0.5">
                                {q.source === 'INITIAL_FREE' && (
                                  <span className="bg-blue-50 text-[#1D56A5] font-bold text-[9px] px-1.5 py-0.5 rounded border border-blue-200">
                                    🎁 Free Initial
                                  </span>
                                )}
                                {q.source === 'ADMIN_GRANT' && (
                                  <span className="bg-purple-50 text-purple-700 font-bold text-[9px] px-1.5 py-0.5 rounded border border-purple-200">
                                    👑 Admin Gift
                                  </span>
                                )}
                                {q.source === 'PURCHASE_ADDON' && (
                                  <span className="bg-amber-50 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded border border-amber-200">
                                    💳 Add-On Purchase
                                  </span>
                                )}
                                {q.source === 'RENEWAL' && (
                                  <span className="bg-indigo-50 text-indigo-700 font-bold text-[9px] px-1.5 py-0.5 rounded border border-indigo-200">
                                    🔄 Renewal
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600">{q.reason}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {q.amountPaid > 0 ? (
                                <span className="font-black text-slate-900 font-mono">₹{q.amountPaid}</span>
                              ) : (
                                <span className="text-slate-400 font-bold text-[10px]">Free</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              {q.performedBy || 'System'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
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
          )}

        </div>
      </div>

      {/* MASTER EDIT MODAL */}
      {showMasterEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D56A5] flex items-center justify-center font-bold text-sm">
                  ✏️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Admin Master Edit: {qr.productId}</h3>
                  <p className="text-[11px] text-slate-500">Update renewal price, category, validity, quotas, and vehicle details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMasterEditModal(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMasterEdit} className="space-y-4">
              {/* Product Kit Status & Renewal Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Annual Renewal Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.renewalAmount}
                    onChange={(e) => setEditForm({ ...editForm, renewalAmount: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-[#1D56A5] font-mono"
                    placeholder="199"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Customer will pay this fee on renewal</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kit Status *
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE (Active Protection)</option>
                    <option value="IN STOCK">IN STOCK (Unassigned)</option>
                    <option value="SOLD">SOLD (Claimed / Ready to Activate)</option>
                    <option value="EXPIRED">EXPIRED (Needs Renewal)</option>
                    <option value="SUSPENDED">SUSPENDED (Blocked by Admin)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Category & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dynamic Category (qrFor) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.qrFor}
                    onChange={(e) => setEditForm({ ...editForm, qrFor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    placeholder="e.g. Car, Bike, Scooter, Luggage, Laptop Bag"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Format (Physical vs Digital)
                  </label>
                  <select
                    value={editForm.qrType}
                    onChange={(e) => setEditForm({ ...editForm, qrType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="PHYSICAL">PHYSICAL (Printed Stickers)</option>
                    <option value="DIGITAL">DIGITAL (E-Pass)</option>
                  </select>
                </div>
              </div>

              {/* Validity & Expiry Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.validityDays}
                    onChange={(e) => setEditForm({ ...editForm, validityDays: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date Override
                  </label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Vehicle Master Edit */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-xs text-slate-900 uppercase tracking-wider">
                  🚗 Vehicle / Asset Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brand / Make</label>
                    <input
                      type="text"
                      value={editForm.vehicleBrand}
                      onChange={(e) => setEditForm({ ...editForm, vehicleBrand: e.target.value })}
                      placeholder="e.g. Hyundai, Honda, Apple"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Model / Name</label>
                    <input
                      type="text"
                      value={editForm.vehicleName}
                      onChange={(e) => setEditForm({ ...editForm, vehicleName: e.target.value })}
                      placeholder="e.g. Creta, Activa, Bag"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Plate / Tag ID</label>
                    <input
                      type="text"
                      value={editForm.vehicleNumber}
                      onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. UP32AB1234"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1D56A5] font-mono"
                    />
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Emergency Contacts</span>
                    <button
                      type="button"
                      onClick={() => setEditForm({
                        ...editForm,
                        emergencyContacts: [...editForm.emergencyContacts, { name: '', number: '', relation: 'Family' }]
                      })}
                      className="text-[10px] font-bold text-[#1D56A5] hover:underline"
                    >
                      + Add Contact
                    </button>
                  </div>
                  {editForm.emergencyContacts.map((c, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...editForm.emergencyContacts];
                          updated[idx].name = e.target.value;
                          setEditForm({ ...editForm, emergencyContacts: updated });
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={c.number}
                        onChange={(e) => {
                          const updated = [...editForm.emergencyContacts];
                          updated[idx].number = e.target.value;
                          setEditForm({ ...editForm, emergencyContacts: updated });
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                      />
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          placeholder="Relation"
                          value={c.relation}
                          onChange={(e) => {
                            const updated = [...editForm.emergencyContacts];
                            updated[idx].relation = e.target.value;
                            setEditForm({ ...editForm, emergencyContacts: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                        {editForm.emergencyContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editForm.emergencyContacts.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, emergencyContacts: updated });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMasterEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMaster}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1D56A5] hover:bg-[#164382] rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {savingMaster ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>💾 Save Master Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
