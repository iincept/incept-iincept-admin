import { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Package,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  Link as LinkIcon
} from 'lucide-react';

export default function DealBannersManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Deal Banners State
  const [dealBanners, setDealBanners] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch settings
      const settingsRes = await axiosClient.get('/settings');
      let items = settingsRes.data?.homeDealBanners || [];

      if (!items || items.length === 0) {
        items = [
          {
            id: 'deal-1',
            internalName: 'MacBook Neo – Stock Clearance',
            dealEyebrow: 'DEAL OF THE WEEK',
            dealTitle: 'MacBook Neo – Stock Clearance',
            dealDesc: 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.',
            productId: '',
            dealImage: '/mac_deal_fan.png',
            mrp: 79900,
            discount: 8.76,
            dealPrice: 72900,
            dealButtonText: 'Grab the Deal',
            dealButtonLink: '/macbook',
            displayOrder: 1,
            isActive: true
          },
          {
            id: 'deal-2',
            internalName: 'MacBook Neo – Limited Time Deal',
            dealEyebrow: 'DEAL OF THE WEEK',
            dealTitle: 'MacBook Neo – Limited Time Deal',
            dealDesc: 'Get the incredible MacBook Neo with extraordinary battery life and performance. Limited time discount offer.',
            productId: '',
            dealImage: '/mac_deal_fan.png',
            mrp: 79900,
            discount: 10,
            dealPrice: 71910,
            dealButtonText: 'Grab the Deal',
            dealButtonLink: '/macbook',
            displayOrder: 2,
            isActive: true
          }
        ];
      }

      setDealBanners(items);

      // Fetch store products for dropdown selector
      try {
        const prodRes = await axiosClient.get('/products');
        const fetchedProds = prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
        setStoreProducts(fetchedProds);
      } catch (pErr) {
        console.warn("Products fetch warning:", pErr);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch deal banners');
    } finally {
      setLoading(false);
    }
  };

  // Add New Blank or Linked Deal Banner
  const handleAddDealBanner = () => {
    let newBanner = {
      id: Date.now().toString(),
      internalName: 'New Deal Banner',
      dealEyebrow: 'DEAL OF THE WEEK',
      dealTitle: 'Special Deal Banner',
      dealDesc: 'Limited time offer on genuine Apple devices. Order today to claim free shipping.',
      productId: '',
      dealImage: '/mac_deal_fan.png',
      mrp: 79900,
      discount: 10,
      dealPrice: 71910,
      dealButtonText: 'Grab the Deal',
      dealButtonLink: '/shop',
      displayOrder: dealBanners.length + 1,
      isActive: true,
      isFullBanner: false
    };

    if (selectedProductId) {
      const selectedProd = storeProducts.find(p => String(p._id || p.id) === String(selectedProductId));
      if (selectedProd) {
        const prodMrp = Number(selectedProd.mrp || selectedProd.price || 79900);
        const prodPrice = Number(selectedProd.price || 72900);
        const calcDiscount = prodMrp > 0 ? Number((((prodMrp - prodPrice) / prodMrp) * 100).toFixed(2)) : 0;
        const prodImg = selectedProd.image || (selectedProd.images && selectedProd.images[0]) || '/mac_deal_fan.png';
        const prodId = selectedProd._id || selectedProd.id;

        newBanner = {
          id: Date.now().toString(),
          internalName: selectedProd.title || selectedProd.name || 'New Deal Banner',
          dealEyebrow: 'DEAL OF THE WEEK',
          dealTitle: selectedProd.title || selectedProd.name || 'Special Deal Banner',
          dealDesc: selectedProd.subtitle || selectedProd.description || 'Amazing deal at an unbeatable price.',
          productId: prodId,
          dealImage: prodImg,
          mrp: prodMrp,
          discount: Math.max(0, calcDiscount),
          dealPrice: prodPrice,
          dealButtonText: 'Grab the Deal',
          dealButtonLink: `/product/${prodId}`,
          displayOrder: dealBanners.length + 1,
          isActive: true,
          isFullBanner: false
        };
      }
    }

    setDealBanners([newBanner, ...dealBanners]);
    setSelectedProductId('');
  };

  // Update Field Handler (with Pricing Auto Calculation)
  const handleUpdateField = (index, field, value) => {
    setDealBanners(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      item[field] = value;

      // Pricing Auto-Calculation:
      // Final Price = MRP - (MRP * Discount / 100)
      if (field === 'mrp' || field === 'discount') {
        const mrpVal = Number(field === 'mrp' ? value : item.mrp) || 0;
        const discVal = Number(field === 'discount' ? value : item.discount) || 0;
        item.dealPrice = Math.round(mrpVal - (mrpVal * discVal / 100));
      } else if (field === 'dealPrice') {
        const mrpVal = Number(item.mrp) || 0;
        const finalVal = Number(value) || 0;
        if (mrpVal > 0) {
          item.discount = Number((((mrpVal - finalVal) / mrpVal) * 100).toFixed(2));
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  // Select Product Handler inside Card
  const handleSelectProductForBanner = (index, prodId) => {
    const selectedProd = storeProducts.find(p => String(p._id || p.id) === String(prodId));
    if (!selectedProd) return;

    const prodMrp = Number(selectedProd.mrp || selectedProd.price || 79900);
    const prodPrice = Number(selectedProd.price || 72900);
    const calcDiscount = prodMrp > 0 ? Number((((prodMrp - prodPrice) / prodMrp) * 100).toFixed(2)) : 0;
    const prodImg = selectedProd.image || (selectedProd.images && selectedProd.images[0]) || '/mac_deal_fan.png';
    const cleanId = selectedProd._id || selectedProd.id;

    setDealBanners(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: cleanId,
        internalName: updated[index].internalName || selectedProd.title || selectedProd.name,
        dealTitle: selectedProd.title || selectedProd.name,
        dealDesc: selectedProd.subtitle || selectedProd.description || updated[index].dealDesc,
        dealImage: prodImg,
        mrp: prodMrp,
        discount: Math.max(0, calcDiscount),
        dealPrice: prodPrice,
        dealButtonLink: `/product/${cleanId}`
      };
      return updated;
    });
  };

  // Image Upload Handler
  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        handleUpdateField(index, 'dealImage', res.data.url);
        handleUpdateField(index, 'isFullBanner', true);
      }
    } catch (err) {
      alert("Image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingIndex(null);
    }
  };

  // Move Order
  const handleMove = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === dealBanners.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setDealBanners(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  // Delete Banner
  const handleDeleteBanner = (index) => {
    if (window.confirm("Are you sure you want to delete this Deal of the Week banner?")) {
      setDealBanners(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Save All Banners to DB Settings
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Re-assign display order numbers and ensure isFullBanner boolean
      const sanitized = dealBanners.map((item, idx) => ({
        ...item,
        isFullBanner: Boolean(item.isFullBanner),
        mrp: Number(item.mrp) || 0,
        discount: Number(item.discount) || 0,
        dealPrice: Number(item.dealPrice) || 0,
        displayOrder: idx + 1
      }));

      await axiosClient.put('/settings', {
        homeDealBanners: sanitized
      });

      setSuccess("Deal of the Week banners updated successfully!");
      notifyAdminChange();

      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-[#0071e3] animate-spin mb-3" />
        <p className="text-xs font-semibold text-zinc-500">Loading Deal of the Week banners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Tag className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Deal of the Week Manager</h1>
          </div>
          <p className="text-xs text-zinc-500">
            Create, edit, reorder, and link homepage "DEAL OF THE WEEK" banners to existing store products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#005bb5] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving Banners...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Add New Banner Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex items-center gap-3">
          <Package className="h-4 w-4 text-zinc-400 shrink-0" />
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-xl px-3 py-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]"
          >
            <option value="">-- Select Existing Product to Auto-Fill (Optional) --</option>
            {storeProducts.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.title || p.name} — ₹{Number(p.price || 0).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAddDealBanner}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Deal Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="space-y-6">
        {dealBanners.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200">
            <Tag className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-700 mb-1">No Deal Banners Created</h3>
            <p className="text-xs text-zinc-500 mb-4">Click "Add Deal Banner" above to create a new Deal of the Week banner.</p>
            <button
              type="button"
              onClick={handleAddDealBanner}
              className="px-4 py-2 bg-[#0071e3] text-white text-xs font-bold rounded-xl"
            >
              Add First Banner
            </button>
          </div>
        ) : (
          dealBanners.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                banner.isActive ? 'border-zinc-200' : 'border-zinc-200/60 opacity-75 bg-zinc-50/50'
              }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/80 border-b border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">{banner.internalName || 'Deal Banner'}</h3>
                    <p className="text-[11px] text-zinc-500">
                      Product ID: <span className="font-mono text-zinc-700">{banner.productId || 'Not Linked'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Active Toggle */}
                  <button
                    type="button"
                    onClick={() => handleUpdateField(index, 'isActive', !banner.isActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      banner.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {banner.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>

                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === dealBanners.length - 1}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(index)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                    title="Delete Banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Banner Form Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Fields */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Banner Display Layout Mode (Full Box Banner vs Split Layout) */}
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200 rounded-2xl shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🖼️</span>
                          <span className="text-xs font-extrabold text-zinc-900 tracking-tight">Banner Display Size / Mode</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            banner.isFullBanner ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-700'
                          }`}>
                            {banner.isFullBanner ? 'Full Box Size' : 'Split Layout'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                          {banner.isFullBanner
                            ? '✅ बड़ा साइज़ (Full Box): आपकी इमेज पूरे 1400px बॉक्स को कवर करेगी (100% full width banner).'
                            : '⚡ Split Layout: लेफ्ट साइड में टेक्स्ट/प्राइस और राइट साइड में छोटा प्रोडक्ट कटआउट दिखेगा.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateField(index, 'isFullBanner', true)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            banner.isFullBanner
                              ? 'bg-[#0071e3] text-white shadow-sm ring-2 ring-[#0071e3]/30'
                              : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span>🔲</span> Full Box Banner (बड़ा साइज़)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateField(index, 'isFullBanner', false)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            !banner.isFullBanner
                              ? 'bg-[#0071e3] text-white shadow-sm ring-2 ring-[#0071e3]/30'
                              : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span>✂️</span> Split Layout (छोटा)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Internal Name */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Internal Banner Name
                      </label>
                      <input
                        type="text"
                        value={banner.internalName || ''}
                        onChange={(e) => handleUpdateField(index, 'internalName', e.target.value)}
                        placeholder="e.g. MacBook Neo – Stock Clearance"
                        className="w-full text-xs font-semibold border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>

                    {/* Small Eyebrow Label */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Small Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={banner.dealEyebrow || ''}
                        onChange={(e) => handleUpdateField(index, 'dealEyebrow', e.target.value)}
                        placeholder="e.g. DEAL OF THE WEEK"
                        className="w-full text-xs font-semibold border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>

                  {/* Banner Title */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Banner Title
                    </label>
                    <input
                      type="text"
                      value={banner.dealTitle || ''}
                      onChange={(e) => handleUpdateField(index, 'dealTitle', e.target.value)}
                      placeholder="e.g. MacBook Neo – Stock Clearance"
                      className="w-full text-xs font-semibold border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Banner Description
                    </label>
                    <textarea
                      rows={2}
                      value={banner.dealDesc || ''}
                      onChange={(e) => handleUpdateField(index, 'dealDesc', e.target.value)}
                      placeholder="Enter banner description text..."
                      className="w-full text-xs font-medium border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  {/* Linked Product Selector & Product ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                        Linked Product (Select from DB)
                      </label>
                      <select
                        value={banner.productId || ''}
                        onChange={(e) => handleSelectProductForBanner(index, e.target.value)}
                        className="w-full text-xs font-semibold border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#0071e3]"
                      >
                        <option value="">-- Select Product --</option>
                        {storeProducts.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.title || p.name} ({p._id || p.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                        Product ID / ObjectId
                      </label>
                      <input
                        type="text"
                        value={banner.productId || ''}
                        onChange={(e) => handleUpdateField(index, 'productId', e.target.value)}
                        placeholder="e.g. 660f... or prod_123"
                        className="w-full text-xs font-mono font-medium border border-zinc-200 rounded-xl px-3.5 py-2 bg-white focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>

                  {/* Pricing Fields Grid (MRP, Discount, Final Price) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                    {/* Original MRP */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                        Original MRP (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={banner.mrp !== undefined ? banner.mrp : 79900}
                        onChange={(e) => handleUpdateField(index, 'mrp', e.target.value)}
                        className="w-full text-xs font-bold border border-amber-200 rounded-xl px-3.5 py-2 bg-white focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>

                    {/* Discount % */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={banner.discount !== undefined ? banner.discount : 0}
                        onChange={(e) => handleUpdateField(index, 'discount', e.target.value)}
                        className="w-full text-xs font-bold border border-amber-200 rounded-xl px-3.5 py-2 bg-white focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>

                    {/* Final Price (Calculated / Editable) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                        Final Price (₹) <span className="text-[10px] text-amber-700 font-normal">(Auto calculated)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={banner.dealPrice !== undefined ? banner.dealPrice : 72900}
                        onChange={(e) => handleUpdateField(index, 'dealPrice', e.target.value)}
                        className="w-full text-xs font-extrabold text-emerald-700 border border-amber-300 rounded-xl px-3.5 py-2 bg-white focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>

                  {/* CTA Button Text & Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={banner.dealButtonText || 'Grab the Deal'}
                        onChange={(e) => handleUpdateField(index, 'dealButtonText', e.target.value)}
                        placeholder="Grab the Deal"
                        className="w-full text-xs font-semibold border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Button Link
                      </label>
                      <input
                        type="text"
                        value={banner.dealButtonLink || ''}
                        onChange={(e) => handleUpdateField(index, 'dealButtonLink', e.target.value)}
                        placeholder="e.g. /product/660f... or /macbook"
                        className="w-full text-xs font-mono font-medium border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Image & Card Preview */}
                <div className="lg:col-span-4 flex flex-col space-y-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Product Image & Visual
                  </label>

                  {/* Image Preview Box */}
                  <div className="relative aspect-4/3 w-full bg-[#1c1c1e] rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4 group">
                    <img
                      src={banner.dealImage || '/mac_deal_fan.png'}
                      alt={banner.dealTitle || 'Deal preview'}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/mac_deal_fan.png';
                      }}
                    />

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <label className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-bold rounded-lg cursor-pointer hover:bg-zinc-100 transition-all flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadingIndex === index && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-bold gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={banner.dealImage || ''}
                      onChange={(e) => handleUpdateField(index, 'dealImage', e.target.value)}
                      placeholder="/mac_deal_fan.png or https://..."
                      className="w-full text-[11px] font-mono border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:bg-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  {/* Live Card Mock Preview */}
                  {banner.isFullBanner ? (
                    <div className="p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/40 rounded-xl space-y-1.5 text-center">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-1">
                        <span>🖼️</span> Full Box Banner Mode (Active)
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        यह बैनर होमपेज पर <strong>पूरे बॉक्स जितने बड़े साइज़ (100% width)</strong> में शो होगा.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#1d1d1f] text-white rounded-xl text-left border border-zinc-800 space-y-1">
                      <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                        {banner.dealEyebrow || 'DEAL OF THE WEEK'}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {banner.dealTitle || 'MacBook Neo – Stock Clearance'}
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-extrabold text-white">
                          ₹{Number(banner.dealPrice || 72900).toLocaleString('en-IN')}
                        </span>
                        {Number(banner.mrp || 79900) > Number(banner.dealPrice || 72900) && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            ₹{Number(banner.mrp || 79900).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
