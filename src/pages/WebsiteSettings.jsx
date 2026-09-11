import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Globe } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function WebsiteSettings() {
  const { authHeader } = useAuth();
  const [settings, setSettings] = useState({
    websiteOfferText: ''
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
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.put(`${API_BASE}/admin/settings`, settings, authHeader);
      if (res.data.success) {
        setMessage('Website settings saved successfully!');
      } else {
        setMessage(res.data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setMessage(err.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Globe className="w-6 h-6 mr-3 text-blue-400" />
            Website Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage public website content and behavior</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700/60 overflow-hidden shadow-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Header Announcement Banner</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Offer / Announcement Text
              </label>
              <input
                type="text"
                name="websiteOfferText"
                value={settings.websiteOfferText || ''}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter offer text here..."
              />
              <p className="text-xs text-slate-500 mt-1">This text appears at the very top of the public website.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
