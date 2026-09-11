import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Users, Search, QrCode, CheckCircle, Clock, 
  MapPin, Phone, Mail, Building2, BarChart3, Calendar, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { toast } from 'react-toastify';
import { useAuth, API_BASE } from '../context/AuthContext';

const PartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  
  const [Partner, setPartner] = useState(null);
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [chartView, setChartView] = useState('MONTHLY'); // 'WEEKLY', 'MONTHLY', 'YEARLY'
  
  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const [resQrs, resPartners] = await Promise.all([
        axios.get(`${API_BASE}/admin/dealers/${id}/qrs`, authHeader),
        axios.get(`${API_BASE}/admin/dealers`, authHeader)
      ]);
      
      if (resQrs.data.success) {
        setQrs(resQrs.data.qrs);
      }
      
      if (resPartners.data.success) {
        const foundPartner = resPartners.data.dealers.find(d => d._id === id);
        if (foundPartner) setPartner(foundPartner);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Partner details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPartnerData();
  }, [id]);

  const handleVerify = async () => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/dealers/${id}/verify`, {}, authHeader);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPartnerData(); // Refresh details
      }
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  // Derived metrics
  const activeQrs = qrs.filter(q => q.status === 'ACTIVE' || q.status === 'SOLD');
  const pendingQrs = qrs.filter(q => q.status !== 'ACTIVE' && q.status !== 'SOLD');
  const successRate = qrs.length > 0 ? Math.round((activeQrs.length / qrs.length) * 100) : 0;

  // Search filtering
  const filteredQrs = qrs.filter(qr => {
    if (activeTab === 'ACTIVE' && qr.status !== 'ACTIVE' && qr.status !== 'SOLD') return false;
    if (activeTab === 'PENDING' && (qr.status === 'ACTIVE' || qr.status === 'SOLD')) return false;
    
    return (qr.copyCode && qr.copyCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (qr.activationPhone && qr.activationPhone.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Chart Data Processing
  const chartData = useMemo(() => {
    if (!activeQrs.length) return [];
    
    const counts = {};
    const now = new Date();
    
    activeQrs.forEach(qr => {
      // Use activationDate or updatedAt as fallback for activation date
      const d = new Date(qr.activationDate || qr.updatedAt);
      let key = '';
      
      if (chartView === 'MONTHLY') {
        // Group by Month (e.g. "Jan", "Feb")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = monthNames[d.getMonth()];
      } else if (chartView === 'WEEKLY') {
        // Group by Week (e.g. "Week 1", "Week 2")
        const start = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d - start) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil(days / 7);
        key = `Wk ${weekNum}`;
      } else if (chartView === 'YEARLY') {
        // Group by Year
        key = d.getFullYear().toString();
      }
      
      counts[key] = (counts[key] || 0) + 1;
    });

    // Format for Recharts
    const sortedKeys = chartView === 'MONTHLY' 
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].filter(k => counts[k] !== undefined)
      : Object.keys(counts).sort();

    return sortedKeys.map(key => ({
      name: key,
      Activations: counts[key]
    }));
  }, [activeQrs, chartView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1D56A5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/dealers')}
          className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-xs"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Partner Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track sales, activations, and inventory for this Partner</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold">
          {error}
        </div>
      )}

      {/* 2. Profile & KPI Section */}
      {Partner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Partner Profile Card */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Building2 className="w-32 h-32" />
            </div>
            
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1D56A5] to-blue-800 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-900/20">
                {Partner.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{Partner.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${Partner.isVerifiedPartner ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'} flex items-center`}>
                    {Partner.isVerifiedPartner && <ShieldCheck className="w-3.5 h-3.5 mr-1" />} 
                    {Partner.isVerifiedPartner ? 'Verified Partner' : 'Unverified Partner'}
                  </div>
                  <button onClick={handleVerify} className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition">
                    Toggle Status
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {Partner.shopName && (
                <div className="flex items-center text-sm text-slate-600">
                  <Building2 className="w-4 h-4 mr-3 text-slate-400" />
                  <span className="font-bold">{Partner.shopName}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-slate-600">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                <span className="font-medium">{Partner.phone}</span>
              </div>
              {Partner.email && (
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-3 text-slate-400" />
                  <span className="font-medium">{Partner.email}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                <span className="font-medium">
                  {[Partner.address, Partner.city, Partner.state, Partner.pincode].filter(Boolean).join(', ') || 'Address not provided'}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                <span className="font-medium">Joined {new Date(Partner.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5 text-[#1D56A5]" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Assigned</p>
                <p className="text-3xl font-black text-slate-900">{qrs.length}</p>
              </div>
            </div>
            
            <div className="bg-white border border-emerald-200/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent"></div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 relative z-10">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider mb-1">Total Sold (Active)</p>
                <p className="text-3xl font-black text-emerald-700">{activeQrs.length}</p>
              </div>
            </div>

            <div className="bg-white border border-amber-200/60 rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent"></div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4 relative z-10">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider mb-1">In Stock (Pending)</p>
                <p className="text-3xl font-black text-amber-700">{pendingQrs.length}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 shadow-lg shadow-slate-900/20 flex flex-col justify-between text-white">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mb-1">Success Rate</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-3xl font-black">{successRate}</p>
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Charts Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#16A34A]" /> Activation Progress
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Visualize how many QRs this Partner has activated over time</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-full w-fit shadow-inner">
            {['WEEKLY', 'MONTHLY', 'YEARLY'].map(view => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition ${
                  chartView === view
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {view.charAt(0) + view.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#16A34A', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="Activations" 
                  fill="#16A34A" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-12 h-12 mb-3 text-slate-200" />
              <p className="font-medium text-sm">No activations yet to display chart.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Assigned QRs List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h2 className="font-black text-slate-900 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-[#1D56A5]" /> QR Inventory ({filteredQrs.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-200/50 p-1 rounded-full w-fit">
              {['ALL', 'ACTIVE', 'PENDING'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    activeTab === tab
                      ? 'bg-white text-[#1D56A5] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'ALL' ? 'All QRs' : tab === 'ACTIVE' ? 'Sold' : 'In Stock'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search QR ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#1D56A5] focus:ring-2 focus:ring-[#1D56A5]/10 transition"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">QR ID</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Assigned On</th>
                <th className="px-6 py-4">Activated On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQrs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-500 text-sm font-medium">
                    {searchTerm ? 'No matching QRs found.' : 'No QRs assigned to this Partner yet.'}
                  </td>
                </tr>
              ) : (
                filteredQrs.map((qr) => (
                  <tr key={qr._id} className="hover:bg-[#1D56A5]/5 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded-md">{qr.copyCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      {qr.status === 'ACTIVE' || qr.status === 'SOLD' ? (
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200 flex w-fit items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-200 flex w-fit items-center">
                          <Clock className="w-3 h-3 mr-1" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {qr.updatedAt ? new Date(qr.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {(qr.status === 'ACTIVE' || qr.status === 'SOLD') && qr.activationDate 
                        ? new Date(qr.activationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetails;
