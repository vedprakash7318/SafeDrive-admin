import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SafeDriveQRCode from '../components/SafeDriveQRCode';
import {
  ArrowLeft,
  QrCode,
  Layers,
  Package,
  CheckCircle2,
  AlertTriangle,
  Search,
  Printer,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  X,
  UserPlus
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function QRGroupDetails() {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kits, setKits] = useState([]);
  const [rawQRs, setRawQRs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalKits: 0,
    totalStickers: 0,
    inStockKits: 0,
    activeKits: 0,
    soldKits: 0
  });

  // Active View: 'KITS' | 'STICKERS'
  const [viewMode, setViewMode] = useState('KITS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Print Sheet Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printPaperSize, setPrintPaperSize] = useState('13x19_SINGLE');
  const [selectedSingleQRId, setSelectedSingleQRId] = useState('ALL');
  const [showCutMarks, setShowCutMarks] = useState(true);

  // Assignment states
  const [selectedQRs, setSelectedQRs] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [dealersList, setDealersList] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [dealerSearch, setDealerSearch] = useState('');

  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/dealers`, authHeader);
      if (res.data.success) {
        setDealersList(res.data.dealers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroupData();
    }, 500);
    return () => clearTimeout(timer);
  }, [groupName, page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleToggleQRSelect = (qrId) => {
    if (!qrId) return;
    if (selectedQRs.includes(qrId)) {
      setSelectedQRs(selectedQRs.filter(id => id !== qrId));
    } else {
      setSelectedQRs([...selectedQRs, qrId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      if (viewMode === 'KITS') {
        const selectableIds = filteredKits
          .filter(k => ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(k.status) && k.qrType !== 'DIGITAL' && !k.user && !k.buyer)
          .map(k => k.primaryQRId);
        setSelectedQRs(Array.from(new Set([...selectedQRs, ...selectableIds])));
      } else {
        const selectableIds = filteredStickers
          .filter(q => ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(q.status) && q.qrType !== 'DIGITAL' && !q.userId && !q.buyerId)
          .map(q => q._id);
        setSelectedQRs(Array.from(new Set([...selectedQRs, ...selectableIds])));
      }
    } else {
      if (viewMode === 'KITS') {
        const currentIds = filteredKits.map(k => k.primaryQRId);
        setSelectedQRs(selectedQRs.filter(id => !currentIds.includes(id)));
      } else {
        const currentIds = filteredStickers.map(q => q._id);
        setSelectedQRs(selectedQRs.filter(id => !currentIds.includes(id)));
      }
    }
  };

  const handleAssignQRs = async () => {
    if (!selectedDealer) {
      toast.warn('Please select a dealer');
      return;
    }
    
    try {
      const res = await axios.post(`${API_BASE}/admin/dealers/assign-qr`, {
        dealerId: selectedDealer,
        assignmentType: 'SELECTED_QRS',
        qrIds: selectedQRs
      }, authHeader);
      
      if (res.data.success) {
        toast.success(res.data.message);
        setShowAssignModal(false);
        setSelectedQRs([]);
        setSelectedDealer('');
        fetchGroupData(); // refresh list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleUnassignQRs = async (qrIds) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/dealers/unassign-qr`, {
        qrIds
      }, authHeader);
      
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedQRs([]);
        fetchGroupData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unassign failed');
    }
  };

  const fetchGroupData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/group/${groupName}?page=${page}&limit=${limit}&search=${searchTerm}&status=${statusFilter}`, authHeader);
      if (res.data.success) {
        setKits(res.data.kits || []);
        setRawQRs(res.data.qrs || []);
        setStats(res.data.stats || {});
        if (res.data.pagination) {
          setTotalItems(res.data.pagination.totalItems);
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Fetch group details error:', err);
      setError(err.response?.data?.message || 'Failed to load QR group inventory.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Kits
  const filteredKits = kits;

  // Filtered Stickers
  const filteredStickers = rawQRs;

  const selectableKits = filteredKits.filter(k => ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(k.status) && k.qrType !== 'DIGITAL' && !k.user && !k.buyer);
  const isAllKitsSelected = selectableKits.length > 0 && selectableKits.every(k => selectedQRs.includes(k.primaryQRId));

  const selectableStickers = filteredStickers.filter(q => ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(q.status) && q.qrType !== 'DIGITAL' && !q.userId && !q.buyerId);
  const isAllStickersSelected = selectableStickers.length > 0 && selectableStickers.every(q => selectedQRs.includes(q._id));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1D56A5] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading batch group inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-[#E94E1A] rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">QR Group Not Found</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/qr')}
          className="inline-flex items-center space-x-2 bg-[#1D56A5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to QR Inventory</span>
        </button>
      </div>
    );
  }

  const categoryName = kits.length > 0 ? (kits[0].qrFor || 'Car') : 'Vehicle';

  const hasAssignedSelected = selectedQRs.some(id => {
    const k = kits.find(k => k.primaryQRId === id);
    if (k) return k.status === 'ASSIGNED_TO_DEALER';
    const s = rawQRs.find(q => q._id === id);
    if (s) return s.status === 'ASSIGNED_TO_DEALER';
    return false;
  });

  const hasUnassignedSelected = selectedQRs.some(id => {
    const k = kits.find(k => k.primaryQRId === id);
    if (k) return ['IN STOCK', 'GENERATED'].includes(k.status);
    const s = rawQRs.find(q => q._id === id);
    if (s) return ['IN STOCK', 'GENERATED'].includes(s.status);
    return false;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/qr')}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Back to QR Inventory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#E9DFEE] text-[#1D56A5] flex items-center justify-center font-black flex-shrink-0 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-black text-slate-900 font-mono leading-tight">{groupName}</h1>
              <span className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                🏷️ {categoryName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Batch Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {stats.totalKits} Unique Kit Sets • {stats.totalStickers} Physical QR Stickers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rawQRs.length > 0 && rawQRs[0].qrType === 'DIGITAL' ? (
            <span className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3.5 py-2 rounded-xl text-xs">
              💻 Digital E-QR (Print Not Applicable)
            </span>
          ) : (
            <>
              {selectedQRs.length > 0 && hasUnassignedSelected && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#16A34A] to-[#14532d] hover:from-[#15803d] hover:to-[#166534] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#16A34A]/20 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Selected</span>
                </button>
              )}
              {selectedQRs.length > 0 && hasAssignedSelected && (
                <button
                  onClick={() => handleUnassignQRs(selectedQRs.filter(id => {
                    const k = kits.find(k => k.primaryQRId === id);
                    if (k) return k.status === 'ASSIGNED_TO_DEALER';
                    const s = rawQRs.find(q => q._id === id);
                    if (s) return s.status === 'ASSIGNED_TO_DEALER';
                    return false;
                  }))}
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  <X className="w-4 h-4" />
                  <span>Unassign Selected</span>
                </button>
              )}
              <button
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center space-x-1.5 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Batch Stickers</span>
              </button>
            </>
          )}

          <button
            onClick={fetchGroupData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-[#1D56A5]" />
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Unique Kits */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Kits</span>
            <Package className="w-5 h-5 text-[#1D56A5]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalKits || 0}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Distinct Unique Product IDs</p>
        </div>

        {/* Total Stickers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stickers</span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.totalStickers || 0}</div>
          <p className="text-[10px] text-indigo-700 mt-1 font-medium">Physical Printed Stickers</p>
        </div>

        {/* Available In Stock / Allotted */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {groupName === 'STORE-DIGITAL' || rawQRs?.[0]?.qrType === 'DIGITAL' ? 'Allotted to Buyers' : 'Available In Stock'}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {groupName === 'STORE-DIGITAL' || rawQRs?.[0]?.qrType === 'DIGITAL' ? (stats.generatedKits || stats.totalKits || 0) : (stats.inStockKits || 0)}
          </div>
          <p className="text-[10px] text-emerald-700 mt-1 font-medium">
            {groupName === 'STORE-DIGITAL' || rawQRs?.[0]?.qrType === 'DIGITAL' ? 'Assigned Digital E-Kits' : 'Ready for Assignment'}
          </p>
        </div>

        {/* Active Registered */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Registered</span>
            <ShieldCheck className="w-5 h-5 text-[#1D56A5]" />
          </div>
          <div className="text-2xl font-black text-[#1D56A5]">{stats.activeKits || 0}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Active Customer Vehicles</p>
        </div>
      </div>

      {/* 3. VIEW TOGGLE TABS & SEARCH */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setViewMode('KITS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'KITS'
                ? 'bg-[#1D56A5] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Single Product Kits ({kits.length})</span>
          </button>

          <button
            onClick={() => setViewMode('STICKERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'STICKERS'
                ? 'bg-[#1D56A5] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Physical Stickers ({rawQRs.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, Owner, Plate..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#1D56A5]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1D56A5]"
          >
            <option value="ALL">All Status</option>
            <option value="IN STOCK">✓ In Stock</option>
            <option value="ACTIVE">⚡ Active</option>
            <option value="SOLD">⏳ Sold</option>
            <option value="EXPIRED">❌ Expired</option>
          </select>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      {viewMode === 'KITS' ? (
        /* SINGLE KITS TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={isAllKitsSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#16A34A] rounded border-slate-300 focus:ring-[#16A34A]"
                    />
                  </th>
                  <th className="px-5 py-3.5">Kit Product ID</th>
                  <th className="px-5 py-3.5">Bundled Copies</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Owner</th>
                  <th className="px-5 py-3.5">Registered Vehicle</th>
                  <th className="px-5 py-3.5">Validity Expiry</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredKits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-slate-400 text-xs">
                      No QR kits found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredKits.map((k) => {
                    const isSelected = selectedQRs.includes(k.primaryQRId);
                    const showCheckbox = ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(k.status) && k.qrType !== 'DIGITAL' && !k.user && !k.buyer;
                    
                    return (
                    <tr key={k.productId} className={`transition ${isSelected ? 'bg-[#16A34A]/10' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-5 py-3.5 text-center cursor-pointer" onClick={() => showCheckbox && handleToggleQRSelect(k.primaryQRId)}>
                        <div className="flex justify-center items-center">
                          {showCheckbox && (
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleQRSelect(k.primaryQRId)}
                              className="w-4 h-4 text-[#16A34A] rounded border-slate-300 focus:ring-[#16A34A]"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-black text-slate-900 font-mono text-sm">{k.productId}</div>
                        {k.securityCode && (
                          <span className="inline-block mt-0.5 font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300">
                            PIN: {k.securityCode}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : ''}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {k.copies && k.copies.map((c) => (
                            <span
                              key={c._id || c.copyCode}
                              className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-bold"
                            >
                              {c.copyCode}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="bg-[#E9DFEE] text-[#1D56A5] font-bold text-[10px] px-2 py-0.5 rounded-md font-mono">
                          🏷️ {k.qrFor || 'Car'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                            k.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : k.status === 'IN STOCK' || k.status === 'GENERATED'
                              ? 'bg-blue-50 text-[#1D56A5] border-blue-200'
                              : k.status === 'SOLD'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          ● {k.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {k.user ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{k.user.name}</span>
                              {k.user.isBuyer && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                  Buyer
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">📱 {k.user.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {k.vehicle ? (
                          <div>
                            <div className="font-mono font-bold text-slate-900">{k.vehicle.vehicleNumber}</div>
                            <div className="text-[10px] text-slate-500">{k.vehicle.vehicleBrand} {k.vehicle.vehicleName}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-[11px] font-mono">
                        {k.expiryDate ? new Date(k.expiryDate).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {k.status === 'ASSIGNED_TO_DEALER' && (
                          <button
                            onClick={() => handleUnassignQRs([k.primaryQRId])}
                            className="inline-flex items-center space-x-1 text-xs text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-bold transition"
                          >
                            <span>Unassign</span>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        {k.primaryQRId && (
                          <Link
                            to={`/qr/${k.primaryQRId}`}
                            className="inline-flex items-center space-x-1 text-xs text-[#1D56A5] hover:text-[#164382] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-bold transition"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
              <div className="text-xs text-slate-500 font-bold">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-[#1D56A5] text-white">
                  Page {page} of {totalPages}
                </div>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ALL PHYSICAL STICKERS TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={isAllStickersSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#16A34A] rounded border-slate-300 focus:ring-[#16A34A]"
                    />
                  </th>
                  <th className="px-5 py-3.5">Sticker Code</th>
                  <th className="px-5 py-3.5">Kit ID</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Public URL</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStickers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-400 text-xs">
                      No stickers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStickers.map((q) => {
                    const isSelected = selectedQRs.includes(q._id);
                    const showCheckbox = ['IN STOCK', 'GENERATED', 'ASSIGNED_TO_DEALER'].includes(q.status) && q.qrType !== 'DIGITAL' && !q.userId && !q.buyerId;
                    
                    return (
                    <tr key={q._id} className={`transition ${isSelected ? 'bg-[#16A34A]/10' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-5 py-3.5 text-center cursor-pointer" onClick={() => showCheckbox && handleToggleQRSelect(q._id)}>
                        <div className="flex justify-center items-center">
                          {showCheckbox && (
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleQRSelect(q._id)}
                              className="w-4 h-4 text-[#16A34A] rounded border-slate-300 focus:ring-[#16A34A]"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/qr/${q._id}`} className="font-mono font-black text-slate-900 text-sm hover:text-[#1D56A5]">
                          {q.copyCode}
                        </Link>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                        <div>{q.productId}</div>
                        {q.securityCode && (
                          <span className="font-mono text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-bold border border-amber-300">
                            PIN: {q.securityCode}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="bg-[#E9DFEE] text-[#1D56A5] font-bold text-[10px] px-2 py-0.5 rounded font-mono">
                          🏷️ {q.qrFor || 'Car'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            q.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : q.status === 'IN STOCK'
                              ? 'bg-blue-50 text-[#1D56A5] border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          ● {q.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">
                        /q/{q.publicToken}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {q.status === 'ASSIGNED_TO_DEALER' && (
                          <button
                            onClick={() => handleUnassignQRs([q._id])}
                            className="inline-flex items-center space-x-1 text-xs text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-bold transition"
                          >
                            <span>Unassign</span>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <Link
                          to={`/qr/${q._id}`}
                          className="inline-flex items-center space-x-1 text-xs text-[#1D56A5] hover:text-[#164382] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-bold transition"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
              <div className="text-xs text-slate-500 font-bold">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-[#1D56A5] text-white">
                  Page {page} of {totalPages}
                </div>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PRINT SHEET MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-6">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <Printer className="w-6 h-6 text-[#1D56A5]" />
                  <span>Print Sheet — {groupName}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Print ready layout for 13×19 / A4 sticker sheets
                </p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Stickers to Print</span>
                  <div className="text-xl font-black text-slate-900 font-mono">{rawQRs.length} Stickers</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Sets</span>
                  <div className="text-xl font-black text-[#1D56A5] font-mono">{kits.length} Kits</div>
                </div>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    navigate(`/qr`);
                  }}
                  className="w-2/3 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Full Printable Layout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl my-6">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-[#16A34A]" />
                  <span>Select Dealer</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Assigning {selectedQRs.length} selected stickers to the dealer.
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Dealer by name or phone..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#16A34A] transition"
                value={dealerSearch}
                onChange={(e) => setDealerSearch(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto mb-6 border border-slate-200 rounded-2xl p-1 bg-slate-50">
              {dealersList
                .filter(d => d.name.toLowerCase().includes(dealerSearch.toLowerCase()) || d.phone.includes(dealerSearch))
                .map(dealer => (
                <div 
                  key={dealer._id}
                  onClick={() => setSelectedDealer(dealer._id)}
                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition mb-1 last:mb-0 ${
                    selectedDealer === dealer._id 
                      ? 'bg-white border-2 border-[#16A34A] shadow-sm' 
                      : 'hover:bg-white border-2 border-transparent'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{dealer.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{dealer.phone}</p>
                  </div>
                  {selectedDealer === dealer._id && (
                    <div className="bg-emerald-100 text-[#16A34A] p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {dealersList.filter(d => d.name.toLowerCase().includes(dealerSearch.toLowerCase()) || d.phone.includes(dealerSearch)).length === 0 && (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                  <AlertTriangle className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-xs font-medium">No dealers found</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowAssignModal(false)} 
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignQRs}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-xl shadow-lg shadow-[#16A34A]/30 transition disabled:opacity-50 disabled:shadow-none"
                disabled={!selectedDealer}
              >
                Confirm Assignment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
