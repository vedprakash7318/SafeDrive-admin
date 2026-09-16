import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function FAQs() {
  const { authHeader } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({
    id: null,
    question: '',
    answer: '',
    isActive: true,
    showOnHome: false,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/faqs`, authHeader);
      if (res.data.success) {
        setFaqs(res.data.faqs);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setMessage('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete FAQ? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_BASE}/admin/faqs/${id}`, authHeader);
      if (res.data.success) {
        setMessage('FAQ deleted successfully');
        fetchFaqs();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive }, authHeader);
      if (res.data.success) {
        fetchFaqs();
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to update FAQ status');
    }
  };

  const openAddModal = () => {
    setCurrentFaq({ id: null, question: '', answer: '', isActive: true, showOnHome: false });
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setCurrentFaq({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      showOnHome: faq.showOnHome || false,
    });
    setIsModalOpen(true);
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentFaq.id) {
        // Update
        const res = await axios.put(`${API_BASE}/admin/faqs/${currentFaq.id}`, currentFaq, authHeader);
        if (res.data.success) {
          setMessage('FAQ updated');
        }
      } else {
        // Create
        const res = await axios.post(`${API_BASE}/admin/faqs`, currentFaq, authHeader);
        if (res.data.success) {
          setMessage('FAQ created');
        }
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (error) {
      console.error('Save error:', error);
      alert(error.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
            <span>Manage FAQs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, or disable Frequently Asked Questions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchFaqs}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" /> 
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex items-center gap-3 shadow-sm">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search questions or answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-900 w-full placeholder-slate-400 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No FAQs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Question</th>
                  <th className="px-6 py-4 font-semibold">Answer</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaqs.map((faq) => (
                  <tr key={faq._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-[200px] truncate">
                      {faq.question}
                    </td>
                    <td className="px-6 py-4 max-w-[300px] truncate text-slate-500" title={faq.answer}>
                      {faq.answer}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(faq)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-colors ${
                          faq.isActive 
                            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {faq.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq._id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                {currentFaq.id ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={saveFaq} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={currentFaq.question}
                  onChange={(e) => setCurrentFaq({...currentFaq, question: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm"
                  placeholder="e.g. What is safedrivetag?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Answer</label>
                <textarea
                  required
                  rows="4"
                  value={currentFaq.answer}
                  onChange={(e) => setCurrentFaq({...currentFaq, answer: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none text-sm shadow-sm"
                  placeholder="Enter the detailed answer..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={currentFaq.isActive}
                  onChange={(e) => setCurrentFaq({...currentFaq, isActive: e.target.checked})}
                  className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-white"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Active (Show on website)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="showOnHome"
                  checked={currentFaq.showOnHome}
                  onChange={(e) => setCurrentFaq({...currentFaq, showOnHome: e.target.checked})}
                  className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-white"
                />
                <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700">
                  Show on Home Page (Will show on both Home & Contact if active)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-lg font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50 text-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
