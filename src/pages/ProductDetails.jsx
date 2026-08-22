import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Phone,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productData, setProductData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    soldKits: 0,
    totalRevenue: 0
  });

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/products/${id}`, authHeader);
      if (res.data.success) {
        setProductData(res.data.product);
        setStats(res.data.stats || {});
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Fetch product details error:', err);
      setError(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1D56A5] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-[#E94E1A] rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested product could not be loaded.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center space-x-2 bg-[#1D56A5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>
    );
  }

  const mrp = productData.originalPrice || (productData.price + (productData.discount || 0));
  const hasDiscount = mrp > productData.price;
  const discountVal = hasDiscount ? (productData.discount || (mrp - productData.price)) : 0;
  const discountPct = hasDiscount ? Math.round((discountVal / mrp) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Back to Products Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {productData.imageUrl ? (
            <img
              src={productData.imageUrl}
              alt={productData.title || productData.name}
              className="w-14 h-14 object-cover rounded-2xl border border-slate-200 shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#E9DFEE] text-[#1D56A5] flex items-center justify-center font-black flex-shrink-0 shadow-xs">
              <ShoppingBag className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 leading-tight">{productData.title || productData.name}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                productData.qrType === 'DIGITAL'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {productData.qrType === 'DIGITAL' ? '💻 DIGITAL PASS' : '📦 PHYSICAL KIT'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-1">{productData.description || 'No description added'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchProductDetails}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Details"
          >
            <RefreshCw className="w-4 h-4 text-[#1D56A5]" />
          </button>
        </div>
      </div>

      {/* 2. ANALYTICS & SPECIFICATIONS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Price & Discount */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Retail Price</span>
            <DollarSign className="w-5 h-5 text-[#1D56A5]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#1D56A5]">₹{productData.price}</span>
            {hasDiscount && (
              <span className="text-sm font-bold line-through text-slate-400">₹{mrp}</span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-[10px] text-emerald-700 mt-1 font-bold">Save ₹{discountVal} ({discountPct}% OFF)</p>
          )}
        </div>

        {/* Free Quota */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Quota</span>
            <Phone className="w-5 h-5 text-[#259A3A]" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {productData.initialCalls || 0} Calls • {productData.initialMessages || 0} SMS
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Included with Initial Purchase</p>
        </div>

        {/* Validity & Renewal */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Validity & Renewal</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{productData.validityDays || 365} Days</div>
          <p className="text-[10px] text-indigo-700 mt-1 font-bold">Annual Renewal: ₹{productData.renewalAmount || 199}/yr</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sales</span>
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.soldKits || 0} Orders</div>
          <p className="text-[10px] text-amber-700 mt-1 font-bold">Revenue: ₹{(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* 3. PRODUCT DESCRIPTION & FEATURES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {productData.description || 'No detailed description provided.'}
          </p>
        </div>

        {productData.features && productData.features.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Included Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {productData.features.map((f, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-[#259A3A] shrink-0" />
                  <span className="font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. RECENT PURCHASE ORDERS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-base text-slate-900">Purchase Orders History ({orders.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customers who bought this product from the store</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Order No</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment ID</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400 text-xs">
                    No orders placed for this product yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{o.orderNumber || o._id.slice(-6)}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{o.customerName || o.userId?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500">{o.customerPhone || o.userId?.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">₹{o.totalAmount || productData.price}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px]">{o.paymentId || 'Simulated'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.deliveryStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#1D56A5]'
                      }`}>
                        {o.deliveryStatus || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
