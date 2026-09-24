import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Globe, Tag } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function WebsitePricingSettings() {
  const { authHeader } = useAuth();
  
  const [pricingCards, setPricingCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/settings`, authHeader);
      if (res.data.success && res.data.settings) {
        if (res.data.settings.homepagePricing) {
          setPricingCards(res.data.settings.homepagePricing);
        } else {
          setPricingCards([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
      toast.error('Failed to load pricing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/admin/settings`, { homepagePricing: pricingCards }, authHeader);
      if (res.data.success) {
        toast.success('Website pricing cards saved successfully!');
      } else {
        toast.error(res.data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error(err.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = () => {
    setPricingCards([
      ...pricingCards,
      {
        cardType: 'PHYSICAL',
        title: 'New Plan',
        description: 'Plan description here...',
        price: 299,
        originalPrice: 499,
        features: ['Delivered in 3-5 days', '100% Privacy Preserved', 'Instant SMS Alerts']
      }
    ]);
  };

  const handleRemoveCard = (index) => {
    Swal.fire({
      title: 'Remove this card?',
      text: "It will be removed from the public website.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E94E1A',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const newCards = [...pricingCards];
        newCards.splice(index, 1);
        setPricingCards(newCards);
      }
    });
  };

  const handleChange = (index, field, value) => {
    const newCards = [...pricingCards];
    newCards[index][field] = value;
    setPricingCards(newCards);
  };

  const handleFeaturesChange = (index, text) => {
    const newCards = [...pricingCards];
    newCards[index].features = text.split('\\n').filter(f => f.trim() !== '');
    setPricingCards(newCards);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center">
            <Globe className="w-6 h-6 mr-3 text-emerald-600" />
            Website Pricing Plans
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage the pricing cards shown on the public homepage "Choose Your Protection" section.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddCard}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center disabled:opacity-50 shadow-md shadow-emerald-600/20"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {pricingCards.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-slate-200 shadow-sm">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Pricing Cards</h3>
          <p className="text-slate-500 text-sm mb-4">You haven't added any pricing plans to your website yet.</p>
          <button onClick={handleAddCard} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add First Plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricingCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative group hover:border-emerald-300 transition-colors">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => handleRemoveCard(index)}
                  className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                  title="Remove Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className={`p-4 border-b ${card.cardType === 'PHYSICAL' ? 'bg-orange-50/50 border-orange-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${card.cardType === 'PHYSICAL' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                  Card #{index + 1}
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Card Theme / Type</label>
                  <select
                    value={card.cardType}
                    onChange={(e) => handleChange(index, 'cardType', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PHYSICAL">Physical QR (Orange Theme)</option>
                    <option value="DIGITAL">Digital Pass (Green Theme)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Plan Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Physical QR Kit"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Description</label>
                  <textarea
                    value={card.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="Short description under the title..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={card.price}
                      onChange={(e) => handleChange(index, 'price', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">MRP / Original (₹)</label>
                    <input
                      type="number"
                      value={card.originalPrice}
                      onChange={(e) => handleChange(index, 'originalPrice', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex justify-between">
                    <span>Features (One per line)</span>
                    <span className="text-slate-400 font-normal">{card.features?.length || 0} items</span>
                  </label>
                  <textarea
                    value={card.features ? card.features.join('\n') : ''}
                    onChange={(e) => handleFeaturesChange(index, e.target.value)}
                    rows="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Delivered in 3-5 days\n100% Privacy Preserved\nInstant SMS Alerts"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
