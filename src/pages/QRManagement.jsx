import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import SafeDriveQRCode from '../components/SafeDriveQRCode';
import DigitalCardModal from '../components/DigitalCardModal';
import {
  QrCode,
  Plus,
  RefreshCw,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Copy,
  X,
  ExternalLink,
  Eye,
  Layers,
  FolderKanban,
  Tag,
  Check,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth, API_BASE, PUBLIC_SCAN_BASE } from '../context/AuthContext';

export default function QRManagement() {
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  // Active View Tab: 'GROUPS' | 'ALL_QRS'
  const [activeTab, setActiveTab] = useState('GROUPS');

  // Groups Data
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Individual QRs Data
  const [qrs, setQrs] = useState([]);
  const [loadingQrs, setLoadingQrs] = useState(false);
  const [qrFilter, setQrFilter] = useState('ALL');
  const [qrTagFilter, setQrTagFilter] = useState('ALL');
  const [qrSearch, setQrSearch] = useState('');

  // Generation Modal States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [customGroupName, setCustomGroupName] = useState('');
  const [qrTypes, setQrTypes] = useState([]);
  const [selectedQRType, setSelectedQRType] = useState('');
  const [selectedQRFormat, setSelectedQRFormat] = useState('PHYSICAL');
  const [nextSeq, setNextSeq] = useState({ nextNumber: 1, formattedCode: 'SD001' });
  const [batchQuantity, setBatchQuantity] = useState(10);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState('');

  // View Group Drawer Modal
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupQRs, setGroupQRs] = useState([]);

  // Digital Download State
  const [downloadDigitalQR, setDownloadDigitalQR] = useState(null);
  const [loadingGroupQRs, setLoadingGroupQRs] = useState(false);

  // Edit Batch Modal
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [editBatchData, setEditBatchData] = useState(null);
  const [editingBatch, setEditingBatch] = useState(false);

  // Print Mode Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printItems, setPrintItems] = useState([]);
  const [printTitle, setPrintTitle] = useState('');
  const [printPaperSize, setPrintPaperSize] = useState('A3_CARD_21');
  const [selectedQRIds, setSelectedQRIds] = useState([]);
  const [showStickerDropdown, setShowStickerDropdown] = useState(false);
  const [showCutMarks, setShowCutMarks] = useState(true);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/tags`, authHeader);
      if (res.data.success) {
        setTags(res.data.tags);
        if (res.data.tags.length > 0 && !selectedTag) {
          setSelectedTag(res.data.tags[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQRTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/qr-types`, authHeader);
      if (res.data.success) {
        setQrTypes(res.data.types);
        if (res.data.types.length > 0 && !selectedQRType) {
          setSelectedQRType(res.data.types[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextSeq = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/next-number`, authHeader);
      if (res.data.success) {
        setNextSeq(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/groups`, authHeader);
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchQRs = async () => {
    setLoadingQrs(true);
    try {
      const tagQuery = qrTagFilter !== 'ALL' ? `&batchId=${qrTagFilter}` : '';
      const res = await axios.get(
        `${API_BASE}/admin/qr?status=${qrFilter}&search=${qrSearch}${tagQuery}&limit=100`,
        authHeader
      );
      if (res.data.success) {
        setQrs(res.data.qrs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQrs(false);
    }
  };

  const refreshAll = () => {
    fetchGroups();
    fetchQRs();
    fetchTags();
    fetchQRTypes();
    fetchNextSeq();
  };

  useEffect(() => {
    refreshAll();
  }, [qrFilter, qrTagFilter]);

  // Handle Generate QR Batch (Only: QR For + Quantity + Group + Type: PHYSICAL / DIGITAL)
  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setGeneratingBatch(true);
    setBatchSuccess('');

    const targetGroupName = (customGroupName || 'DEFAULT-BATCH').trim().toUpperCase();
    const chosenTypeObj = qrTypes.find((t) => t.name === selectedQRType);

    try {
      const payload = {
        quantity: Number(batchQuantity),
        tag: targetGroupName,
        qrFor: selectedQRType || 'Car',
        qrTypeId: chosenTypeObj?._id,
        qrType: selectedQRFormat === 'DIGITAL' ? 'DIGITAL' : 'PHYSICAL'
      };
      const res = await axios.post(`${API_BASE}/admin/qr/generate`, payload, authHeader);
      if (res.data.success) {
        setBatchSuccess(res.data.message);
        refreshAll();
        setTimeout(() => {
          setShowGenerateModal(false);
          setBatchSuccess('');
          setCustomGroupName('');
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating batch');
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Open Group Details Drawer
  const handleViewGroupDetails = async (group) => {
    setSelectedGroup(group);
    setLoadingGroupQRs(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/group/${group.groupName}`, authHeader);
      if (res.data.success) {
        setGroupQRs(res.data.qrs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupQRs(false);
    }
  };

  // Open Print Modal for a specific group (Physical Only)
  const handlePrintGroup = async (group) => {
    if (group.qrType === 'DIGITAL') {
      alert('Digital QR passes are for electronic use only and cannot be printed. Only Physical QR stickers can be printed.');
      return;
    }
    setPrintTitle(`Group: ${group.groupName} (${group.qrType || 'PHYSICAL'})`);
    try {
      const res = await axios.get(`${API_BASE}/admin/qr/group/${group.groupName}`, authHeader);
      if (res.data.success) {
        // Filter to ensure only physical stickers are passed to print
        const printableStickers = (res.data.qrs || []).filter((q) => q.qrType !== 'DIGITAL');
        if (printableStickers.length === 0) {
          alert('No printable physical stickers found in this group.');
          return;
        }
        setPrintItems(printableStickers);
        setShowPrintModal(true);
      }
    } catch (err) {
      alert('Failed to load group stickers for print.');
    }
  };

  // Toggle Batch Print Status
  const handleTogglePrintStatus = async (group) => {
    const nextStatus = !group.isPrinted;
    if (!confirm(`Mark batch ${group.groupName} as ${nextStatus ? 'Printed' : 'Not Printed'}?`)) return;
    try {
      const res = await axios.put(`${API_BASE}/admin/qr/batch/${group.groupName}/print-status`, { isPrinted: nextStatus }, authHeader);
      if (res.data.success) {
        fetchGroups();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating batch print status');
    }
  };

  // Open Edit Batch Modal
  const handleOpenEditBatch = (group) => {
    setEditBatchData({
      originalGroupName: group.groupName,
      groupName: group.groupName,
      qrFor: group.qrFor || 'Car',
      qrType: group.qrType || 'PHYSICAL',
      qrTypeId: group.qrTypeId || ''
    });
    setShowEditBatchModal(true);
  };

  // Handle Edit Batch Submit
  const handleEditBatchSubmit = async (e) => {
    e.preventDefault();
    setEditingBatch(true);
    try {
      const payload = {
        newBatchId: editBatchData.groupName.trim().toUpperCase().replace(/\s+/g, '-'),
        qrFor: editBatchData.qrFor,
        qrType: editBatchData.qrType,
        qrTypeId: editBatchData.qrTypeId
      };

      const res = await axios.put(`${API_BASE}/admin/qr/batch/${editBatchData.originalGroupName}`, payload, authHeader);
      if (res.data.success) {
        setShowEditBatchModal(false);
        fetchGroups();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error editing batch');
    } finally {
      setEditingBatch(false);
    }
  };

  // Handle Delete Batch
  const handleDeleteBatch = async (group) => {
    const soldOrActive = (group.soldCount || 0) + (group.activeCount || 0) + (group.suspendedCount || 0);
    if (soldOrActive > 0) {
      alert('Cannot delete this batch because it contains sold or active stickers.');
      return;
    }

    if (!confirm(`Are you absolutely sure you want to delete the batch "${group.groupName}"? This action cannot be undone.`)) return;

    try {
      const res = await axios.delete(`${API_BASE}/admin/qr/batch/${group.groupName}`, authHeader);
      if (res.data.success) {
        fetchGroups();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting batch');
    }
  };

  // Toggle QR Status (Active / Suspended)
  const handleToggleQRStatus = async (qr) => {
    const nextStatus = qr.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Change status of ${qr.copyCode} to ${nextStatus}?`)) return;
    try {
      const res = await axios.put(`${API_BASE}/admin/qr/${qr._id}/status`, { status: nextStatus }, authHeader);
      if (res.data.success) {
        fetchQRs();
        if (selectedGroup) {
          handleViewGroupDetails(selectedGroup);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const selectedTypeObj = qrTypes.find((t) => t.name === selectedQRType);
  const currentCopiesPerSet = selectedTypeObj?.copiesPerSet || 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <QrCode className="w-7 h-7 text-[#1D56A5]" />
            <span>QR Inventory & Batches</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Generate QR sets by group, manage sticker inventory, and print sheets
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setBatchSuccess('');
              fetchNextSeq();
              setShowGenerateModal(true);
            }}
            className="flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate QR Batch</span>
          </button>

          <button
            onClick={refreshAll}
            title="Refresh"
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 text-[#1D56A5] ${loadingGroups || loadingQrs ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. VIEW SWITCH TABS */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('GROUPS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'GROUPS'
            ? 'bg-[#1D56A5] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>QR Groups & Batches ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL_QRS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'ALL_QRS'
            ? 'bg-[#1D56A5] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Individual Stickers ({qrs.length})</span>
        </button>
      </div>

      {/* 3. TAB 1: QR GROUPS / BATCHES OVERVIEW */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Group / Batch Name</th>
                    <th className="px-6 py-3.5">QR For</th>
                    <th className="px-6 py-3.5">Total Sets & Stickers</th>
                    <th className="px-6 py-3.5">Status Breakdown</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs">
                        {loadingGroups ? 'Loading groups...' : 'No QR groups found. Click "Generate QR Batch" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    groups.map((g) => (
                      <tr key={g.groupName} className="hover:bg-[#E9DFEE]/20 transition">
                        {/* 1. Group Name */}
                        <td className="px-6 py-3.5">
                          <div
                            onClick={() => navigate(`/qr/group/${g.groupName}`)}
                            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1D56A5]"></span>
                            <span className="font-mono font-black text-slate-900 text-sm hover:text-[#1D56A5]">{g.groupName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Range: {g.firstProduct} to {g.lastProduct}
                          </div>
                        </td>

                        {/* 2. QR For */}
                        <td className="px-6 py-3.5">
                          <span className="bg-[#E9DFEE] text-[#1D56A5] font-bold text-xs px-2.5 py-1 rounded-lg">
                            🏷️ {g.qrFor || g.qrType || 'Car'}
                          </span>
                        </td>

                        {/* 3. Total Sets & Stickers */}
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">{g.totalSets} Sets</div>
                          <div className="text-[10px] text-slate-500 font-mono">⚡ {g.totalStickers} Physical Stickers</div>
                        </td>

                        {/* 4. Status Breakdown */}
                        <td className="px-6 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {g.qrType === 'DIGITAL' || g.groupName?.includes('DIGITAL') || (g.generatedCount > 0 && (g.inStockCount || 0) === 0) ? (
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                {g.generatedCount || g.totalSets || 0} Allotted (Digital)
                              </span>
                            ) : (
                              <span className="bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/20 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                {g.inStockCount || 0} In Stock
                              </span>
                            )}
                            <span className="bg-emerald-50 text-[#259A3A] border border-[#259A3A]/20 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              {g.activeCount || 0} Active
                            </span>
                            {g.soldCount > 0 && g.qrType !== 'DIGITAL' && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                {g.soldCount} Sold
                              </span>
                            )}
                            {g.suspendedCount > 0 && (
                              <span className="bg-red-50 text-[#E94E1A] border border-[#E94E1A]/20 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                {g.suspendedCount} Suspended
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Created Date */}
                        <td className="px-6 py-3.5 text-slate-500 text-xs">
                          {g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-GB') : '—'}
                        </td>

                        {/* 6. Actions */}
                        <td className="px-6 py-3.5 align-middle">
                          <div className="flex flex-col items-end gap-2.5">

                            {/* Top Row: Details, Edit, Delete */}
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              <button
                                onClick={() => navigate(`/qr/group/${g.groupName}`)}
                                className="text-xs bg-[#1D56A5]/10 hover:bg-[#1D56A5] hover:text-white text-[#1D56A5] border border-[#1D56A5]/30 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditBatch(g)}
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow-2xs"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {((g.soldCount || 0) + (g.activeCount || 0) + (g.suspendedCount || 0)) === 0 && (
                                <button
                                  onClick={() => handleDeleteBatch(g)}
                                  className="text-xs bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow-2xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>

                            {/* Bottom Row: Print Actions */}
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              {g.qrType === 'DIGITAL' ? (
                                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1">
                                  💻 Digital (No Print)
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleTogglePrintStatus(g)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition inline-flex items-center space-x-1 shadow-2xs ${g.isPrinted
                                      ? 'bg-[#259A3A]/10 text-[#259A3A] border-[#259A3A]/30 hover:bg-[#259A3A] hover:text-white'
                                      : 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-500 hover:text-white'
                                      }`}
                                  >
                                    {g.isPrinted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
                                    <span>{g.isPrinted ? 'Printed' : 'Not Printed'}</span>
                                  </button>

                                  <button
                                    onClick={() => handlePrintGroup(g)}
                                    className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow-2xs"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#1D56A5]" />
                                    <span>Print Sheet</span>
                                  </button>
                                </>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: ALL INDIVIDUAL STICKERS TABLE */}
      {activeTab === 'ALL_QRS' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Sticker Code (e.g. SD001C1)..."
                value={qrSearch}
                onChange={(e) => setQrSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQRs()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={qrTagFilter}
                onChange={(e) => setQrTagFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-[#1D56A5]"
              >
                <option value="ALL">All Groups / Tags</option>
                {tags.map((t) => (
                  <option key={t._id} value={t.name}>{t.name}</option>
                ))}
              </select>

              <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 border border-slate-200">
                {['ALL', 'ACTIVE', 'IN STOCK', 'SOLD', 'SUSPENDED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setQrFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${qrFilter === st
                      ? 'bg-[#1D56A5] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">QR Code</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Group / Tag</th>
                    <th className="px-6 py-3.5">Expire</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qrs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs">
                        {loadingQrs ? 'Loading inventory...' : 'No QR codes found.'}
                      </td>
                    </tr>
                  ) : (
                    qrs.map((qr) => (
                      <tr key={qr._id} className="hover:bg-[#E9DFEE]/20 transition">
                        <td className="px-6 py-3.5">
                          <Link
                            to={`/qr/${qr._id}`}
                            className="flex items-center space-x-2 font-mono font-bold text-slate-900 text-sm hover:text-[#1D56A5] transition group"
                          >
                            <QrCode className="w-4 h-4 text-[#1D56A5] group-hover:scale-110 transition" />
                            <span>{qr.copyCode}</span>
                          </Link>
                          {qr.securityCode && (
                            <span className="inline-block mt-0.5 font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300">
                              PIN: {qr.securityCode}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${qr.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-[#259A3A] border border-[#259A3A]/30'
                              : qr.status === 'IN STOCK'
                                ? 'bg-blue-50 text-[#1D56A5] border border-[#1D56A5]/30'
                                : qr.status === 'SOLD'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-[#E94E1A] border border-[#E94E1A]/30'
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{qr.status}</span>
                          </span>
                        </td>

                        <td className="px-6 py-3.5">
                          <span className="bg-[#E9DFEE]/70 text-[#1D56A5] border border-[#1D56A5]/25 text-xs font-mono font-bold px-2.5 py-1 rounded-lg inline-block">
                            {qr.batchId}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-slate-600 text-xs font-medium">
                          {qr.expiryDate ? new Date(qr.expiryDate).toLocaleDateString('en-GB') : '—'}
                        </td>

                        <td className="px-6 py-3.5 text-right space-x-2">
                          <Link
                            to={`/qr/${qr._id}`}
                            className="text-xs bg-[#1D56A5]/10 hover:bg-[#1D56A5] hover:text-white text-[#1D56A5] border border-[#1D56A5]/30 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>

                          {qr.qrType === 'DIGITAL' && (
                            <button
                              onClick={() => setDownloadDigitalQR(qr)}
                              className="text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleQRStatus(qr)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition inline-flex items-center space-x-1 ${qr.status === 'SUSPENDED'
                              ? 'bg-[#259A3A]/10 hover:bg-[#259A3A] hover:text-white text-[#259A3A] border-[#259A3A]/30'
                              : 'bg-[#E94E1A]/10 hover:bg-[#E94E1A] hover:text-white text-[#E94E1A] border-[#E94E1A]/30'
                              }`}
                          >
                            <span>{qr.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. GENERATE QR BATCH MODAL (Clean: QR Type, Quantity, Group Name) */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <Plus className="w-6 h-6 text-[#1D56A5]" />
                  <span>Generate QR Code Batch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select product type, batch quantity, and assign a group name
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {batchSuccess && (
              <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-[#259A3A]/30 rounded-2xl text-[#259A3A] text-xs font-bold flex items-center space-x-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{batchSuccess}</span>
              </div>
            )}

            {/* Scrollable Body */}
            <form id="batchGenerateForm" onSubmit={handleGenerateBatch} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Start Sequence Info */}
              <div className="flex items-center justify-between bg-[#E9DFEE]/50 border border-[#1D56A5]/20 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-[#1D56A5] font-bold">Auto Sequence Start ID:</span>
                <span className="font-mono font-black text-sm text-[#1D56A5]">
                  {nextSeq.formattedCode}
                </span>
              </div>

              {/* 1. Select QR For (Vehicle / Item) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    QR For (Vehicle / Item) *
                  </label>
                  <Link to="/settings/qr-types" className="text-[10px] text-[#1D56A5] hover:underline font-bold">
                    + Manage Categories
                  </Link>
                </div>
                <select
                  value={selectedQRType}
                  onChange={(e) => setSelectedQRType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                  required
                >
                  {qrTypes.map((t) => {
                    const isVeh = t.isVehicle !== false && t.category !== 'NON_VEHICLE';
                    return (
                      <option key={t._id} value={t.name}>
                        {isVeh ? '🚗' : '🧳'} {t.name} ({t.copiesPerSet || 2} Stickers per Set) — {isVeh ? 'Vehicle Plate' : '4-Digit PIN'}
                      </option>
                    );
                  })}
                </select>

                {/* Helper notice based on selected type */}
                {(() => {
                  const currentTypeObj = qrTypes.find(t => t.name === selectedQRType);
                  const isVeh = currentTypeObj ? (currentTypeObj.isVehicle !== false && currentTypeObj.category !== 'NON_VEHICLE') : true;
                  return isVeh ? (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-medium text-emerald-800 flex items-center space-x-1.5">
                      <span>🚗</span>
                      <span><strong>Vehicle Tag:</strong> Citizen verification will check last 4 digits of the physical number plate.</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-medium text-amber-900 flex items-center space-x-1.5">
                      <span>🧳</span>
                      <span><strong>Non-Vehicle Item:</strong> A unique <strong>4-digit Security PIN</strong> will be auto-generated and printed on the tag.</span>
                    </div>
                  );
                })()}
              </div>

              {/* 1.5 QR Type (Fixed: PHYSICAL / DIGITAL) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type *
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQRFormat('PHYSICAL')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${selectedQRFormat === 'PHYSICAL'
                      ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedQRFormat === 'PHYSICAL' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                      }`}>
                      {selectedQRFormat === 'PHYSICAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">📦 PHYSICAL</div>
                      <div className="text-[10px] text-slate-500">Printed Stickers (Scan to assign)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQRFormat('DIGITAL')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${selectedQRFormat === 'DIGITAL'
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedQRFormat === 'DIGITAL' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                      {selectedQRFormat === 'DIGITAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">💻 DIGITAL</div>
                      <div className="text-[10px] text-slate-500">E-QR Digital Pass</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. QR Group / Batch Tag */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Group / Batch Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BATCH-01, NORTH-ZONE, DIWALI-2026..."
                  value={customGroupName}
                  onChange={(e) => setCustomGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              {/* 3. Quantity of Sets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity of Sets to Generate *
                </label>
                <input
                  type="number"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                  min="1"
                  max="500"
                  required
                />
                <div className="text-[11px] text-[#1D56A5] font-semibold mt-1">
                  ⚡ <strong>{batchQuantity} sets</strong> × {currentCopiesPerSet} copies = <strong className="text-slate-900">{batchQuantity * currentCopiesPerSet} physical stickers</strong> ({currentCopiesPerSet === 1 ? 'C1' : `C1 to C${currentCopiesPerSet}`})
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="flex space-x-3 p-4 md:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="w-1/3 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="batchGenerateForm"
                disabled={generatingBatch}
                className="w-2/3 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md shadow-[#1D56A5]/25 text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {generatingBatch ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Generate {batchQuantity * currentCopiesPerSet} Stickers ({selectedQRType})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BATCH MODAL */}
      {showEditBatchModal && editBatchData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <Edit className="w-6 h-6 text-[#1D56A5]" />
                  <span>Edit QR Batch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the group name, QR For category, or QR Type.
                </p>
              </div>
              <button
                onClick={() => setShowEditBatchModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form id="editBatchForm" onSubmit={handleEditBatchSubmit} className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6">

              {/* Batch Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Group / Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={editBatchData.groupName}
                  onChange={(e) => setEditBatchData({ ...editBatchData, groupName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                />
              </div>

              {/* QR For Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR For Category *
                </label>
                <select
                  required
                  value={editBatchData.qrFor}
                  onChange={(e) => {
                    const newQrFor = e.target.value;
                    const newTypeObj = qrTypes.find((t) => t.name === newQrFor);
                    setEditBatchData({
                      ...editBatchData,
                      qrFor: newQrFor,
                      qrTypeId: newTypeObj?._id || ''
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                >
                  {qrTypes.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* QR Type (PHYSICAL / DIGITAL) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Type *
                </label>
                <select
                  required
                  value={editBatchData.qrType}
                  onChange={(e) => setEditBatchData({ ...editBatchData, qrType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5]"
                >
                  <option value="PHYSICAL">PHYSICAL</option>
                  <option value="DIGITAL">DIGITAL</option>
                </select>
              </div>

            </form>

            {/* Sticky Footer */}
            <div className="flex space-x-3 p-4 md:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditBatchModal(false)}
                className="w-1/3 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editBatchForm"
                disabled={editingBatch}
                className="w-2/3 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md shadow-[#1D56A5]/25 text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {editingBatch ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW GROUP DETAILS DRAWER / MODAL */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <FolderKanban className="w-6 h-6 text-[#1D56A5]" />
                  <span>Group: {selectedGroup.groupName}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: <strong>{selectedGroup.qrType}</strong> • {selectedGroup.totalSets} Sets ({selectedGroup.totalStickers} Stickers)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePrintGroup(selectedGroup)}
                  className="bg-[#1D56A5] hover:bg-[#164382] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print This Group</span>
                </button>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingGroupQRs ? (
              <div className="py-12 text-center text-slate-400">Loading group stickers...</div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Sticker Code</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Linked Customer / Vehicle</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupQRs.map((qr) => (
                      <tr key={qr._id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                          {qr.copyCode}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qr.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-[#259A3A]'
                              : qr.status === 'IN STOCK'
                                ? 'bg-blue-50 text-[#1D56A5]'
                                : 'bg-amber-50 text-amber-700'
                              }`}
                          >
                            {qr.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {qr.vehicleId ? (
                            <span>🚗 {qr.vehicleId.vehicleNumber} ({qr.userId?.name || 'Owner'})</span>
                          ) : qr.userId ? (
                            <span>👤 {qr.userId.name}</span>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Link
                            to={`/qr/${qr._id}`}
                            className="text-[11px] text-[#1D56A5] font-bold hover:underline"
                          >
                            View Page ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. PRINT SHEET MODAL WITH 13x19 INCH PRESETS & CUSTOM LAYOUTS */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          {/* Dynamic Print CSS for Page Sizing */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-area, #printable-area * {
                visibility: visible;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white !important;
              }
              .print-no-break {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .print-page-break {
                break-after: page;
                page-break-after: always;
              }
              ${printPaperSize === '13x19_SINGLE' || printPaperSize === '13x19_GRID_12' || printPaperSize === '13x19_GRID_18'
              ? '@page { size: 13in 19in portrait; margin: 0.35in; }'
              : printPaperSize === 'A3_GRID_8'
                ? '@page { size: A3 portrait; margin: 10mm; }'
                : '@page { size: A4 portrait; margin: 8mm; }'
            }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-6xl w-full p-6 md:p-8 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Control Bar (Hidden in Print) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200 print:hidden">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-[#1D56A5]" />
                  <span>Print QR Stickers Sheet</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {printTitle} • {printItems.length} Stickers in Batch
                </p>
              </div>

              {/* Presets & Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Paper Size & Layout Preset Dropdown */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Paper Size & Layout Preset
                  </label>
                  <select
                    value={printPaperSize}
                    onChange={(e) => setPrintPaperSize(e.target.value)}
                    className="bg-slate-50 border-2 border-[#1D56A5] text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none shadow-2xs"
                  >
                    <option value="A3_CARD_21">💳 Standard Card (9.2×5.49 cm) — A3 Sheet (21 Cards)</option>
                    <option value="13x19_SINGLE">📐 13×19 Inch (330×483 mm) — 1 Large QR</option>
                    <option value="13x19_GRID_12">📑 13×19 Inch (330×483 mm) — 12 Stickers (3×4)</option>
                    <option value="13x19_GRID_18">📑 13×19 Inch (330×483 mm) — 18 Stickers (3×6)</option>
                    <option value="A4_GRID_6">📄 A4 Sheet (210×297 mm) — 6 Stickers (2×3)</option>
                    <option value="A3_GRID_8">📄 A3 Sheet (297×420 mm) — 8 Stickers (2×4)</option>
                  </select>
                </div>

                {/* 2. Filter Single QR (Optional) */}
                <div className="flex flex-col relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Sticker(s)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStickerDropdown(!showStickerDropdown)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none flex justify-between items-center w-56 shadow-sm hover:bg-slate-100 transition"
                  >
                    <span>
                      {selectedQRIds.length === 0 ? `Print All (${printItems.length})` : `${selectedQRIds.length} Selected`}
                    </span>
                    <span className="text-slate-400 text-[10px]">▼</span>
                  </button>

                  {showStickerDropdown && (
                    <div className="absolute top-[100%] left-0 mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 max-h-[200px] overflow-y-auto w-56 shadow-2xl flex flex-col space-y-0.5 z-50">
                      <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-200 rounded cursor-pointer border-b border-slate-200 mb-1 sticky top-0 bg-slate-50 z-10 transition">
                        <input
                          type="checkbox"
                          checked={selectedQRIds.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedQRIds([]);
                          }}
                          className="w-3.5 h-3.5 accent-[#1D56A5] cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-800">Print All ({printItems.length})</span>
                      </label>
                      {printItems.map((qr) => (
                        <label key={qr._id} className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-100 rounded cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={selectedQRIds.includes(qr._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQRIds([...selectedQRIds, qr._id]);
                              } else {
                                setSelectedQRIds(selectedQRIds.filter(id => id !== qr._id));
                              }
                            }}
                            className="w-3.5 h-3.5 accent-[#1D56A5] cursor-pointer"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">{qr.copyCode}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 self-end">
                  <button
                    onClick={() => window.print()}
                    className="bg-[#1D56A5] hover:bg-[#164382] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#1D56A5]/25 transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Now</span>
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Printable Content Container */}
            <div id="printable-area" className="bg-white">
              {/* Filtered items */}
              {(() => {
                const displayItems =
                  selectedQRIds.length === 0
                    ? printItems
                    : printItems.filter((q) => selectedQRIds.includes(q._id));

                // 1. SINGLE LARGE 13x19 INCH POSTER / MASTER LAYOUT
                if (printPaperSize === '13x19_SINGLE') {
                  return (
                    <div className="space-y-8">
                      {displayItems.map((qr, idx) => (
                        <div
                          key={qr._id}
                          className={`border-4 border-dashed border-[#1D56A5] rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white min-h-[500px] md:min-h-[680px] print:min-h-[16in] print-no-break ${idx < displayItems.length - 1 ? 'print-page-break' : ''
                            }`}
                        >
                          {/* Cut Guide Line */}
                          <div className="w-full flex justify-between text-[11px] font-mono text-slate-400 mb-6 print:mb-8 border-b border-dashed border-slate-300 pb-2">
                            <span>✁ CUTTING BOUNDARY (13×19 INCH FORMAT)</span>
                            <span>STICKER ID: {qr.copyCode}</span>
                          </div>

                          {/* Brand Header */}
                          <div className="flex items-center justify-center space-x-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#1D56A5] text-white flex items-center justify-center font-black text-xl shadow-md">
                              SD
                            </div>
                            <div className="text-left">
                              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">SAFE DRIVE</h1>
                              <p className="text-xs font-bold text-[#E94E1A] tracking-widest uppercase">Smart Vehicle Safety Protection</p>
                            </div>
                          </div>

                          {/* Identification Badge */}
                          <div className="bg-[#E9DFEE] text-[#1D56A5] font-mono font-black text-2xl sm:text-3xl px-8 py-2 rounded-2xl mb-3 border border-[#1D56A5]/25">
                            {qr.copyCode}
                          </div>

                          {/* 4-Digit Security PIN for Non-Vehicle Tags */}
                          {qr.securityCode && (
                            <div className="bg-amber-100 text-amber-950 border-2 border-amber-400 font-mono font-black text-lg sm:text-xl px-6 py-1.5 rounded-xl mb-5 shadow-xs">
                              🔑 TAG PIN: <span className="tracking-widest">{qr.securityCode}</span>
                            </div>
                          )}

                          {/* Large High-Res QR */}
                          <div className="p-6 sm:p-8 bg-white border-4 border-slate-900 rounded-3xl shadow-xl mb-6">
                            <SafeDriveQRCode value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`} size={280} />
                          </div>

                          {/* Action Headline */}
                          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                            SCAN WITH CAMERA OR GOOGLE LENS
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-md mb-6">
                            {qr.securityCode
                              ? 'Scan to contact item owner securely (Requires 4-Digit PIN printed above)'
                              : 'To contact vehicle owner instantly & securely without sharing personal mobile number'}
                          </p>

                          {/* Footer Info */}
                          <div className="w-full flex justify-between items-center text-xs text-slate-500 font-mono pt-4 border-t border-slate-200">
                            <span>Batch: <strong>{qr.batchId}</strong></span>
                            <span>Type: <strong>{qr.qrFor || qr.qrType}</strong></span>
                            <span>Safe Drive Official QR</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // 2. NEW CARD FORMAT (9.2cm x 5.49cm)
                if (printPaperSize === 'A3_CARD_21') {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-x-0 print:gap-y-1 place-items-center" style={{ width: '100%', maxWidth: '29.7cm', margin: '0 auto' }}>
                      {displayItems.map((qr) => (
                        <div
                          key={qr._id}
                          className="relative print-no-break overflow-hidden shadow-sm border border-slate-200 print:border print:border-dashed print:border-slate-400 print:shadow-none"
                          style={{
                            width: '9.2cm',
                            height: '5.49cm',
                            backgroundImage: `url('/card_bg.png')`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                          }}
                        >
                          {/* QR Code container tightly bound to the white rounded box in the image */}
                          <div
                            className="absolute flex items-center justify-center bg-transparent z-10"
                            style={{
                              left: '58%',
                              top: '9%',
                              width: '37%',
                              height: '66%',
                            }}
                          >
                            <SafeDriveQRCode
                              value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`}
                              size={150}
                              className="w-full h-full object-contain"
                              includeMargin={false}
                            />
                            
                            {/* ID or PIN Badge explicitly pinned to bottom center of this box */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                              {qr.securityCode ? (
                                <div className="bg-[#259A3A] text-white font-mono font-black text-[7px] px-1.5 py-0.5 rounded-sm shadow-xs border border-[#259A3A]/50 whitespace-nowrap">
                                  PIN: {qr.securityCode}
                                </div>
                              ) : (
                                <div className="bg-[#259A3A] text-white font-mono font-black text-[7px] px-1.5 py-0.5 rounded-sm shadow-xs border border-[#259A3A]/50 whitespace-nowrap">
                                  ID: {qr.copyCode}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // 3. 13x19 INCH (3x4 or 3x6 Grid) or A4 / A3 Multi-Sticker Sheet
                const gridClass =
                  printPaperSize === '13x19_GRID_18'
                    ? 'grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3'
                    : printPaperSize === '13x19_GRID_12'
                      ? 'grid grid-cols-2 sm:grid-cols-3 gap-5 print:grid-cols-3 print:gap-4'
                      : printPaperSize === 'A3_GRID_8'
                        ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-2 print:gap-4'
                        : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3';

                return (
                  <div className={gridClass}>
                    {displayItems.map((qr) => (
                      <div
                        key={qr._id}
                        className="border-2 border-dashed border-slate-400 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-between text-center bg-white print-no-break relative"
                      >
                        {/* Top Cut Scissors Icon */}
                        <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400 mb-2">
                          <span>✁ CUT HERE</span>
                          <span className="font-bold text-[#1D56A5]">{qr.qrFor || qr.qrType || 'Car'}</span>
                        </div>

                        {/* Brand Banner */}
                        <div className="text-[10px] font-black tracking-widest text-[#1D56A5] uppercase mb-1">
                          SAFE DRIVE
                        </div>

                        {/* Code Title */}
                        <div className="text-base font-black text-slate-900 font-mono tracking-tight mb-1">
                          {qr.copyCode}
                        </div>

                        {/* 4-Digit PIN badge if Non-Vehicle */}
                        {qr.securityCode && (
                          <div className="bg-amber-100 text-amber-950 border border-amber-300 font-mono font-black text-xs px-2.5 py-0.5 rounded-md mb-2">
                            PIN: <span className="tracking-widest">{qr.securityCode}</span>
                          </div>
                        )}

                        {/* QR Code */}
                        <div className="p-2.5 bg-white border border-slate-300 rounded-xl shadow-2xs mb-2">
                          <SafeDriveQRCode
                            value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`}
                            size={printPaperSize === '13x19_GRID_18' ? 120 : 145}
                          />
                        </div>

                        {/* Instructions */}
                        <div className="text-[11px] font-bold text-slate-900 leading-tight">
                          SCAN TO CONTACT OWNER
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-1">
                          Group: {qr.batchId}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 8. DIGITAL CARD DOWNLOAD MODAL */}
      {downloadDigitalQR && (
        <DigitalCardModal
          qr={downloadDigitalQR}
          onClose={() => setDownloadDigitalQR(null)}
          PUBLIC_SCAN_BASE={PUBLIC_SCAN_BASE}
        />
      )}
    </div>
  );
}

