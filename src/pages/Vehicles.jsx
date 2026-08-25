import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Search, ExternalLink, User, Phone, Car, Tag, Sparkles, Eye } from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function Vehicles() {
  const { authHeader } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/vehicles`, authHeader);
      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const brand = (v.vehicleBrand || '').toLowerCase();
    const name = (v.vehicleName || '').toLowerCase();
    const number = (v.vehicleNumber || '').toLowerCase();
    const owner = (v.userId?.name || '').toLowerCase();
    const phone = (v.userId?.phone || '').toLowerCase();
    const qrs = (v.qrs || []).map(qr => `${qr.productId} ${qr.copyCode}`).join(' ').toLowerCase();

    return brand.includes(q) || name.includes(q) || number.includes(q) || owner.includes(q) || phone.includes(q) || qrs.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <div className="p-2.5 bg-[#1D56A5]/10 text-[#1D56A5] rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span>Protected Items & Assets Registry</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All vehicles, bags, luggage, and personal assets registered under Safe Drive protection
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item, tag, plate, owner..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Registered Items: <span className="text-[#1D56A5] font-black">{filteredVehicles.length}</span>
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5]" />
            <span>Loading registered items...</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No registered items found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Item / Asset</th>
                  <th className="py-3.5 px-4">Tag / Plate ID</th>
                  <th className="py-3.5 px-4">Linked QR Kit & Copies</th>
                  <th className="py-3.5 px-4">Registered Owner</th>
                  <th className="py-3.5 px-4">Emergency Contacts</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v, index) => {
                  const qrs = v.qrs || [];
                  const primaryQR = qrs[0];
                  const productId = primaryQR?.productId || 'SD-KIT';
                  const copiesText = qrs.map((q) => q.copyCode).join(', ');
                  const qrFor = primaryQR?.qrFor || 'Vehicle / Item';
                  const isDigital = primaryQR?.qrType === 'DIGITAL';

                  return (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition">
                      {/* # Index */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">{index + 1}</td>

                      {/* Item / Asset */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-[#E9DFEE] text-[#1D56A5] rounded-xl font-bold">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {v.vehicleBrand} {v.vehicleName}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                              🏷️ {qrFor}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Plate / Tag Identifier */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-xs bg-[#E9DFEE] text-[#1D56A5] px-2.5 py-1 rounded-lg border border-[#1D56A5]/20">
                          {v.vehicleNumber}
                        </span>
                      </td>

                      {/* Linked QR Kit & Copies */}
                      <td className="py-4 px-4">
                        {qrs.length > 0 ? (
                          <div>
                            <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                              <span>{productId}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  isDigital ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800'
                                }`}
                              >
                                {isDigital ? 'DIGITAL' : 'PHYSICAL'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {copiesText || '1 Sticker'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No QR Linked</span>
                        )}
                      </td>

                      {/* Owner Details */}
                      <td className="py-4 px-4">
                        {v.userId ? (
                          <div>
                            <Link
                              to={`/qr-users/${v.userId._id}`}
                              className="font-bold text-slate-900 hover:text-[#259A3A] hover:underline"
                            >
                              {v.userId.name}
                            </Link>
                            <div className="font-mono text-[11px] text-slate-500">{v.userId.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Emergency Contacts */}
                      <td className="py-4 px-4 text-[11px] space-y-0.5">
                        {v.emergencyContacts && v.emergencyContacts.length > 0 ? (
                          v.emergencyContacts.map((c, i) => (
                            <div key={i} className="truncate text-slate-600">
                              <span className="font-bold text-slate-800">{c.name}:</span>{' '}
                              <span className="font-mono text-emerald-700 font-bold">{c.number}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-[11px] text-slate-500 font-mono">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/qr-users/${v.userId?._id || productId || v._id}`}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#259A3A] text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition inline-flex items-center space-x-1 border border-emerald-200"
                            title="View Vehicle & QR Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </Link>

                          {primaryQR && (
                            <a
                              href={`${PUBLIC_SCAN_BASE}/${primaryQR.publicToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#1D56A5] hover:bg-[#164382] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-2xs inline-flex items-center space-x-1"
                              title="Open Public QR Scan Page"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Scan</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
