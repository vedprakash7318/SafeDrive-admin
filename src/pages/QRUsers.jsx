import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  UserCheck,
  RefreshCw,
  Search,
  Car,
  QrCode,
  Phone,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Eye,
  ExternalLink,
  ShoppingBag,
  Calendar,
  X,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function QRUsers() {
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  const [qrUsers, setQrUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected QR User Modal
  const [selectedKit, setSelectedKit] = useState(null);

  const fetchQRUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/qr-users`, authHeader);
      if (res.data.success) {
        setQrUsers(res.data.qrUsers || []);
      }
    } catch (err) {
      console.error('Error fetching QR users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRUsers();
  }, []);

  // Filtered QR Users
  const filteredUsers = qrUsers.filter((k) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (k.user?.name && k.user.name.toLowerCase().includes(term)) ||
      (k.user?.phone && k.user.phone.includes(term)) ||
      (k.vehicle?.vehicleNumber && k.vehicle.vehicleNumber.toLowerCase().includes(term)) ||
      (k.vehicle?.vehicleName && k.vehicle.vehicleName.toLowerCase().includes(term)) ||
      (k.productId && k.productId.toLowerCase().includes(term)) ||
      (k.buyer?.name && k.buyer.name.toLowerCase().includes(term)) ||
      (k.buyer?.phone && k.buyer.phone.includes(term));

    const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalQRUsers = qrUsers.length;
  const totalCallsAvailable = qrUsers.reduce((sum, k) => sum + (k.wallet?.callBalance || 0), 0);
  const totalSMSAvailable = qrUsers.reduce((sum, k) => sum + (k.wallet?.messageBalance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <UserCheck className="w-7 h-7 text-[#259A3A]" />
            <span>QR Users & Vehicle Owners</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered vehicle owners and drivers who activated their QR stickers. They can log in to manage emergency contacts, renew subscriptions, and purchase extra quota.
          </p>
        </div>

        <button
          onClick={fetchQRUsers}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs transition active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 text-[#259A3A] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh QR Users</span>
        </button>
      </div>

      {/* 2. SUMMARY KPI STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Activated QR Users</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalQRUsers}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#259A3A]">Live Vehicle Protections</div>
          <div className="text-2xl font-black text-[#259A3A] mt-1">{totalQRUsers}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#1D56A5]">Total Calling Quotas Active</div>
          <div className="text-2xl font-black text-[#1D56A5] mt-1">{totalCallsAvailable} Calls</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Total SMS Alerts Active</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{totalSMSAvailable} SMS</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Driver Name, Mobile, Vehicle Plate, QR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#259A3A] transition"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 border border-slate-200 w-full sm:w-auto justify-end">
          {['ALL', 'ACTIVE', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. QR USERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">QR User / Driver</th>
                <th className="px-4 py-3.5">Protected Vehicle</th>
                <th className="px-4 py-3.5">QR Kit / Stickers</th>
                <th className="px-4 py-3.5">Purchased By (Buyer)</th>
                <th className="px-4 py-3.5">Quota Balance</th>
                <th className="px-4 py-3.5">Validity & Expiry</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#259A3A]" />
                    <span>Loading QR users...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center text-slate-400 text-xs">
                    No activated QR users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((k) => (
                  <tr key={k.productId} className="hover:bg-slate-50/80 transition">
                    {/* QR User Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#259A3A] font-black flex items-center justify-center border border-emerald-200">
                          {k.user?.name ? k.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <Link
                            to={`/qr-users/${k.user?._id || k.productId}`}
                            className="font-bold text-slate-900 hover:text-[#259A3A] hover:underline"
                          >
                            {k.user?.name || 'Driver / Owner'}
                          </Link>
                          <div className="font-mono text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{k.user?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-4 py-3.5">
                      {k.vehicle ? (
                        <div>
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {k.vehicle.vehicleNumber}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {k.vehicle.vehicleBrand} {k.vehicle.vehicleName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unlinked Vehicle</span>
                      )}
                    </td>

                    {/* QR Kit */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-[#1D56A5] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                            🏷️ {k.productId}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold uppercase">
                            {k.qrFor}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 font-mono">
                          {k.copies?.map((c) => (
                            <span key={c.copyCode} className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                              {c.copyCode}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="px-4 py-3.5">
                      {k.buyer ? (
                        <div>
                          <Link
                            to={`/users/${k.buyer._id}`}
                            className="font-bold text-slate-800 hover:text-[#1D56A5] hover:underline"
                          >
                            {k.buyer.name}
                          </Link>
                          <div className="font-mono text-[10px] text-slate-400">{k.buyer.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Direct Activation</span>
                      )}
                    </td>

                    {/* Quota */}
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {k.wallet ? (
                        <div className="space-y-1">
                          <div className="text-emerald-700 font-bold flex items-center space-x-1">
                            <PhoneCall className="w-3 h-3" />
                            <span>{k.wallet.callBalance} Calls</span>
                          </div>
                          <div className="text-purple-700 font-semibold flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{k.wallet.messageBalance} SMS</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">10 Calls / 20 SMS</span>
                      )}
                    </td>

                    {/* Validity */}
                    <td className="px-4 py-3.5 text-xs font-mono">
                      {k.expiryDate ? (
                        <div>
                          <div className="font-bold text-slate-900">
                            {new Date(k.expiryDate).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Act: {new Date(k.activationDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        k.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-[#259A3A] border-[#259A3A]/30'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        ● {k.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/qr-users/${k.user?._id || k.productId}`}
                          className="p-1.5 bg-[#259A3A]/10 hover:bg-[#259A3A]/20 text-[#259A3A] rounded-lg transition"
                          title="Open QR User Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <a
                          href={`${PUBLIC_SCAN_BASE}/scan/${k.primaryPublicToken || k.copies?.[0]?.publicToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D56A5] rounded-lg transition"
                          title="Test Public Scan Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: QR USER DETAILS SUMMARY */}
      {selectedKit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-[#259A3A]" />
                  <span>QR User & Vehicle Profile</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Kit: {selectedKit.productId}</p>
              </div>
              <button
                onClick={() => setSelectedKit(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {/* Driver Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver / Vehicle Owner</span>
                <div className="font-bold text-slate-900 text-sm">{selectedKit.user?.name}</div>
                <div className="font-mono text-slate-600">📱 Mobile: {selectedKit.user?.phone}</div>
                {selectedKit.user?.address && (
                  <div className="text-slate-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{selectedKit.user.address}</span>
                  </div>
                )}
              </div>

              {/* Vehicle & Emergency Contacts */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protected Vehicle</span>
                {selectedKit.vehicle ? (
                  <div>
                    <div className="font-mono font-black text-slate-900 text-sm">{selectedKit.vehicle.vehicleNumber}</div>
                    <div className="text-slate-600 font-semibold">{selectedKit.vehicle.vehicleBrand} {selectedKit.vehicle.vehicleName}</div>
                    
                    {/* Emergency Contacts */}
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Emergency Contacts:</span>
                      {selectedKit.vehicle.emergencyContacts?.map((c, i) => (
                        <div key={i} className="font-mono text-slate-700 text-[11px]">
                          • <strong>{c.name}</strong>: {c.number}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No vehicle data</span>
                )}
              </div>

              {/* Purchaser / Order details */}
              {selectedKit.buyer && (
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D56A5]">Purchased By (Buyer)</span>
                  <div className="font-bold text-slate-900">{selectedKit.buyer.name}</div>
                  <div className="font-mono text-slate-600">{selectedKit.buyer.phone} • {selectedKit.buyer.email}</div>
                  <Link
                    to={`/users/${selectedKit.buyer._id}`}
                    className="inline-block text-[11px] font-bold text-[#1D56A5] hover:underline mt-1"
                  >
                    View Buyer Account & Orders →
                  </Link>
                </div>
              )}

              {/* Calling Quotas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Calling Quota</span>
                  <div className="font-black text-emerald-900 text-base mt-0.5">
                    {selectedKit.wallet?.callBalance ?? 10} Left
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">Used: {selectedKit.wallet?.totalCallsUsed ?? 0}</div>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">SMS Alerts</span>
                  <div className="font-black text-purple-900 text-base mt-0.5">
                    {selectedKit.wallet?.messageBalance ?? 20} Left
                  </div>
                  <div className="text-[10px] text-purple-700 font-mono">Used: {selectedKit.wallet?.totalMessagesUsed ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedKit(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
