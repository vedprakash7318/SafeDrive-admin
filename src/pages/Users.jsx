import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users as UsersIcon, RefreshCw, Car } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Users() {
  const { authHeader } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, authHeader);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (u) => {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Set user ${u.name} status to ${nextStatus}?`)) return;
    try {
      await axios.put(`${API_BASE}/admin/users/${u._id}/status`, { status: nextStatus }, authHeader);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <UsersIcon className="w-7 h-7 text-blue-600" />
            <span>Registered User Accounts</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vehicle owners and linked registration profiles</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Protected Vehicles</th>
                <th className="px-6 py-4">Linked QR Codes</th>
                <th className="px-6 py-4">Quota Balance</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.phone}</div>
                    <div className="text-[11px] text-slate-400">{u.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    {u.vehicles?.map((v) => (
                      <div key={v._id} className="text-xs font-mono font-semibold text-slate-700">
                        {v.vehicleBrand} {v.vehicleName} ({v.vehicleNumber})
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    {u.qrs?.map((q) => (
                      <span key={q._id} className="inline-block bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded-lg mr-1 font-bold">
                        {q.copyCode}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <div className="text-emerald-700 font-bold">{u.wallet?.callBalance || 0} Calls</div>
                    <div className="text-blue-700 font-bold">{u.wallet?.messageBalance || 0} Msgs</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
