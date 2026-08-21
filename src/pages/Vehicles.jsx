import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, RefreshCw, Phone } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Vehicles() {
  const { authHeader } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center space-x-3">
            <Car className="w-7 h-7 text-indigo-600" />
            <span>Vehicles Registry</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">All vehicles registered under Safe Drive protection</p>
        </div>
        <button
          onClick={fetchVehicles}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v._id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {v.vehicleBrand} {v.vehicleName}
                </h3>
                <div className="font-mono text-sm text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl inline-block mt-1">
                  {v.vehicleNumber}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-2xl">
                <Car className="w-5 h-5" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Name:</span>
                <span className="font-bold text-slate-900">{v.userId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-semibold text-slate-700">{v.userId?.phone}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="font-bold text-slate-700 mb-2">Emergency Contacts (2):</div>
                {v.emergencyContacts?.map((c, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl mb-1.5 border border-slate-100">
                    <span className="text-slate-700 font-medium">{c.name}</span>
                    <span className="font-mono font-bold text-emerald-700">{c.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
