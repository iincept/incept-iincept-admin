import { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  Grid, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Loader2, 
  Save, 
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  ArrowUpToLine,
  ArrowDownToLine,
  Tag,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Tv,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const DEFAULT_CATEGORY_GROUPS = [
  {
    categoryKey: 'mac',
    categoryName: 'Mac',
    icon: Laptop,
    icons: [
      { label: 'MacBook Neo', path: '/macbook?search=MacBook Neo', query: 'MacBook Neo', image: '/mac_nav/macbook_neo.png', price: 'High Performance', isActive: true },
      { label: 'MacBook Air', path: '/macbook?search=MacBook Air', query: 'MacBook Air', image: '/mac_nav/macbook_air.png', price: 'From ₹1,14,900', isActive: true },
      { label: 'MacBook Pro', path: '/macbook?search=MacBook Pro', query: 'MacBook Pro', image: '/mac_nav/macbook_pro.png', price: 'From ₹1,69,900', isActive: true },
      { label: 'iMac', path: '/macbook?search=iMac', query: 'iMac', image: '/imac_studio_lifestyle.jpg', price: 'From ₹1,29,900', isActive: true },
      { label: 'Mac mini', path: '/macbook?search=Mac mini', query: 'Mac mini', image: 'https://www.apple.com/assets-www/en_WW/mac/04_chapternav/small/nav_mac_mini_f628f615d_2x.png', price: 'From ₹54,900', isActive: true },
      { label: 'Mac Studio', path: '/macbook?search=Mac Studio', query: 'Mac Studio', image: '/mac_nav/mac_studio.png', price: 'From ₹1,99,900', isActive: true },
      { label: 'Compare', path: '/compare?category=mac', query: 'Compare', image: '/mac_nav/mac_compare.png', price: 'Compare Specs', isActive: true },
      { label: 'Displays', path: '/macbook?search=Studio Display', query: 'Display', image: '/mac_nav/mac_displays.png', price: 'Retina Panels', isActive: true },
      { label: 'AppleCare+', path: '/applecare', query: 'AppleCare', image: '/applecare_official_hero.png', price: 'Official Protection', isActive: true },
    ]
  },
  {
    categoryKey: 'iphone',
    categoryName: 'iPhone',
    icon: Smartphone,
    icons: [
      { label: 'iPhone 17 Pro', path: '/iphone?search=iPhone 17 Pro', query: 'iPhone 17 Pro', image: '/iphone_nav/iphone_17_pro.png', price: 'From ₹1,34,900', isActive: true },
      { label: 'iPhone Air', path: '/iphone?search=iPhone Air', query: 'iPhone Air', image: '/iphone_nav/iphone_air.png', price: 'From ₹89,900', isActive: true },
      { label: 'iPhone 17', path: '/iphone?search=iPhone 17', query: 'iPhone 17', image: '/iphone_nav/iphone_17.png', price: 'From ₹79,900', isActive: true },
      { label: 'iPhone 17e', path: '/iphone?search=iPhone 17e', query: 'iPhone 17e', image: '/iphone_nav/iphone_17e.png', price: 'From ₹59,900', isActive: true },
      { label: 'iPhone 16', path: '/iphone?search=iPhone 16', query: 'iPhone 16', image: '/iphone_nav/iphone_16.png', price: 'From ₹79,900', isActive: true },
      { label: 'Compare', path: '/compare?category=iphone', query: 'Compare', image: '/iphone_nav/iphone_compare.png', price: 'Compare Specs', isActive: true },
      { label: 'Accessories', path: '/accessories', query: 'Accessories', image: '/iphone_nav/accessories.png', price: 'MagSafe & Cases', isActive: true },
      { label: 'Shop iPhone', path: '/iphone', query: 'Shop iPhone', image: '/iphone_nav/shop_iphone.png', price: 'Browse All', isActive: true }
    ]
  },
  {
    categoryKey: 'ipad',
    categoryName: 'iPad',
    icon: Tablet,
    icons: [
      { label: 'iPad Pro', path: '/ipad?search=iPad Pro', query: 'iPad Pro', image: '/ipad_nav/ipad_pro.png', price: 'From ₹99,900', isActive: true },
      { label: 'iPad Air', path: '/ipad?search=iPad Air', query: 'iPad Air', image: '/ipad_nav/ipad_air.png', price: 'From ₹59,900', isActive: true },
      { label: 'iPad', path: '/ipad?search=iPad', query: 'iPad', image: '/ipad_nav/ipad.png', price: 'From ₹34,900', isActive: true },
      { label: 'iPad mini', path: '/ipad?search=iPad mini', query: 'iPad mini', image: '/ipad_nav/ipad_mini.png', price: 'From ₹49,900', isActive: true },
      { label: 'Compare', path: '/compare?category=ipad', query: 'Compare', image: '/ipad_nav/ipad_compare.png', price: 'Compare Specs', isActive: true },
      { label: 'Apple Pencil', path: '/ipad?search=Pencil', query: 'Pencil', image: '/ipad_nav/apple_pencil.png', price: 'From ₹11,900', isActive: true },
      { label: 'Keyboards', path: '/ipad?search=Keyboard', query: 'Keyboard', image: '/ipad_nav/keyboards.png', price: 'Magic Keyboard', isActive: true },
      { label: 'Accessories', path: '/ipad?search=Accessories', query: 'Accessories', image: '/ipad_nav/accessories.png', price: 'Cases & Covers', isActive: true }
    ]
  },
  {
    categoryKey: 'watch',
    categoryName: 'Watch',
    icon: Watch,
    icons: [
      { label: 'Apple Watch Series 10', path: '/watch?search=Series 10', query: 'Series 10', image: '/watch_category_uploaded.png', price: 'From ₹46,900', isActive: true },
      { label: 'Apple Watch Ultra 2', path: '/watch?search=Ultra', query: 'Ultra', image: '/apple_watch_health.jpg', price: 'From ₹89,900', isActive: true },
      { label: 'Apple Watch SE', path: '/watch?search=SE', query: 'SE', image: '/watch_category.jpg', price: 'From ₹29,900', isActive: true },
      { label: 'Compare Watch', path: '/compare?category=watch', query: 'Compare', image: '/watch_category_uploaded.png', price: 'Compare Specs', isActive: true }
    ]
  },
  {
    categoryKey: 'airpods',
    categoryName: 'AirPods',
    icon: Headphones,
    icons: [
      { label: 'AirPods Pro 2', path: '/airpods?search=Pro', query: 'Pro', image: '/airpods_pro_3.jpg', price: 'From ₹24,900', isActive: true },
      { label: 'AirPods 4', path: '/airpods?search=AirPods 4', query: 'AirPods 4', image: '/airpods_category_uploaded.png', price: 'From ₹12,900', isActive: true },
      { label: 'AirPods Max', path: '/airpods?search=Max', query: 'Max', image: '/airpods_category.jpg', price: 'From ₹59,900', isActive: true }
    ]
  },
  {
    categoryKey: 'tv-home',
    categoryName: 'TV & Home',
    icon: Tv,
    icons: [
      { label: 'Apple TV 4K', path: '/tv-home?search=Apple TV', query: 'Apple TV', image: '/tv_banner_1.jpg', price: 'From ₹14,900', isActive: true },
      { label: 'HomePod', path: '/tv-home?search=HomePod', query: 'HomePod', image: '/homepod_category.jpg', price: 'From ₹32,900', isActive: true },
      { label: 'HomePod mini', path: '/tv-home?search=HomePod mini', query: 'HomePod mini', image: '/tv_home_homepods.jpg', price: 'From ₹9,900', isActive: true }
    ]
  },
  {
    categoryKey: 'accessories',
    categoryName: 'Accessories',
    icon: Sparkles,
    icons: [
      { label: 'iPhone', path: '/accessories?product=iphone', query: 'iPhone', image: '/uploads/upload_1794292689853_322.png', price: 'Cases, MagSafe & Power', isActive: true },
      { label: 'iPad', path: '/accessories?product=ipad', query: 'iPad', image: '/uploads/upload_1794292702660_545.png', price: 'Keyboards, Pencils & Folios', isActive: true },
      { label: 'Mac', path: '/accessories?product=mac', query: 'Mac', image: '/uploads/upload_1794293051487_815.png', price: 'Mice, Keyboards & Docks', isActive: true },
      { label: 'Apple Watch', path: '/accessories?product=watch', query: 'Watch', image: '/uploads/upload_1794292728655_907.png', price: 'Bands & Chargers', isActive: true },
      { label: 'AirPods', path: '/accessories?product=airpods', query: 'AirPods', image: '/uploads/upload_1794292736726_552.png', price: 'Cases & Lanyards', isActive: true },
      { label: 'Home', path: '/accessories?product=home', query: 'Home', image: '/uploads/upload_1794292742147_25.png', price: 'Audio & Remotes', isActive: true },
      { label: 'AirTag', path: '/accessories?product=airtag', query: 'AirTag', image: '/uploads/upload_1794292747643_181.png', price: 'Straps & Key Rings', isActive: true },
      { label: 'Beats', path: '/accessories?product=beats', query: 'Beats', image: '/uploads/upload_1794292752316_305.png', price: 'Headphones & Earbuds', isActive: true }
    ]
  },
  {
    categoryKey: 'applecare',
    categoryName: 'AppleCare Category',
    icon: ShieldCheck,
    icons: [
      { label: 'iPhone AppleCare', path: '/applecare?category=iPhone', query: 'iPhone', image: '/iphone_category_v2.jpg', price: 'From ₹11,900 for 2 yrs', isActive: true },
      { label: 'Mac AppleCare', path: '/applecare?category=Mac', query: 'Mac', image: '/macbook_category_v3.jpg', price: 'From ₹12,900 for 3 yrs', isActive: true },
      { label: 'iPad AppleCare', path: '/applecare?category=iPad', query: 'iPad', image: '/ipad_category_v3.png', price: 'From ₹8,900 for 2 yrs', isActive: true },
      { label: 'Watch AppleCare', path: '/applecare?category=Watch', query: 'Watch', image: '/watch_category.jpg', price: 'From ₹4,900 for 2 yrs', isActive: true },
      { label: 'AirPods AppleCare', path: '/applecare?category=AirPods', query: 'AirPods', image: '/airpods_category.jpg', price: 'From ₹2,900 for 2 yrs', isActive: true },
      { label: 'TV & Home AppleCare', path: '/applecare?category=TV', query: 'TV', image: '/tv_home_category_uploaded.jpg', price: 'From ₹2,900 for 3 yrs', isActive: true }
    ]
  }
];

export default function CategoryIconsManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState('mac');
  const [groups, setGroups] = useState(DEFAULT_CATEGORY_GROUPS);
  const [isUploadingMap, setIsUploadingMap] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/settings');
      if (response.data) {
        if (response.data.categoryIconGroups && response.data.categoryIconGroups.length > 0) {
          let fetchedGroups = response.data.categoryIconGroups.map(g => ({
            ...g,
            icons: (g.icons || []).map(ic => ({ ...ic, isActive: ic.isActive !== false }))
          }));
          DEFAULT_CATEGORY_GROUPS.forEach(def => {
            if (!fetchedGroups.some(g => g.categoryKey === def.categoryKey)) {
              fetchedGroups.push(def);
            }
          });
          setGroups(fetchedGroups);
        } else {
          setGroups(DEFAULT_CATEGORY_GROUPS);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load category icon settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosClient.put('/settings', {
        categoryIconGroups: groups
      });
      notifyAdminChange('categories', { action: 'update_category_icons' });

      showSuccessMessage('Category Icons & Models updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save category icons');
    } finally {
      setSaving(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const currentGroupIndex = groups.findIndex(g => g.categoryKey === activeCategoryKey);
  const currentGroup = groups[currentGroupIndex] || groups[0];

  const handleIconChange = (iconIdx, field, value) => {
    setGroups(prev => {
      const updated = [...prev];
      const grp = { ...updated[currentGroupIndex] };
      const icons = [...(grp.icons || [])];
      icons[iconIdx] = { ...icons[iconIdx], [field]: value };
      grp.icons = icons;
      updated[currentGroupIndex] = grp;
      return updated;
    });
  };

  const handleToggleIconActive = (iconIdx) => {
    setGroups(prev => {
      const updated = [...prev];
      const grp = { ...updated[currentGroupIndex] };
      const icons = [...(grp.icons || [])];
      icons[iconIdx] = { ...icons[iconIdx], isActive: icons[iconIdx].isActive === false };
      grp.icons = icons;
      updated[currentGroupIndex] = grp;
      return updated;
    });
  };

  const handleMoveIcon = (iconIdx, direction) => {
    const icons = [...(currentGroup.icons || [])];
    let target = iconIdx;
    if (direction === 'top') {
      target = 0;
    } else if (direction === 'bottom') {
      target = icons.length - 1;
    } else {
      target = direction === 'up' ? iconIdx - 1 : iconIdx + 1;
    }
    if (target < 0 || target >= icons.length || target === iconIdx) return;

    setGroups(prev => {
      const updated = [...prev];
      const grp = { ...updated[currentGroupIndex] };
      const updatedIcons = [...grp.icons];
      const [itemToMove] = updatedIcons.splice(iconIdx, 1);
      updatedIcons.splice(target, 0, itemToMove);
      grp.icons = updatedIcons;
      updated[currentGroupIndex] = grp;
      return updated;
    });
  };

  const handleRemoveIcon = (iconIdx) => {
    if (!window.confirm(`Delete "${currentGroup.icons[iconIdx]?.label || 'this model'}" icon?`)) return;
    setGroups(prev => {
      const updated = [...prev];
      const grp = { ...updated[currentGroupIndex] };
      grp.icons = (grp.icons || []).filter((_, i) => i !== iconIdx);
      updated[currentGroupIndex] = grp;
      return updated;
    });
  };

  const handleAddIcon = () => {
    const newIcon = {
      label: `New ${currentGroup.categoryName} Model`,
      path: `/${currentGroup.categoryKey}`,
      query: `New ${currentGroup.categoryName} Model`,
      image: '',
      price: '',
      isActive: true
    };
    setGroups(prev => {
      const updated = [...prev];
      const grp = { ...updated[currentGroupIndex] };
      grp.icons = [...(grp.icons || []), newIcon];
      updated[currentGroupIndex] = grp;
      return updated;
    });
  };

  const handleImageUpload = async (iconIdx, file) => {
    if (!file) return;
    setIsUploadingMap(prev => ({ ...prev, [iconIdx]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      let res;
      try {
        res = await axiosClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (e) {
        res = await axiosClient.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      if (res.data?.url) {
        let uploadedUrl = res.data.url;
        if (!uploadedUrl.startsWith('http://') && !uploadedUrl.startsWith('https://') && !uploadedUrl.startsWith('data:') && !uploadedUrl.startsWith('/')) {
          uploadedUrl = '/' + uploadedUrl;
        }
        handleIconChange(iconIdx, 'image', uploadedUrl);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image icon');
    } finally {
      setIsUploadingMap(prev => ({ ...prev, [iconIdx]: false }));
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto select-none">
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
            <Grid className="h-6 w-6 text-[#0071e3]" />
            Category Sub-Model Icons Manager
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Dedicated manager for Mac, iPhone, iPad, Watch, AirPods model icons! Add, Delete, Make First, Make Last, Reorder, and Upload Icons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-0 shrink-0 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Category Icons
        </button>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Category Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {groups.map((group) => {
          const isActive = group.categoryKey === activeCategoryKey;
          return (
            <button
              key={group.categoryKey}
              type="button"
              onClick={() => setActiveCategoryKey(group.categoryKey)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span>{group.categoryName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'}`}>
                {group.icons?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Model Icons Grid */}
      {loading ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-zinc-200 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900">
                {currentGroup.categoryName} Model Icons ({currentGroup.icons?.length || 0})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage the horizontal icon navigation bar at the top of the {currentGroup.categoryName} page
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddIcon}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add {currentGroup.categoryName} Icon Model
            </button>
          </div>

          {/* Model Icon Items List */}
          <div className="space-y-4">
            {(currentGroup.icons || []).map((iconItem, sIdx) => (
              <div
                key={sIdx}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  iconItem.isActive !== false ? 'bg-zinc-50/70 border-zinc-200' : 'bg-zinc-100/50 border-zinc-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-black">
                      #{sIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">
                      {iconItem.label || 'Untitled Model'}
                    </span>
                    {sIdx === 0 && (
                      <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        First Position
                      </span>
                    )}
                    {sIdx === (currentGroup.icons || []).length - 1 && (
                      <span className="text-[9px] font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Last Position
                      </span>
                    )}
                  </div>

                  {/* Icon Actions: Make First, Make Last, Move Up, Move Down, Toggle Hide/Show, Delete */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleIconActive(sIdx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                        iconItem.isActive !== false 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                      }`}
                    >
                      {iconItem.isActive !== false ? <Eye className="h-3 w-3 text-emerald-600" /> : <EyeOff className="h-3 w-3 text-zinc-500" />}
                      {iconItem.isActive !== false ? 'Show' : 'Hide'}
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleMoveIcon(sIdx, 'top')}
                      className="px-2 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1"
                      title="Move to First Position"
                    >
                      <ArrowUpToLine className="h-3 w-3" />
                      Make First
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === (currentGroup.icons || []).length - 1}
                      onClick={() => handleMoveIcon(sIdx, 'bottom')}
                      className="px-2 py-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 border border-purple-200 rounded-lg disabled:opacity-30 cursor-pointer flex items-center gap-1"
                      title="Move to Last Position"
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                      Make Last
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleMoveIcon(sIdx, 'up')}
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === (currentGroup.icons || []).length - 1}
                      onClick={() => handleMoveIcon(sIdx, 'down')}
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveIcon(sIdx)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer ml-1"
                      title="Delete Icon"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-zinc-200/60">
                  {/* Model Label */}
                  <div>
                    <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                      Model Icon Name
                    </label>
                    <input
                      type="text"
                      value={iconItem.label || ''}
                      onChange={(e) => handleIconChange(sIdx, 'label', e.target.value)}
                      placeholder="e.g. MacBook Neo, iPhone 17 Pro"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold outline-none bg-white text-zinc-900 focus:border-[#0071e3]"
                    />
                  </div>

                  {/* Target Link */}
                  <div>
                    <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                      Target Link / Path
                    </label>
                    <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 focus-within:border-[#0071e3]">
                      <LinkIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                      <input
                        type="text"
                        value={iconItem.path || ''}
                        onChange={(e) => handleIconChange(sIdx, 'path', e.target.value)}
                        placeholder="e.g. /macbook?search=MacBook Neo"
                        className="w-full text-xs font-mono outline-none bg-transparent text-zinc-800"
                      />
                    </div>
                  </div>

                  {/* Subtitle / Price */}
                  <div>
                    <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                      Subtitle / Price Text
                    </label>
                    <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 focus-within:border-[#0071e3]">
                      <Tag className="h-3 w-3 text-zinc-400 shrink-0" />
                      <input
                        type="text"
                        value={iconItem.price || ''}
                        onChange={(e) => handleIconChange(sIdx, 'price', e.target.value)}
                        placeholder="e.g. From ₹1,14,900"
                        className="w-full text-xs font-sans outline-none bg-transparent text-zinc-800"
                      />
                    </div>
                  </div>

                  {/* Image Icon & Upload */}
                  <div>
                    <label className="block text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1">
                      Model Icon Image
                    </label>
                    <div className="flex items-center gap-1.5">
                      {iconItem.image && (
                        <div className="h-8 w-8 rounded-lg border border-zinc-200 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                          <img 
                            src={iconItem.image.startsWith('/') || iconItem.image.startsWith('http') || iconItem.image.startsWith('data:') ? iconItem.image : '/' + iconItem.image} 
                            alt="" 
                            onError={(e) => {
                              e.currentTarget.src = '/applecare_official_hero.png';
                            }}
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                      )}
                      <div className="flex-1 flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2 py-1 focus-within:border-[#0071e3]">
                        <ImageIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                        <input
                          type="text"
                          value={iconItem.image || ''}
                          onChange={(e) => handleIconChange(sIdx, 'image', e.target.value)}
                          placeholder="/mac_nav/macbook_neo.png or URL"
                          className="w-full text-[11px] font-mono outline-none bg-transparent text-zinc-800"
                        />
                      </div>
                      <label className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg cursor-pointer shrink-0" title="Upload Icon Image">
                        {isUploadingMap[sIdx] ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0071e3]" /> : <Upload className="h-3.5 w-3.5" />}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(sIdx, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddIcon}
            className="w-full py-3 border border-dashed border-zinc-300 hover:border-[#0071e3] text-zinc-600 hover:text-[#0071e3] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-50/50 hover:bg-blue-50/30 mt-4"
          >
            <Plus className="h-4 w-4" />
            Add Another {currentGroup.categoryName} Icon Model
          </button>
        </div>
      )}
    </div>
  );
}
