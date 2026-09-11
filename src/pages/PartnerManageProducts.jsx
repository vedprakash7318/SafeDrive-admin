import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';

export default function PartnerManageProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [qrFors, setQrFors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    qrType: 'PHYSICAL',
    category: '',
    description: '',
    imageUrl: '',
    isActive: true,
    packages: [{ quantity: '', mrp: '', totalPrice: '', discountPercent: 0, deliveryCharge: '', isOutOfStock: false }]
  });

  useEffect(() => {
    fetchProducts();
    fetchQrFors();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/partner-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchQrFors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/qr-fors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setQrFors(res.data.data || res.data.types || []);
      }
    } catch (err) {
      console.error('Failed to fetch QR Fors');
    }
  };

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingId(prod._id);
      setFormData({
        name: prod.name,
        qrType: prod.qrType || 'PHYSICAL',
        category: prod.category || '',
        description: prod.description || '',
        imageUrl: prod.imageUrl || '',
        isActive: prod.isActive,
        packages: prod.packages && prod.packages.length > 0 
          ? prod.packages.map(p => ({ 
              quantity: p.quantity, 
              mrp: p.mrp || p.totalPrice, 
              totalPrice: p.totalPrice, 
              discountPercent: p.discountPercent || 0,
              deliveryCharge: p.deliveryCharge,
              isOutOfStock: p.isOutOfStock || false
            }))
          : [{ quantity: '', mrp: '', totalPrice: '', discountPercent: 0, deliveryCharge: '', isOutOfStock: false }]
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        qrType: 'PHYSICAL',
        category: '',
        description: '',
        imageUrl: '',
        isActive: true,
        packages: [{ quantity: '', mrp: '', totalPrice: '', discountPercent: 0, deliveryCharge: '', isOutOfStock: false }]
      });
    }
    setIsModalOpen(true);
  };

  const calculateDiscount = (mrp, price) => {
    if (!mrp || mrp <= 0 || price < 0) return 0;
    if (price >= mrp) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...formData.packages];
    
    if (field === 'isOutOfStock') {
      newPackages[index][field] = value;
    } else {
      const numValue = Number(value);
      newPackages[index][field] = value;
      
      // Auto calculate discount
      if (field === 'mrp' || field === 'totalPrice') {
        const mrp = field === 'mrp' ? numValue : Number(newPackages[index].mrp);
        const price = field === 'totalPrice' ? numValue : Number(newPackages[index].totalPrice);
        newPackages[index].discountPercent = calculateDiscount(mrp, price);
      }
    }
    setFormData({ ...formData, packages: newPackages });
  };

  const addPackageRow = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { quantity: '', mrp: '', totalPrice: '', discountPercent: 0, deliveryCharge: '', isOutOfStock: false }]
    });
  };

  const removePackageRow = (index) => {
    if (formData.packages.length > 1) {
      const newPackages = formData.packages.filter((_, i) => i !== index);
      setFormData({ ...formData, packages: newPackages });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await axios.post(`${API_BASE}/admin/products/upload-image`, formDataUpload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setFormData({ ...formData, imageUrl: res.data.imageUrl, imagePublicId: res.data.publicId || '' });
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      return toast.warn('Please select a QR For Category');
    }

    try {
      const payload = {
        ...formData,
        packages: formData.packages.map(p => ({
          quantity: Number(p.quantity),
          mrp: Number(p.mrp),
          totalPrice: Number(p.totalPrice),
          discountPercent: Number(p.discountPercent),
          deliveryCharge: Number(p.deliveryCharge),
          isOutOfStock: Boolean(p.isOutOfStock)
        }))
      };

      if (editingId) {
        await axios.put(`${API_BASE}/admin/partner-products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_BASE}/admin/partner-products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/admin/partner-products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Partner Bulk Products</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Bulk Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No partner bulk products found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Product Name</th>
                  <th className="p-4 font-semibold text-slate-600">Category (QR For)</th>
                  <th className="p-4 font-semibold text-slate-600">Packages / Slabs</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(prod => (
                  <tr key={prod._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{prod.name}</div>
                          {prod.description && <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5" title={prod.description}>{prod.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{prod.category}</div>
                      {prod.qrType && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1 font-bold text-slate-500 uppercase">{prod.qrType} QR</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {prod.packages?.map((pkg, i) => (
                          <div key={i} className={`text-xs px-2 py-1 rounded border ${pkg.isOutOfStock ? 'bg-red-50 text-red-700 border-red-200 line-through' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {pkg.quantity} pcs | MRP ₹{pkg.mrp} | Sale ₹{pkg.totalPrice} ({pkg.discountPercent}% Off) | Del: ₹{pkg.deliveryCharge} {pkg.isOutOfStock && <span className="font-bold text-red-600 ml-1">(OOS)</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${prod.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(prod)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prod._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Bulk Product' : 'Create Bulk Product'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Car Tags Bulk Pack" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">QR Type</label>
                  <select disabled required value={formData.qrType} onChange={e => setFormData({...formData, qrType: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-100 cursor-not-allowed text-slate-500">
                    <option value="PHYSICAL">Physical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category (QR For)</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="">-- Select Category --</option>
                    {qrFors.map(q => (
                      <option key={q._id || q.name} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 h-24" placeholder="Brief description of the product..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border border-slate-300 p-2 rounded-lg text-sm" />
                  {formData.imageUrl && (
                    <div className="mt-2 relative inline-block">
                      <img src={formData.imageUrl} alt="Product preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded" />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-800 cursor-pointer">Product is Active (Visible to partners)</label>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package className="w-5 h-5"/> Quantity Packages (Slabs)</h3>
                  <button type="button" onClick={addPackageRow} className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200">+ Add Slab</button>
                </div>
                
                <div className="space-y-4">
                  {formData.packages.map((pkg, idx) => (
                    <div key={idx} className={`flex flex-wrap gap-4 items-start p-4 rounded-xl border ${pkg.isOutOfStock ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Quantity (pcs)</label>
                        <input type="number" required min="1" value={pkg.quantity} onChange={e => handlePackageChange(idx, 'quantity', e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="100" />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-slate-600 mb-1">MRP (₹)</label>
                        <input type="number" required min="0" value={pkg.mrp} onChange={e => handlePackageChange(idx, 'mrp', e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="6000" />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Sale Price (₹)</label>
                        <input type="number" required min="0" value={pkg.totalPrice} onChange={e => handlePackageChange(idx, 'totalPrice', e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="5000" />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Off %</label>
                        <div className="w-full bg-slate-200 text-slate-600 p-2.5 rounded-lg text-sm font-bold text-center">
                          {pkg.discountPercent}%
                        </div>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Delivery Charge (₹)</label>
                        <input type="number" required min="0" value={pkg.deliveryCharge} onChange={e => handlePackageChange(idx, 'deliveryCharge', e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm" placeholder="100" />
                      </div>
                      
                      <div className="flex items-center gap-3 pt-6">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                          <input type="checkbox" checked={pkg.isOutOfStock} onChange={e => handlePackageChange(idx, 'isOutOfStock', e.target.checked)} className="w-4 h-4 text-red-600" />
                          Out of Stock
                        </label>
                        
                        {formData.packages.length > 1 && (
                          <button type="button" onClick={() => removePackageRow(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg border border-red-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/30">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
