import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Plus, X, Phone, MapPin, Building2, Smartphone } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

const Partners = () => {
  const { authHeader } = useAuth();
  const navigate = useNavigate();
  const [Partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', shopName: '', address: '', gender: 'MALE', city: '', state: '', pincode: '', landmark: ''
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/dealers`, authHeader);
      if (res.data.success) {
        setPartners(res.data.dealers);
      }
    } catch (error) {
      toast.error('Failed to load Partners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/dealers/${id}/verify`, {}, authHeader);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPartners();
      }
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/dealers`, formData, authHeader);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowModal(false);
        setFormData({ name: '', phone: '', email: '', shopName: '', address: '', gender: 'MALE', city: '', state: '', pincode: '', landmark: '' });
        fetchPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Partner');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <UsersIcon className="w-7 h-7 text-[#16A34A]" />
            <span>Partners Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your network of Partners, view their QR inventory and track activations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#16A34A] to-[#14532d] hover:from-[#15803d] hover:to-[#166534] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#16A34A]/30 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner</span>
        </button>
      </div>

      {/* 2. PartnerS TABLE */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading Partners...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Partner Details</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Inventory Stats</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Partners.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs">
                      No Partners found. Click 'Add New Partner' to create one.
                    </td>
                  </tr>
                ) : (
                  Partners.map((d) => (
                    <tr key={d._id} className="hover:bg-[#16A34A]/5 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{d.name}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-2 text-slate-600 font-mono text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.city || 'N/A'}, {d.state || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-slate-500 w-16 uppercase tracking-wider font-bold">Total:</span>
                            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2 py-0.5 rounded border border-slate-200">
                              {d.totalQRs}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-[#16A34A] w-16 uppercase tracking-wider font-bold">Active:</span>
                            <span className="bg-emerald-50 text-[#16A34A] font-bold text-xs px-2 py-0.5 rounded border border-[#16A34A]/20">
                              {d.activeQRs}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleVerify(d._id, d.isVerifiedPartner)}
                          className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded shadow-sm transition ${
                            d.isVerifiedPartner 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {d.isVerifiedPartner ? 'Verified ✓' : 'Unverified'}
                        </button>
                      </td>
                      
                      <td className="px-6 py-3.5 align-middle text-right">
                        <button
                          onClick={() => navigate(`/dealers/${d._id}`)}
                          className="bg-[#1D56A5]/10 text-[#1D56A5] hover:bg-[#1D56A5] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          View Progress
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ADD Partner MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl my-6">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-[#16A34A]" />
                  <span>Add New Partner</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Create a new Partner account. They can login using their phone number.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Partner Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number *</label>
                  <input 
                    required 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Shop Name</label>
                  <input 
                    type="text" 
                    name="shopName" 
                    value={formData.shopName} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="e.g. Sharma Motors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Shop Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                  placeholder="Full Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pincode *</label>
                  <input 
                    required
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="Pincode"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Landmark</label>
                  <input 
                    type="text" 
                    name="landmark" 
                    value={formData.landmark} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] transition" 
                    placeholder="Landmark"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-xl shadow-lg shadow-[#16A34A]/30 transition"
                >
                  Save Partner
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
