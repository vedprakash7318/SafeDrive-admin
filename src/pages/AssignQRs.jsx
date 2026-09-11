import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckSquare, Square, Search, UserPlus, QrCode, X, AlertTriangle } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

const AssignQRs = () => {
  const { authHeader } = useAuth();
  const [batches, setBatches] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [dealerSearch, setDealerSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchRes, dealerRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/qr/batches`, authHeader),
        axios.get(`${API_BASE}/admin/dealers`, authHeader)
      ]);

      if (batchRes.data.success) {
        setBatches(batchRes.data.groups || []);
      }
      if (dealerRes.data.success) {
        setDealers(dealerRes.data.dealers || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleBatch = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(selectedBatches.filter(id => id !== batchId));
    } else {
      setSelectedBatches([...selectedBatches, batchId]);
    }
  };

  const handleAssign = async () => {
    if (!selectedDealerId) {
      toast.error('Please select a dealer');
      return;
    }
    
    try {
      const res = await axios.post(`${API_BASE}/admin/dealers/assign-qr`, {
        dealerId: selectedDealerId,
        assignmentType: 'BATCHES',
        batchIds: selectedBatches
      }, authHeader);
      
      if (res.data.success) {
        toast.success(res.data.message);
        setShowAssignModal(false);
        setSelectedBatches([]);
        setSelectedDealerId('');
        fetchData(); // refresh batches (they might be hidden if already assigned)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(dealerSearch.toLowerCase()) || 
    d.phone.includes(dealerSearch)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <QrCode className="w-7 h-7 text-[#16A34A]" />
            <span>Assign QRs to Dealers</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select unassigned QR batches and transfer them to your dealer network
          </p>
        </div>

        {selectedBatches.length > 0 && (
          <button 
            onClick={() => setShowAssignModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#16A34A] to-[#14532d] hover:from-[#15803d] hover:to-[#166534] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#16A34A]/30 transition active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign {selectedBatches.length} Batches</span>
          </button>
        )}
      </div>

      {/* 2. BATCHES TABLE */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading inventory...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 w-12 text-center">Select</th>
                  <th className="px-6 py-3.5">Batch Details</th>
                  <th className="px-6 py-3.5">Total QRs</th>
                  <th className="px-6 py-3.5">Date Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs">
                      No unassigned batches available. Generate new batches in QR Inventory first.
                    </td>
                  </tr>
                ) : (
                  batches.map(batch => {
                    const isSelected = selectedBatches.includes(batch._id);
                    return (
                      <tr 
                        key={batch._id} 
                        className={`transition ${isSelected ? 'bg-[#16A34A]/10' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-6 py-3.5 text-center cursor-pointer" onClick={() => toggleBatch(batch._id)}>
                          <div className="flex justify-center items-center">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-3.5" onClick={() => toggleBatch(batch._id)}>
                          <div className="font-mono font-black text-slate-900 text-sm">
                            {batch._id}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Physical Tags</div>
                        </td>

                        <td className="px-6 py-3.5">
                          <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded border border-slate-200">
                            {batch.count} QRs
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-slate-500 font-medium">
                          {new Date(batch.createdAt || new Date()).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
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

      {/* 3. ASSIGN DEALER MODAL */}
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
                  Assigning {selectedBatches.length} batches to the selected dealer.
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
              {filteredDealers.map(dealer => (
                <div 
                  key={dealer._id}
                  onClick={() => setSelectedDealerId(dealer._id)}
                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition mb-1 last:mb-0 ${
                    selectedDealerId === dealer._id 
                      ? 'bg-white border-2 border-[#16A34A] shadow-sm' 
                      : 'hover:bg-white border-2 border-transparent'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{dealer.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{dealer.phone}</p>
                  </div>
                  {selectedDealerId === dealer._id && (
                    <div className="bg-emerald-100 text-[#16A34A] p-1 rounded-full">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {filteredDealers.length === 0 && (
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
                onClick={handleAssign}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-xl shadow-lg shadow-[#16A34A]/30 transition disabled:opacity-50 disabled:shadow-none"
                disabled={!selectedDealerId}
              >
                Confirm Assignment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AssignQRs;
