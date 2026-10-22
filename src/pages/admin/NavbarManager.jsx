import React, { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  Navigation, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Loader2, 
  Save, 
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Layers,
  Image as ImageIcon,
  Upload,
  ArrowUpToLine,
  ArrowDownToLine,
  Tag
} from 'lucide-react';

export default function NavbarManager() {
  const [navItems, setNavItems] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null); // `${parentIdx}-${subIdx}`
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchNavbarSettings();
  }, []);

  const fetchNavbarSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/settings');
      if (response.data && response.data.navbarMenuItems && response.data.navbarMenuItems.length > 0) {
        const items = response.data.navbarMenuItems.map(item => {
          if ((item.name || '').toLowerCase().includes('accessori') && (!item.dropdownItems || item.dropdownItems.length === 0)) {
            return {
              ...item,
              dropdownItems: [
                { label: 'Explore All Accessories', path: '/accessories', query: 'Accessories', image: '/accessories_category_uploaded.png', price: 'Cables, cases & chargers', isActive: true },
                { label: 'Mac Accessories', path: '/accessories?product=mac', query: 'Mac', image: '/accessories_category_uploaded.png', price: 'Keyboards, Mice & Docks', isActive: true },
                { label: 'iPad Accessories', path: '/accessories?product=ipad', query: 'iPad', image: '/ipad_nav/dropdown_ipad_accessories.jpg', price: 'Pencils & Folios', isActive: true },
                { label: 'iPhone Accessories', path: '/accessories?product=iphone', query: 'iPhone', image: '/iphone_nav/dropdown_iphone_accessories.png', price: 'MagSafe & Cases', isActive: true },
                { label: 'Apple Watch Accessories', path: '/accessories?product=watch', query: 'Watch', image: '/watch_category_uploaded.png', price: 'Bands & Chargers', isActive: true },
                { label: 'AirPods Accessories', path: '/accessories?product=airpods', query: 'AirPods', image: '/airpods_category_uploaded.png', price: 'Cases & Lanyards', isActive: true },
                { label: 'TV & Home Accessories', path: '/accessories?product=tv-home', query: 'TV & Home', image: '/tvhome_category_uploaded.png', price: 'Remotes & Mounts', isActive: true }
              ]
            };
          }
          return item;
        });
        setNavItems(items);
      } else {
        // Fallback defaults with dropdown items & images
        setNavItems([
          {
            name: 'New Arrivals',
            link: '/shop?sort=newest',
            isActive: true,
            dropdownItems: [
              { label: 'Explore New Arrivals', path: '/shop?sort=newest', query: 'New Arrivals', image: '/iphone_category_v2.jpg', price: 'New Releases', isActive: true },
              { label: 'iPhone 17 Series', path: '/iphone', query: 'iPhone 17', image: '/iphone17p_orange.jpg', price: 'From ₹79,900', isActive: true },
              { label: 'MacBook M4 Series', path: '/macbook', query: 'MacBook Pro', image: '/mac_nav/macbook_pro.png', price: 'From ₹1,69,900', isActive: true },
              { label: 'Apple Watch Series 10', path: '/watch', query: 'Series 10', image: '/watch_category_uploaded.png', price: 'From ₹46,900', isActive: true },
            ]
          },
          {
            name: 'Mac',
            link: '/macbook',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All Mac', path: '/macbook', query: 'MacBook', image: '/macbook_category_v3.jpg', price: 'Mac Workstations', isActive: true },
              { label: 'MacBook Neo', path: '/macbook?search=MacBook Neo', query: 'MacBook Neo', image: '/mac_dark_banner.jpg', price: 'High Performance Laptop', isActive: true },
              { label: 'MacBook Air', path: '/macbook?search=MacBook Air', query: 'MacBook Air', image: '/student_mac_banner.jpg', price: 'Light & Powerful. From ₹1,14,900', isActive: true },
              { label: 'MacBook Pro', path: '/macbook?search=MacBook Pro', query: 'MacBook Pro', image: '/mac_nav/macbook_pro.png', price: 'Pro Workflow Leader. From ₹1,69,900', isActive: true },
              { label: 'iMac', path: '/macbook?search=iMac', query: 'iMac', image: '/imac_studio_lifestyle.jpg', price: 'All-in-one Desktop. From ₹1,29,900', isActive: true },
              { label: 'Mac mini', path: '/macbook?search=Mac mini', query: 'Mac mini', image: '/mac_nav/mac_mini.png', price: 'Compact Powerhouse. From ₹54,900', isActive: true },
              { label: 'Mac Studio', path: '/macbook?search=Mac Studio', query: 'Mac Studio', image: '/mac_nav/mac_studio.png', price: 'Creator Station. From ₹1,99,900', isActive: true },
              { label: 'Displays', path: '/macbook?search=Studio Display', query: 'Display', image: '/mac_nav/mac_displays.png', price: 'Retina 5K & 6K Panels', isActive: true },
              { label: 'Compare Mac', path: '/compare?category=mac', query: 'Compare', image: '/macbook_category_v2.jpg', price: 'Compare Specs', isActive: true }
            ]
          },
          {
            name: 'iPad',
            link: '/ipad',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All iPad', path: '/ipad', query: 'iPad', image: '/ipad_category_v3.png', price: 'iPad Catalogue', isActive: true },
              { label: 'iPad Pro', path: '/ipad?search=iPad Pro', query: 'iPad Pro', image: '/ipad_category_v2.jpg', price: 'Ultra Thin. From ₹99,900', isActive: true },
              { label: 'iPad Air', path: '/ipad?search=iPad Air', query: 'iPad Air', image: '/ipad_air_banner.jpg', price: 'Value & Power. From ₹59,900', isActive: true },
              { label: 'iPad', path: '/ipad?search=iPad', query: 'iPad', image: '/ipad_category.jpg', price: 'Daily Workhorse. From ₹34,900', isActive: true },
              { label: 'iPad mini', path: '/ipad?search=iPad mini', query: 'iPad mini', image: '/ipad_air_blue.jpg', price: 'Pocket Sized. From ₹49,900', isActive: true },
              { label: 'Apple Pencil', path: '/accessories?search=Pencil', query: 'Pencil', image: '/accessories_banner.png', price: 'Precision Input. From ₹11,900', isActive: true },
              { label: 'Keyboards', path: '/accessories?search=Keyboard', query: 'Keyboard', image: '/accessories_banner.png', price: 'Magic Keyboard', isActive: true },
              { label: 'Compare iPad', path: '/compare?category=ipad', query: 'Compare', image: '/ipad_category_v3.png', price: 'Compare Specs', isActive: true }
            ]
          },
          {
            name: 'iPhone',
            link: '/iphone',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All iPhone', path: '/iphone', query: 'iPhone', image: '/iphone_category_v2.jpg', price: 'iPhone Catalogue', isActive: true },
              { label: 'iPhone 17 Pro Max', path: '/iphone?search=iPhone 17 Pro Max', query: 'iPhone 17 Pro Max', image: '/iphone17p_orange.jpg', price: 'Peak Performance. From ₹1,64,900', isActive: true },
              { label: 'iPhone 17 Pro', path: '/iphone?search=iPhone 17 Pro', query: 'iPhone 17 Pro', image: '/iphone17p_white.jpg', price: 'Titanium Build. From ₹1,34,900', isActive: true },
              { label: 'iPhone 17 Air', path: '/iphone?search=iPhone 17 Air', query: 'iPhone 17 Air', image: '/iphone17_green.jpg', price: 'Ultra Thin Design', isActive: true },
              { label: 'iPhone 17', path: '/iphone?search=iPhone 17', query: 'iPhone 17', image: '/iphone17_green.jpg', price: 'Sleek & Durable. From ₹79,900', isActive: true },
              { label: 'iPhone 17e', path: '/iphone?search=iPhone 17e', query: 'iPhone 17e', image: '/iphone17_green.jpg', price: 'Essential Performance', isActive: true },
              { label: 'iPhone 16', path: '/iphone?search=iPhone 16', query: 'iPhone 16', image: '/iphone_category_uploaded.jpg', price: 'Proven Classic. From ₹69,900', isActive: true },
              { label: 'Compare iPhone', path: '/compare?category=iphone', query: 'Compare', image: '/iphone_category_v2.jpg', price: 'Compare Specs', isActive: true }
            ]
          },
          {
            name: 'Watch',
            link: '/watch',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All Watch', path: '/watch', query: 'Watch', image: '/watch_category_uploaded.png', price: 'Watch Lineup', isActive: true },
              { label: 'Apple Watch Series 10', path: '/watch?search=Series 10', query: 'Series 10', image: '/watch_category_uploaded.png', price: 'Thinnest Watch. From ₹46,900', isActive: true },
              { label: 'Apple Watch Ultra 2', path: '/watch?search=Ultra', query: 'Ultra', image: '/watch_category_uploaded.png', price: 'Extreme Sports. From ₹89,900', isActive: true },
              { label: 'Apple Watch SE', path: '/watch?search=SE', query: 'SE', image: '/watch_category_uploaded.png', price: 'Essential Health. From ₹24,900', isActive: true },
              { label: 'Compare Watch', path: '/compare?category=watch', query: 'Compare', image: '/watch_category_uploaded.png', price: 'Compare Specs', isActive: true }
            ]
          },
          {
            name: 'AirPods',
            link: '/airpods',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All AirPods', path: '/airpods', query: 'AirPods', image: '/airpods_category_uploaded.png', price: 'AirPods Lineup', isActive: true },
              { label: 'AirPods Pro 2', path: '/airpods?search=Pro', query: 'AirPods Pro', image: '/airpods_category_uploaded.png', price: 'ANC Leader. From ₹24,900', isActive: true },
              { label: 'AirPods 4', path: '/airpods?search=AirPods 4', query: 'AirPods 4', image: '/airpods_category_uploaded.png', price: 'Open Ear ANC. From ₹12,900', isActive: true },
              { label: 'AirPods Max', path: '/airpods?search=Max', query: 'AirPods Max', image: '/airpods_category_uploaded.png', price: 'Over Ear Audio. From ₹59,900', isActive: true }
            ]
          },
          {
            name: 'TV & Home',
            link: '/tv-home',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All TV & Home', path: '/tv-home', query: 'TV & Home', image: '/tvhome_category_uploaded.png', price: 'Cinematic Experience', isActive: true },
              { label: 'Apple TV 4K', path: '/tv-home?search=Apple TV', query: 'Apple TV', image: '/tvhome_category_uploaded.png', price: '4K HDR Cinema. From ₹14,900', isActive: true },
              { label: 'HomePod', path: '/tv-home?search=HomePod', query: 'HomePod', image: '/tvhome_category_uploaded.png', price: 'High Fidelity Sound. From ₹32,900', isActive: true },
              { label: 'HomePod mini', path: '/tv-home?search=HomePod mini', query: 'HomePod mini', image: '/tvhome_category_uploaded.png', price: 'Room filling audio. From ₹10,900', isActive: true }
            ]
          },
          {
            name: 'Accessories',
            link: '/accessories',
            isActive: true,
            dropdownItems: [
              { label: 'Explore All Accessories', path: '/accessories', query: 'Accessories', image: '/accessories_category_uploaded.png', price: 'Cables, cases & chargers', isActive: true },
              { label: 'Mac Accessories', path: '/accessories?product=mac', query: 'Mac', image: '/accessories_category_uploaded.png', price: 'Keyboards, Mice & Docks', isActive: true },
              { label: 'iPad Accessories', path: '/accessories?product=ipad', query: 'iPad', image: '/ipad_nav/dropdown_ipad_accessories.jpg', price: 'Pencils & Folios', isActive: true },
              { label: 'iPhone Accessories', path: '/accessories?product=iphone', query: 'iPhone', image: '/iphone_nav/dropdown_iphone_accessories.png', price: 'MagSafe & Cases', isActive: true },
              { label: 'Apple Watch Accessories', path: '/accessories?product=watch', query: 'Watch', image: '/watch_category_uploaded.png', price: 'Bands & Chargers', isActive: true },
              { label: 'AirPods Accessories', path: '/accessories?product=airpods', query: 'AirPods', image: '/airpods_category_uploaded.png', price: 'Cases & Lanyards', isActive: true },
              { label: 'TV & Home Accessories', path: '/accessories?product=tv-home', query: 'TV & Home', image: '/tvhome_category_uploaded.png', price: 'Remotes & Mounts', isActive: true }
            ]
          },
          {
            name: 'AppleCare+',
            link: '/applecare',
            isActive: true,
            dropdownItems: [
              { label: 'Explore AppleCare+', path: '/applecare', query: 'AppleCare', image: '/applecare_official_hero.png', price: 'Official Warranty Protection', isActive: true },
              { label: 'AppleCare+ for Mac', path: '/applecare', query: 'Mac', image: '/applecare_official_hero.png', price: '3-Year Protection Plan', isActive: true },
              { label: 'AppleCare+ for iPhone', path: '/applecare', query: 'iPhone', image: '/applecare_official_hero.png', price: 'Accidental Damage Protection', isActive: true },
              { label: 'AppleCare+ for iPad', path: '/applecare', query: 'iPad', image: '/applecare_official_hero.png', price: 'Hardware & Battery Coverage', isActive: true }
            ]
          }
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load navbar menu settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNavItems(prev => [
      ...prev,
      {
        name: 'New Category',
        link: '/shop',
        isActive: true,
        dropdownItems: [
          { label: 'Explore Category', path: '/shop', query: 'Shop', image: '', price: '', isActive: true }
        ]
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (navItems.length <= 1) {
      alert("At least 1 navbar menu item is required.");
      return;
    }
    if (window.confirm(`Delete menu item "${navItems[index].name}" and all its dropdown sub-items?`)) {
      setNavItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    setNavItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleActive = (index) => {
    setNavItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: updated[index].isActive === false };
      return updated;
    });
  };

  const handleMoveItem = (index, direction) => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;
    setNavItems(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  // Dropdown Sub-Items handlers
  const handleAddDropdownItem = (parentIdx) => {
    setNavItems(prev => {
      const updated = [...prev];
      const parent = { ...updated[parentIdx] };
      parent.dropdownItems = [
        ...(parent.dropdownItems || []),
        { label: 'New Dropdown Item', path: parent.link || '/shop', query: parent.name || '', image: '', price: '', isActive: true }
      ];
      updated[parentIdx] = parent;
      return updated;
    });
  };

  const handleRemoveDropdownItem = (parentIdx, dropIdx) => {
    setNavItems(prev => {
      const updated = [...prev];
      const parent = { ...updated[parentIdx] };
      parent.dropdownItems = (parent.dropdownItems || []).filter((_, i) => i !== dropIdx);
      updated[parentIdx] = parent;
      return updated;
    });
  };

  const handleDropdownItemChange = (parentIdx, dropIdx, field, value) => {
    setNavItems(prev => {
      const updated = [...prev];
      const parent = { ...updated[parentIdx] };
      const subItems = [...(parent.dropdownItems || [])];
      subItems[dropIdx] = { ...subItems[dropIdx], [field]: value };
      parent.dropdownItems = subItems;
      updated[parentIdx] = parent;
      return updated;
    });
  };

  const handleToggleDropdownItemActive = (parentIdx, dropIdx) => {
    setNavItems(prev => {
      const updated = [...prev];
      const parent = { ...updated[parentIdx] };
      const subItems = [...(parent.dropdownItems || [])];
      subItems[dropIdx] = { ...subItems[dropIdx], isActive: subItems[dropIdx].isActive === false };
      parent.dropdownItems = subItems;
      updated[parentIdx] = parent;
      return updated;
    });
  };

  const handleMoveDropdownItem = (parentIdx, dropIdx, direction) => {
    const parent = navItems[parentIdx];
    const subItems = parent.dropdownItems || [];
    let target = dropIdx;
    if (direction === 'top') {
      target = 0;
    } else if (direction === 'bottom') {
      target = subItems.length - 1;
    } else {
      target = direction === 'up' ? dropIdx - 1 : dropIdx + 1;
    }
    if (target < 0 || target >= subItems.length || target === dropIdx) return;

    setNavItems(prev => {
      const updated = [...prev];
      const p = { ...updated[parentIdx] };
      const updatedSub = [...p.dropdownItems];
      const [itemToMove] = updatedSub.splice(dropIdx, 1);
      updatedSub.splice(target, 0, itemToMove);
      p.dropdownItems = updatedSub;
      updated[parentIdx] = p;
      return updated;
    });
  };

  const handleImageUpload = async (parentIdx, dropIdx, file) => {
    if (!file) return;
    const key = `${parentIdx}-${dropIdx}`;
    setUploadingImage(key);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axiosClient.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        handleDropdownItemChange(parentIdx, dropIdx, 'image', res.data.url);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axiosClient.put('/settings', { navbarMenuItems: navItems });
      notifyAdminChange('categories', { action: 'update_navbar' });
      showSuccessMessage('Navbar Menu & Dropdown Sub-Items updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save navbar items');
    } finally {
      setSaving(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Toast Notification */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{success}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans flex items-center gap-2.5">
            <Navigation className="h-6 w-6 text-[#0071e3]" />
            Navbar Dropdown Manager
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage storefront navbar categories, sub-items list (product names) and their right-side showcase preview images!
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-0 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Category Menu Item
        </button>
      </header>

      {/* Form Container */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#0071e3]" />
          <span>Loading Navbar menu settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {navItems.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const subItemsCount = (item.dropdownItems || []).length;

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-3xl border transition-all ${
                    item.isActive !== false 
                      ? 'bg-zinc-50/70 border-zinc-250 hover:border-zinc-300' 
                      : 'bg-zinc-100/60 border-zinc-200 opacity-60'
                  }`}
                >
                  {/* Top Level Item Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xs font-extrabold text-zinc-400 bg-white border border-zinc-200 px-2.5 py-1.5 rounded-xl shrink-0">
                        #{idx + 1}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                        <div>
                          <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                            Navbar Item Label (e.g. Mac, iPhone)
                          </label>
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder="e.g. iPhone, Mac, Watch..."
                            className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:border-[#0071e3] outline-none bg-white text-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                            Target Path URL
                          </label>
                          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 focus-within:border-[#0071e3]">
                            <LinkIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <input
                              type="text"
                              value={item.link || ''}
                              onChange={(e) => handleItemChange(idx, 'link', e.target.value)}
                              placeholder="e.g. /iphone, /macbook..."
                              className="w-full text-xs font-mono outline-none bg-transparent text-zinc-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(idx)}
                        className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                          item.isActive !== false 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                        }`}
                      >
                        {item.isActive !== false ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-500" />}
                        {item.isActive !== false ? 'Active' : 'Hidden'}
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveItem(idx, 'up')}
                        className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 cursor-pointer shadow-2xs"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === navItems.length - 1}
                        onClick={() => handleMoveItem(idx, 'down')}
                        className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 cursor-pointer shadow-2xs"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer ml-1"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Items Accordion Toggle */}
                  <div className="mt-4 pt-3 border-t border-zinc-200/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="flex items-center gap-2 text-xs font-bold text-[#0071e3] hover:text-[#005bb5] cursor-pointer"
                    >
                      <Layers className="h-4 w-4" />
                      <span>
                        {isExpanded ? 'Hide' : 'Manage'} Explore Sub-Names & Preview Images ({subItemsCount})
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {!isExpanded && (
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {subItemsCount > 0 
                          ? `${subItemsCount} dropdown items configured` 
                          : 'No dropdown items'}
                      </span>
                    )}
                  </div>

                  {/* Dropdown Sub-Items Editor Box */}
                  {isExpanded && (
                    <div className="mt-4 p-5 rounded-2xl bg-white border border-zinc-250 space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-[#0071e3]" />
                            Explore Sub-Items for "{item.name}"
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Edit sub-names, hide/show names, move to first position, and set hover preview image & price text.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddDropdownItem(idx)}
                          className="text-xs font-bold text-[#0071e3] hover:text-[#005bb5] flex items-center gap-1 cursor-pointer bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-xl"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Sub-Name Item
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(item.dropdownItems || []).map((subItem, sIdx) => {
                          const uploadKey = `${idx}-${sIdx}`;
                          const isUploading = uploadingImage === uploadKey;

                          return (
                            <div 
                              key={sIdx}
                              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                subItem.isActive !== false 
                                  ? 'bg-zinc-50 border-zinc-200' 
                                  : 'bg-zinc-100 opacity-60 border-zinc-200'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                {/* Left Badges & Title */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                                    #{sIdx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-zinc-900">
                                    {subItem.label || 'Untitled Sub-Item'}
                                  </span>
                                  {sIdx === 0 && (
                                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      First / Top Position
                                    </span>
                                  )}
                                </div>

                                {/* Controls: Hide/Show, Move to First, Move Up, Move Down, Delete */}
                                <div className="flex items-center gap-1.5 justify-end shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDropdownItemActive(idx, sIdx)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                                      subItem.isActive !== false 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                        : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                                    }`}
                                  >
                                    {subItem.isActive !== false ? <Eye className="h-3 w-3 text-emerald-600" /> : <EyeOff className="h-3 w-3 text-zinc-500" />}
                                    {subItem.isActive !== false ? 'Show' : 'Hide'}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={sIdx === 0}
                                    onClick={() => handleMoveDropdownItem(idx, sIdx, 'top')}
                                    className="px-2 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1"
                                    title="Move to First Position"
                                  >
                                    <ArrowUpToLine className="h-3 w-3" />
                                    Make First
                                  </button>

                                  <button
                                    type="button"
                                    disabled={sIdx === (item.dropdownItems || []).length - 1}
                                    onClick={() => handleMoveDropdownItem(idx, sIdx, 'bottom')}
                                    className="px-2 py-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 border border-purple-200 rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1"
                                    title="Move to Last Position"
                                  >
                                    <ArrowDownToLine className="h-3 w-3" />
                                    Make Last
                                  </button>

                                  <button
                                    type="button"
                                    disabled={sIdx === 0}
                                    onClick={() => handleMoveDropdownItem(idx, sIdx, 'up')}
                                    className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={sIdx === (item.dropdownItems || []).length - 1}
                                    onClick={() => handleMoveDropdownItem(idx, sIdx, 'down')}
                                    className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDropdownItem(idx, sIdx)}
                                    className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer ml-1"
                                    title="Delete Sub-Item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Form Inputs Grid for Sub-Item */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-zinc-200/60">
                                {/* Label Input */}
                                <div>
                                  <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                                    Sub-Name (Label)
                                  </label>
                                  <input
                                    type="text"
                                    value={subItem.label || ''}
                                    onChange={(e) => handleDropdownItemChange(idx, sIdx, 'label', e.target.value)}
                                    placeholder="e.g. MacBook Neo, Explore All Mac"
                                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold outline-none bg-white text-zinc-900 focus:border-[#0071e3]"
                                  />
                                </div>

                                {/* Target Path Input */}
                                <div>
                                  <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                                    Target Path / URL
                                  </label>
                                  <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 focus-within:border-[#0071e3]">
                                    <LinkIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={subItem.path || ''}
                                      onChange={(e) => handleDropdownItemChange(idx, sIdx, 'path', e.target.value)}
                                      placeholder="e.g. /macbook?search=MacBook Neo"
                                      className="w-full text-xs font-mono outline-none bg-transparent text-zinc-800"
                                    />
                                  </div>
                                </div>

                                {/* Subtitle / Price Text */}
                                <div>
                                  <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                                    Preview Price / Subtitle
                                  </label>
                                  <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 focus-within:border-[#0071e3]">
                                    <Tag className="h-3 w-3 text-zinc-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={subItem.price || ''}
                                      onChange={(e) => handleDropdownItemChange(idx, sIdx, 'price', e.target.value)}
                                      placeholder="e.g. From ₹1,14,900"
                                      className="w-full text-xs font-sans outline-none bg-transparent text-zinc-800"
                                    />
                                  </div>
                                </div>

                                {/* Hover Preview Image URL & Upload */}
                                <div>
                                  <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                                    Hover Preview Image
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    {subItem.image && (
                                      <div className="h-8 w-8 rounded-lg border border-zinc-200 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                                        <img src={subItem.image} alt="" className="max-h-full max-w-full object-contain" />
                                      </div>
                                    )}
                                    <div className="flex-1 flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2 py-1 focus-within:border-[#0071e3]">
                                      <ImageIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                                      <input
                                        type="text"
                                        value={subItem.image || ''}
                                        onChange={(e) => handleDropdownItemChange(idx, sIdx, 'image', e.target.value)}
                                        placeholder="/mac_dark_banner.jpg or URL"
                                        className="w-full text-[11px] font-mono outline-none bg-transparent text-zinc-800"
                                      />
                                    </div>
                                    <label className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg cursor-pointer shrink-0" title="Upload Custom Image">
                                      {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0071e3]" /> : <Upload className="h-3.5 w-3.5" />}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(idx, sIdx, e.target.files[0])}
                                      />
                                    </label>
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddDropdownItem(idx)}
                        className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-[#0071e3] text-zinc-600 hover:text-[#0071e3] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-50/50 hover:bg-blue-50/30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Another Sub-Name to "{item.name}"
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Another Category Menu Item
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] disabled:bg-zinc-400 text-white px-7 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer border-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Publish Navbar & Dropdowns
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
