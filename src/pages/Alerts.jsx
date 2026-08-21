import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Alerts() {
  const { authHeader } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/emergency-alerts`, authHeader);
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-red-600" />
            <span>Emergency Alerts Log</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live audit log of all emergency alerts triggered by QR scanners</p>
        </div>
        <button
          onClick={fetchAlerts}
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
                <th className="px-6 py-4">Triggered Time</th>
                <th className="px-6 py-4">Vehicle Plate</th>
                <th className="px-6 py-4">Owner Name</th>
                <th className="px-6 py-4">IP / Device</th>
                <th className="px-6 py-4">Notified Contacts</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{a.vehicleNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{a.ownerName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{a.ip}</td>
                  <td className="px-6 py-4 text-xs text-slate-700">
                    {a.notifiedContacts?.map((c, i) => (
                      <div key={i}>
                        {c.name}: <span className="font-mono font-bold text-emerald-700">{c.number}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                      {a.alertStatus}
                    </span>
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
