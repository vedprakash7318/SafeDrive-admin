import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  Clock,
  QrCode,
  Tag,
  DollarSign,
  Layers,
  UploadCloud,
  ImageIcon,
  Lock,
  Eye,
  Box,
  CheckCircle
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function Products() {
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [qrTypes, setQrTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    qrType: 'PHYSICAL', // PHYSICAL or DIGITAL
    qrFor: 'Car', // Vehicle/Asset type: Car, Bike, Luggage, etc.
    qrTypeId: '',
    price: 299,
    originalPrice: 499,
    discount: 200,
    initialCalls: 10,
    initialMessages: 20,
    validityDays: 365,
    renewalAmount: 199,
    featuresText: 'Instant Masked Calling to Owner\nWhatsApp Emergency Direct Connect\nAnti-Harassment Plate Verification\n1 Year Cloud Safety Protection'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, typesRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/products`, authHeader),
        axios.get(`${API_BASE}/admin/qr-types`, authHeader).catch(() => ({ data: { success: false, types: [] } }))
      ]);

      if (res.data.success) {
        setProducts(res.data.products);
      }
      if (typesRes.data.success && Array.isArray(typesRes.data.types)) {
        setQrTypes(typesRes.data.types);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cloudinary Single Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_BASE}/admin/products/upload-image`,
        formData,
        {
          headers: {
            ...authHeader.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (res.data.success) {
        setForm((prev) => ({
          ...prev,
          imageUrl: res.data.imageUrl,
          imagePublicId: res.data.imagePublicId
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image to Cloudinary');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setError('');
    const defaultType = qrTypes.length > 0 ? qrTypes[0] : null;
    setForm({
      title: '',
      description: '',
      imageUrl: '',
      imagePublicId: '',
      qrType: 'PHYSICAL',
      qrFor: defaultType ? defaultType.name : 'Car',
      qrTypeId: defaultType ? defaultType._id : '',
      price: 299,
      originalPrice: 499,
      discount: 200,
      initialCalls: 10,
      initialMessages: 20,
      validityDays: 365,
      renewalAmount: 199,
      featuresText: 'Instant Masked Calling to Owner\nWhatsApp Emergency Direct Connect\nAnti-Harassment Plate Verification\n1 Year Full Cloud Protection'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setError('');
    const origPrice = p.originalPrice || (p.price + (p.discount || 0));
    setForm({
      title: p.title || p.name || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      imagePublicId: p.imagePublicId || '',
      qrType: p.qrType || 'PHYSICAL',
      qrFor: p.qrFor || 'Car',
      qrTypeId: p.qrTypeId || '',
      price: p.price,
      originalPrice: origPrice,
      discount: p.discount || (origPrice > p.price ? origPrice - p.price : 0),
      initialCalls: p.initialCalls || 10,
      initialMessages: p.initialMessages || 20,
      validityDays: p.validityDays || 365,
      renewalAmount: p.renewalAmount || 199,
      featuresText: (p.features || []).join('\n')
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      setError('Please fill in Product Title and Price.');
      return;
    }

    setSaving(true);
    setError('');

    const features = form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanPrice = Number(form.price);
    const cleanOrig = Number(form.originalPrice) || 0;
    const cleanDisc = cleanOrig > cleanPrice ? cleanOrig - cleanPrice : Number(form.discount) || 0;

    const payload = {
      title: form.title.trim(),
      name: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      imagePublicId: form.imagePublicId,
      qrType: form.qrType,
      qrFor: (form.qrFor || 'Car').trim(),
      qrTypeId: form.qrTypeId || undefined,
      price: cleanPrice,
      originalPrice: cleanOrig,
      discount: cleanDisc,
      initialCalls: Number(form.initialCalls),
      initialMessages: Number(form.initialMessages),
      validityDays: Number(form.validityDays),
      renewalAmount: Number(form.renewalAmount),
      features
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE}/admin/products/${editingProduct._id}`, payload, authHeader);
      } else {
        await axios.post(`${API_BASE}/admin/products`, payload, authHeader);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!confirm(`Delete product ${p.name || p.title}?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/products/${p._id}`, authHeader);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <ShoppingBag className="w-7 h-7 text-[#1D56A5]" />
            <span>Product Catalog & Pricing</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create store products, bind QR Groups, and configure free calls, messages, price, and validity
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#1D56A5]/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh"
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 text-[#1D56A5] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. PRODUCTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Type / Format</th>
                <th className="px-6 py-3.5">Price & Discount</th>
                <th className="px-6 py-3.5">Free Quota (Calls / SMS)</th>
                <th className="px-6 py-3.5">Validity & Renewal</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Loading products...' : 'No products found. Click "Add New Product" to create one.'}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const mrp = p.originalPrice || (p.price + (p.discount || 0));
                  const hasDiscount = mrp > p.price;
                  const discountVal = hasDiscount ? (p.discount || (mrp - p.price)) : 0;
                  const discountPct = hasDiscount ? Math.round((discountVal / mrp) * 100) : 0;

                  return (
                    <tr key={p._id} className="hover:bg-[#E9DFEE]/20 transition">
                      {/* 1. Product Title & Image */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title || p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0 cursor-pointer hover:opacity-90"
                              onClick={() => setViewingProduct(p)}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#E9DFEE] text-[#1D56A5] flex items-center justify-center shrink-0 cursor-pointer" onClick={() => setViewingProduct(p)}>
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div
                              onClick={() => setViewingProduct(p)}
                              className="font-bold text-slate-900 text-sm hover:text-[#1D56A5] cursor-pointer transition flex items-center space-x-2"
                            >
                              <span>{p.title || p.name}</span>
                              <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                                Total Sold: {p.soldCount || 0} Units
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Type / Format & Category */}
                      <td className="px-6 py-3.5">
                        <div className="space-y-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center space-x-1 ${
                            p.qrType === 'DIGITAL'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            <span>{p.qrType === 'DIGITAL' ? '💻 DIGITAL PASS' : '📦 PHYSICAL KIT'}</span>
                          </span>
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1D56A5] border border-blue-200 inline-block font-mono">
                              🏷️ For: {p.qrFor || 'Car'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Price & Discount */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-black text-slate-900">₹{p.price}</span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through font-mono">₹{mrp}</span>
                          )}
                        </div>
                        {hasDiscount && (
                          <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            Save ₹{discountVal} ({discountPct}% OFF)
                          </div>
                        )}
                      </td>

                      {/* 4. Free Quota */}
                      <td className="px-6 py-3.5">
                        <div className="space-y-0.5 text-slate-700 font-medium text-[11px]">
                          <div>📞 <strong>{p.initialCalls || 0}</strong> Free Voice Calls</div>
                          <div>💬 <strong>{p.initialMessages || 0}</strong> Free SMS</div>
                        </div>
                      </td>

                      {/* 5. Validity & Renewal */}
                      <td className="px-6 py-3.5">
                        <div className="space-y-0.5 text-slate-700 font-medium text-[11px]">
                          <div className="text-[#1D56A5] font-bold">🛡️ {p.validityDays || 365} Days Validity</div>
                          <div className="text-slate-500">Renewal: ₹{p.renewalAmount || 199}/yr</div>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setViewingProduct(p)}
                          title="View Product Details"
                          className="text-xs bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 border border-slate-200 font-bold px-2.5 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="text-xs bg-[#1D56A5]/10 hover:bg-[#1D56A5] hover:text-white text-[#1D56A5] border border-[#1D56A5]/30 font-bold px-2.5 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p)}
                          title="Delete Product"
                          className="text-xs bg-red-50 hover:bg-[#E94E1A] hover:text-white text-[#E94E1A] border border-[#E94E1A]/30 font-bold px-2.5 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
                  <ShoppingBag className="w-6 h-6 text-[#1D56A5]" />
                  <span>{editingProduct ? 'Edit Product' : 'Create Store Product'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure title, description, pricing, discount, type, and quotas
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-[#E94E1A]/30 rounded-xl text-[#E94E1A] text-xs font-semibold shrink-0">
                {error}
              </div>
            )}

            {/* Modal Body (Scrollable) */}
            <form id="productForm" onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Product Image Upload (Cloudinary) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Image
                </label>
                <div className="flex items-center space-x-4">
                  {form.imageUrl ? (
                    <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1D56A5]/40 shadow-xs">
                      <img
                        src={form.imageUrl}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '', imagePublicId: '' })}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1D56A5] bg-slate-50 hover:bg-[#E9DFEE]/20 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-[#1D56A5]"
                    >
                      {uploadingImage ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-[#1D56A5]" />
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 mb-1" />
                          <span className="text-[9px] font-bold">Upload</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition"
                    >
                      {uploadingImage ? 'Uploading to Cloudinary...' : form.imageUrl ? 'Change Image' : 'Select Image File'}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Safety QR Protection Kit"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Comprehensive protection for your vehicle against accidents & emergency contact..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                />
              </div>

              {/* Type Selection (Physical vs Digital) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, qrType: 'PHYSICAL' })}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      form.qrType === 'PHYSICAL'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.qrType === 'PHYSICAL' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                    }`}>
                      {form.qrType === 'PHYSICAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">📦 PHYSICAL KIT</div>
                      <div className="text-[10px] text-slate-400">Printed Waterproof Stickers</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, qrType: 'DIGITAL' })}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      form.qrType === 'DIGITAL'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.qrType === 'DIGITAL' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {form.qrType === 'DIGITAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">💻 DIGITAL PASS</div>
                      <div className="text-[10px] text-slate-400">Instant E-QR Vehicle Pass</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Product For (Fetched dynamically from QR Types / Settings) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product For *
                </label>
                <select
                  value={form.qrFor}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const matchedType = qrTypes.find(t => t.name === selectedName);
                    setForm({
                      ...form,
                      qrFor: selectedName,
                      qrTypeId: matchedType ? matchedType._id : ''
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                >
                  {qrTypes.length > 0 ? (
                    qrTypes.map((t) => (
                      <option key={t._id} value={t.name}>
                        {t.name} ({t.copiesPerSet || 2} Stickers/Set)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Car">Car (2 Stickers/Set)</option>
                      <option value="Bike">Bike (2 Stickers/Set)</option>
                      <option value="Luggage">Luggage (1 Stickers/Set)</option>
                      <option value="Helmet">Helmet (1 Stickers/Set)</option>
                    </>
                  )}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 This ensures buyers strictly activate only the matching vehicle/item sticker kit.
                </p>
              </div>

              {/* Price, MRP & Discount Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#E9DFEE]/30 p-3.5 rounded-2xl border border-[#1D56A5]/20">
                <div>
                  <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="299"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="499"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#259A3A] uppercase tracking-wider mb-1">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice && form.price && form.originalPrice > form.price ? form.originalPrice - form.price : form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[#259A3A] text-sm font-bold font-mono"
                  />
                </div>
              </div>

              {/* Quota & Validity Configuration Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-[#259A3A] uppercase tracking-wider mb-1">
                    Free Calls
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.initialCalls}
                    onChange={(e) => setForm({ ...form, initialCalls: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1D56A5] uppercase tracking-wider mb-1">
                    Free Messages
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.initialMessages}
                    onChange={(e) => setForm({ ...form, initialMessages: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.validityDays}
                    onChange={(e) => setForm({ ...form, validityDays: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Renewal Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.renewalAmount}
                    onChange={(e) => setForm({ ...form, renewalAmount: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Included Features (1 per line)
                </label>
                <textarea
                  rows="3"
                  placeholder="Feature bullet points..."
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#1D56A5] transition"
                />
              </div>
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="flex space-x-3 p-4 md:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-1/3 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={saving}
                className="w-2/3 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md shadow-[#1D56A5]/25 text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW PRODUCT DETAILS MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1D56A5] text-white flex items-center justify-center font-black shadow-md shadow-[#1D56A5]/25 flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{viewingProduct.title}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      viewingProduct.qrType === 'PHYSICAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {viewingProduct.qrType === 'PHYSICAL' ? '📦 Physical Kit' : '💻 Digital Pass'}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#1D56A5] border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                      🏷️ For {viewingProduct.qrFor || 'Car'}
                    </span>
                    <span className="text-xs text-slate-400">Created {new Date(viewingProduct.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {viewingProduct.imageUrl && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={viewingProduct.imageUrl}
                    alt={viewingProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed">{viewingProduct.description || 'No description provided.'}</p>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#E9DFEE]/40 p-4 rounded-2xl border border-[#1D56A5]/20 flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Selling Price</div>
                  <div className="text-2xl font-black text-[#1D56A5]">₹{viewingProduct.price}</div>
                </div>
                {viewingProduct.originalPrice && viewingProduct.originalPrice > viewingProduct.price && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">MRP</div>
                    <div className="text-sm font-bold line-through text-slate-400">₹{viewingProduct.originalPrice}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">Save ₹{viewingProduct.originalPrice - viewingProduct.price}</div>
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Free Quota</div>
                  <div className="font-bold text-slate-900 mt-0.5">📞 {viewingProduct.initialCalls || 0} Calls • 💬 {viewingProduct.initialMessages || 0} SMS</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Validity & Renewal</div>
                  <div className="font-bold text-slate-900 mt-0.5">⏱️ {viewingProduct.validityDays || 365} Days (₹{viewingProduct.renewalAmount || 199}/yr)</div>
                </div>
              </div>

              {/* Features List */}
              {viewingProduct.features && viewingProduct.features.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Included Features:</div>
                  <div className="space-y-1.5">
                    {viewingProduct.features.map((f, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-[#259A3A] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-2 p-4 md:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="w-1/2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  openEditModal(p);
                }}
                className="w-1/2 bg-[#1D56A5] hover:bg-[#164382] text-white font-bold py-2.5 rounded-xl shadow-md shadow-[#1D56A5]/25 text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
