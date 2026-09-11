import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings, RefreshCw } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function GlobalSettings() {
  const { authHeader } = useAuth();
  const [settings, setSettings] = useState({
    pushNotificationCooldownSeconds: 30,
    pushNotificationRateLimitHours: 12,
    pushNotificationRateLimitCount: 10,
    callCooldownSeconds: 60,
    callRateLimitHours: 12,
    callRateLimitCount: 5,
    messageCooldownSeconds: 30,
    messageRateLimitHours: 12,
    messageRateLimitCount: 10,
    sosCooldownSeconds: 60,
    sosRateLimitHours: 12,
    sosRateLimitCount: 3,
    isCODEnabled: true,
    partnerDashboardMessage: 'Welcome to your new Partner Portal. Manage your inventory, activate tags for your customers, and track your sales all in one place.'
  });
  const [activeTab, setActiveTab] = useState(localStorage.getItem('globalSettingsTab') || 'push');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
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
      setInitialLoad(false);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Global System Settings</h1>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 pt-4 space-x-6">
          <button
            onClick={() => { setActiveTab('push'); localStorage.setItem('globalSettingsTab', 'push'); }}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'push' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Push Notifications
          </button>
          <button
            onClick={() => { setActiveTab('call'); localStorage.setItem('globalSettingsTab', 'call'); }}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'call' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Calls
          </button>
          <button
            onClick={() => { setActiveTab('message'); localStorage.setItem('globalSettingsTab', 'message'); }}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'message' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => { setActiveTab('sos'); localStorage.setItem('globalSettingsTab', 'sos'); }}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'sos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            SOS Alerts
          </button>
          <button
            onClick={() => { setActiveTab('payment'); localStorage.setItem('globalSettingsTab', 'payment'); }}
            className={`pb-3 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'payment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Payment Methods
          </button>
        </div>

        {initialLoad ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === 'push' && (
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
          )}

          {activeTab === 'call' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Call Cooldown (Seconds)</label>
                <input
                  type="number"
                  name="callCooldownSeconds"
                  value={settings.callCooldownSeconds || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-slate-500">Wait time before same device/IP can initiate another call.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rate Limit Hours</label>
                <input
                  type="number"
                  name="callRateLimitHours"
                  value={settings.callRateLimitHours || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
                <p className="text-xs text-slate-500">Time window in hours for the limit below.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Max Call Limit</label>
                <input
                  type="number"
                  name="callRateLimitCount"
                  value={settings.callRateLimitCount || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
                <p className="text-xs text-slate-500">Maximum calls allowed per device/IP in the specified time window.</p>
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message Cooldown (Seconds)</label>
                <input
                  type="number"
                  name="messageCooldownSeconds"
                  value={settings.messageCooldownSeconds}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Wait time before same device can send another message.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rate Limit Hours</label>
                <input
                  type="number"
                  name="messageRateLimitHours"
                  value={settings.messageRateLimitHours}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Time window in hours for the limit below.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Max Message Limit</label>
                <input
                  type="number"
                  name="messageRateLimitCount"
                  value={settings.messageRateLimitCount}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Maximum messages allowed per device/IP in the specified time window.</p>
              </div>
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">SOS Cooldown (Seconds)</label>
                <input
                  type="number"
                  name="sosCooldownSeconds"
                  value={settings.sosCooldownSeconds}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Wait time before same device can send another SOS.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rate Limit Hours</label>
                <input
                  type="number"
                  name="sosRateLimitHours"
                  value={settings.sosRateLimitHours}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Time window in hours for the limit below.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Max SOS Limit</label>
                <input
                  type="number"
                  name="sosRateLimitCount"
                  value={settings.sosRateLimitCount}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  required
                />
                <p className="text-xs text-slate-500">Maximum SOS alerts allowed per device/IP in the specified time window.</p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 border rounded-xl bg-slate-50">
                <input
                  type="checkbox"
                  name="isCODEnabled"
                  checked={settings.isCODEnabled}
                  onChange={(e) => setSettings({ ...settings, isCODEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Enable Cash On Delivery (COD)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">If disabled, users will only see Razorpay options for online payment.</p>
                </div>
              </div>
            </div>
          )}

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
        )}
      </div>
    </div>
  );
}
