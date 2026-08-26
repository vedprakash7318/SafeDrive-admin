import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function GlobalSettings() {
  const { authHeader } = useAuth();
  const [settings, setSettings] = useState({
    pushNotificationCooldownSeconds: 30,
    pushNotificationRateLimitHours: 12,
    pushNotificationRateLimitCount: 10
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/settings`, authHeader);
      if (res.data.success && res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.put(`${API_BASE}/admin/settings`, settings, authHeader);
      if (res.data.success) {
        setMessage('Settings updated successfully.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Global System Settings</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Push Notification Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Push Cooldown (Seconds)</label>
              <input
                type="number"
                name="pushNotificationCooldownSeconds"
                value={settings.pushNotificationCooldownSeconds}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
              <p className="text-xs text-slate-500">Wait time before same device can send another push notification.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Rate Limit Hours</label>
              <input
                type="number"
                name="pushNotificationRateLimitHours"
                value={settings.pushNotificationRateLimitHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
              <p className="text-xs text-slate-500">Time window in hours for the limit below.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Max Push Limit</label>
              <input
                type="number"
                name="pushNotificationRateLimitCount"
                value={settings.pushNotificationRateLimitCount}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
              <p className="text-xs text-slate-500">Maximum push notifications allowed per device/IP in the specified time window.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
