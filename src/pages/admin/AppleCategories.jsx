import { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Grid
} from 'lucide-react';

export default function AppleCategories() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Apple Homepage & Navbar Category Cards State
  const [appleCards, setAppleCards] = useState([]);
  const [uploadingCardIndex, setUploadingCardIndex] = useState(null);

  useEffect(() => {
    fetchAppleCards();
  }, []);

  const fetchAppleCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/settings');
      if (response.data && response.data.appleCategories && response.data.appleCategories.length > 0) {
        setAppleCards(response.data.appleCategories.map(c => ({
          ...c,
          image: (c.image || '').trim(),
          name: (c.name || '').trim(),
          link: (c.link || '').trim(),
          isActive: c.isActive !== false
        })));
      } else {
        setAppleCards([
          { name: 'Mac', actionText: 'Shop all models →', link: '/macbook', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/mac/home-img-1776683069_8064.png', cardTheme: 'light', isActive: true },
          { name: 'iPhone', actionText: 'Shop all models →', link: '/iphone', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/iphone/home-img-1776683084_2967.png', cardTheme: 'dark', isActive: true },
          { name: 'iPad', actionText: 'Shop all models →', link: '/ipad', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/ipad/home-img-1776683096_1014.png', cardTheme: 'dark', isActive: true },
          { name: 'Watch', actionText: 'Shop all models →', link: '/watch', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/watch/home-img-1757682221_3904.jpg', cardTheme: 'dark', isActive: true },
          { name: 'AirPods', actionText: 'Shop all models →', link: '/airpods', image: '/airpods_category_uploaded.png', cardTheme: 'grey', isActive: true },
          { name: 'TV & Home', actionText: 'Shop all models →', link: '/tv-home', image: '/tvhome_category_uploaded.png', cardTheme: 'light', isActive: true },
          { name: 'Accessories', actionText: 'Shop all models →', link: '/accessories', image: '/accessories_category_uploaded.png', cardTheme: 'dark', isActive: true },
          { name: 'AppleCare+', actionText: 'Explore coverage →', link: '/applecare', image: '/applecare_official_hero.png', cardTheme: 'dark', isActive: true },
          { name: 'New Arrivals', actionText: 'Explore latest releases →', link: '/accessories', image: '', cardTheme: 'dark', isActive: true },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch Apple Categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppleCard = () => {
    setAppleCards(prev => [
      ...prev,
      {
        name: 'New Category',
        actionText: 'Shop all models →',
        link: '/accessories',
        image: '',
        cardTheme: 'dark',
        isActive: true
      }
    ]);
  };

  const handleRemoveAppleCard = (index) => {
    if (appleCards.length <= 1) {
      alert("At least 1 category tile is required.");
      return;
    }
    setAppleCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleAppleCardChange = (index, field, value) => {
    setAppleCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleAppleCardActive = (index) => {
    setAppleCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: updated[index].isActive === false };
      return updated;
    });
  };

  const handleMoveAppleCard = (index, direction) => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= appleCards.length) return;
    setAppleCards(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  const handleAppleCardImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCardIndex(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosClient.post('/upload/single', formData);
      if (response.data && response.data.url) {
        handleAppleCardChange(index, 'image', response.data.url);
        showSuccessMessage('Category image uploaded successfully!');
      }
    } catch (err) {
      console.warn('Server upload fallback triggered:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAppleCardChange(index, 'image', reader.result);
        showSuccessMessage('Category image loaded!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCardIndex(null);
    }
  };

  const handleSaveAppleCards = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const cleanedCards = appleCards.map(c => ({
        ...c,
        image: (c.image || '').trim(),
        name: (c.name || '').trim(),
        link: (c.link || '').trim(),
      }));
      await axiosClient.put('/settings', { appleCategories: cleanedCards });
      notifyAdminChange('categories', { action: 'update_apple_categories' });
      showSuccessMessage('Apple Categories & Header Navigation updated live!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save Apple Categories');
    } finally {
      setSaving(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Notifications */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 py-3.5 px-4 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans flex items-center gap-2.5">
            <Grid className="h-6 w-6 text-[#0071e3]" />
            Shop Category Manager
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Control Homepage "Shop by Category" grid tiles & Header Navbar order, titles, hover images, and visibility.</p>
        </div>

        <button
          type="button"
          onClick={handleAddAppleCard}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Shop Category
        </button>
      </header>

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSaveAppleCards} className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-widest block">HOMEPAGE & HEADER CATEGORIES ({appleCards.length})</span>
              <h3 className="text-base font-bold text-zinc-900 mt-0.5">Manage All Active & Hidden Category Tiles</h3>
            </div>
          </div>

          <div className="space-y-4">
            {appleCards.map((card, index) => (
              <div
                key={index}
                className={`p-5 border rounded-2xl space-y-4 transition-all ${
                  card.isActive !== false
                    ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                    : 'bg-zinc-100/70 border-zinc-250 opacity-75'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 pb-3 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-zinc-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      Rank #{index + 1}
                    </span>

                    {card.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <Eye className="h-3 w-3 text-emerald-600" /> Visible Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 bg-zinc-200 border border-zinc-300 px-2 py-0.5 rounded-md">
                        <EyeOff className="h-3 w-3 text-zinc-500" /> Hidden
                      </span>
                    )}

                    {card.image && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <ImageIcon className="h-3 w-3" /> Image Banner Attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleAppleCardActive(index)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        card.isActive !== false
                          ? 'text-zinc-700 bg-white hover:bg-zinc-100 border-zinc-250'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                      }`}
                    >
                      {card.isActive !== false ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          Unhide
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveAppleCard(index, 'up')}
                      className="p-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 cursor-pointer border-0 text-zinc-600"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={index === appleCards.length - 1}
                      onClick={() => handleMoveAppleCard(index, 'down')}
                      className="p-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 cursor-pointer border-0 text-zinc-600"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveAppleCard(index)}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-2 py-1 rounded-lg transition-all cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Category Name / Title</label>
                    <input
                      type="text"
                      required
                      value={card.name}
                      onChange={(e) => handleAppleCardChange(index, 'name', e.target.value)}
                      placeholder="e.g. iPhone, Mac, iPad, Watch, New Arrivals"
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-zinc-200 text-sm font-bold focus:border-[#0071e3] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Action Link Label</label>
                    <input
                      type="text"
                      value={card.actionText || 'Shop all models →'}
                      onChange={(e) => handleAppleCardChange(index, 'actionText', e.target.value)}
                      placeholder="e.g. Shop all models →"
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Target Page Link (URL)</label>
                    <input
                      type="text"
                      value={card.link || '/accessories'}
                      onChange={(e) => handleAppleCardChange(index, 'link', e.target.value)}
                      placeholder="e.g. /iphone, /macbook, /ipad"
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#0071e3] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Card Theme Style</label>
                    <select
                      value={card.cardTheme || 'dark'}
                      onChange={(e) => handleAppleCardChange(index, 'cardTheme', e.target.value)}
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                    >
                      <option value="dark">Dark Card (White Text)</option>
                      <option value="light">Light Clean Card (Dark Text)</option>
                      <option value="grey">Grey Slate Card (White Text)</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Category Background Image (Upload File or URL)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={card.image || ''}
                        onChange={(e) => handleAppleCardChange(index, 'image', e.target.value)}
                        placeholder="Image URL or upload file..."
                        className="flex-1 px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                      />

                      <input
                        id={`apple-card-file-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAppleCardImageUpload(index, e)}
                      />

                      <button
                        type="button"
                        onClick={() => document.getElementById(`apple-card-file-${index}`)?.click()}
                        className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#005bb5] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 shadow-xs shrink-0"
                      >
                        {uploadingCardIndex === index ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload Image
                      </button>
                      {card.image && (
                        <button
                          type="button"
                          onClick={() => handleAppleCardChange(index, 'image', '')}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-lg"
                          title="Remove Image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {card.image && (
                    <div className="md:col-span-2 pt-1">
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex items-end p-3">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="relative z-10 text-white">
                          <h4 className="text-base font-bold">{card.name}</h4>
                          <span className="text-xs opacity-80">{card.actionText}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleAddAppleCard}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              <Plus className="h-4 w-4" />
              Add Another Category
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] disabled:bg-zinc-400 text-white px-7 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer border-0"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Shop Categories
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
