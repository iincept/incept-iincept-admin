import { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  Star,
  Home,
  Monitor,
  Smartphone
} from 'lucide-react';

export default function HeroBanners() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  const [siteForm, setSiteForm] = useState({
    homeHeroBadge: 'Apple Authorised Resellers across India',
    homeHeroTitle: 'The latest.\nThe best. Authorised.',
    homeHeroSubtitle: 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
    homeHeroPrimaryBtnText: 'Shop Now',
    homeHeroPrimaryBtnLink: '/iphone',
    homeHeroSecondaryBtnText: 'Find Nearest Store',
    homeHeroSecondaryBtnLink: '#store-locator',
    homeHeroImage: '',
    dealEyebrow: 'Deal of the Week',
    dealTitle: 'MacBook Neo – Stock Clearance',
    dealDesc: 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.',
    dealPrice: '₹72,900',
    dealOldPrice: '₹79,900',
    dealButtonText: 'Grab the Deal',
    dealButtonLink: '/macbook',
    dealImage: '/mac_nav/macbook_neo.png',
    announcement: '',
    announcementBold: '',
    announcementNormal: '',
    heroSlides: [],
    testimonials: [],
    homeCategoryIcons: []
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data) {
        setSiteForm({
          homeHeroBadge: response.data.homeHeroBadge || 'Apple Authorised Resellers across India',
          homeHeroTitle: response.data.homeHeroTitle || 'The latest.\nThe best. Authorised.',
          homeHeroSubtitle: response.data.homeHeroSubtitle || 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
          homeHeroPrimaryBtnText: response.data.homeHeroPrimaryBtnText || 'Shop Now',
          homeHeroPrimaryBtnLink: response.data.homeHeroPrimaryBtnLink || '/iphone',
          homeHeroSecondaryBtnText: response.data.homeHeroSecondaryBtnText || 'Find Nearest Store',
          homeHeroSecondaryBtnLink: response.data.homeHeroSecondaryBtnLink || '#store-locator',
          homeHeroImage: response.data.homeHeroImage || '',
          dealEyebrow: response.data.dealEyebrow || 'Deal of the Week',
          dealTitle: response.data.dealTitle || 'MacBook Neo – Stock Clearance',
          dealDesc: response.data.dealDesc || 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.',
          dealPrice: response.data.dealPrice || '₹72,900',
          dealOldPrice: response.data.dealOldPrice || '₹79,900',
          dealButtonText: response.data.dealButtonText || 'Grab the Deal',
          dealButtonLink: response.data.dealButtonLink || '/macbook',
          dealImage: response.data.dealImage || '/mac_nav/macbook_neo.png',
          homeCategoryIcons: response.data.homeCategoryIcons || [],
          announcement: response.data.announcement || '',
          announcementBold: response.data.announcementBold || '🔥 FREE SHIPPING',
          announcementNormal: response.data.announcementNormal || 'ON ORDERS ABOVE INR 1,499',
          testimonials: response.data.testimonials && response.data.testimonials.length > 0
            ? response.data.testimonials.map(t => ({ ...t, isActive: t.isActive !== false }))
            : [
                { stars: 5, text: '"Procured 40 MacBooks for our new office in 3 days, GST invoice sorted same week."', author: '— IT Head, Fintech firm, Bengaluru', isActive: true },
                { stars: 5, text: '"Our gifting desk orders AirPods every quarter — consolidated billing makes finance happy."', author: '— Procurement Lead, D2C brand, Mumbai', isActive: true },
                { stars: 5, text: '"Quote turnaround was faster than two other resellers we checked."', author: '— Ops Manager, Consulting firm, Delhi NCR', isActive: true },
                { stars: 5, text: '"Reliable for repeat bulk orders, delivered to three city offices without issue."', author: '— Admin Head, BPO, Pune', isActive: true }
              ],
          heroSlides: response.data.heroSlides && response.data.heroSlides.length > 0 
            ? response.data.heroSlides.map(s => ({ 
                ...s, 
                badge: s.badge || 'APPLE AUTHORISED RESELLERS ACROSS INDIA',
                isActive: s.isActive !== false,
                hideText: s.hideText !== false,
                imageFit: s.imageFit || 'cover',
                focalPosition: s.focalPosition || 'center',
                textAlignment: s.textAlignment || 'left',
                overlayStyle: s.overlayStyle || 'gradient',
                mobileImage: s.mobileImage || '',
                secondaryButtonText: s.secondaryButtonText || 'Find Nearest Store',
                secondaryButtonLink: s.secondaryButtonLink || '#store-locator',
                titleBold: s.titleBold || '',
                titleNormal: s.titleNormal || '',
                stat1Bold: s.stat1Bold || 'GST invoicing',
                stat1Normal: s.stat1Normal || 'on every order',
                stat2Bold: s.stat2Bold || 'Volume pricing',
                stat2Normal: s.stat2Normal || 'on bulk orders',
                stat3Bold: s.stat3Bold || 'Pan-India',
                stat3Normal: s.stat3Normal || 'delivery & tracking',
              }))
            : [
                {
                  badge: "APPLE AUTHORISED RESELLERS ACROSS INDIA",
                  title: response.data.heroTitle1 || "Apple devices for your business, sourced right, delivered anywhere in India.",
                  titleBold: "Apple devices for your business,",
                  titleNormal: "sourced right, delivered anywhere in India.",
                  subtitle: response.data.heroSubtitle1 || "Bulk pricing, GST invoicing, dedicated account support and consolidated billing.",
                  buttonText: response.data.heroButtonText1 || "Request Bulk Quote →",
                  buttonLink: "#procurement-section",
                  secondaryButtonText: "Find Nearest Store",
                  secondaryButtonLink: "#store-locator",
                  image: "",
                  mobileImage: "",
                  imageFit: "cover",
                  focalPosition: "center",
                  textAlignment: "left",
                  overlayStyle: "gradient",
                  bgStyle: "slide-dark",
                  isActive: true,
                  hideText: true,
                  stat1Bold: "GST invoicing",
                  stat1Normal: "on every order",
                  stat2Bold: "Volume pricing",
                  stat2Normal: "on bulk orders",
                  stat3Bold: "Pan-India",
                  stat3Normal: "delivery & tracking",
                }
              ],
        });
      }
    } catch (err) {
      console.error('Failed to load hero banner settings:', err);
    }
  };

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.put('/settings', siteForm);
      notifyAdminChange('settings', { action: 'update_banners' });
      showSuccessMessage('Homepage & Hero Banners updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    setSiteForm((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        {
          badge: "APPLE AUTHORISED RESELLERS ACROSS INDIA",
          title: "New Promotional Banner Title",
          titleBold: "New Promotional Banner",
          titleNormal: "Title",
          subtitle: "Add your banner description or promotional offer text here.",
          buttonText: "Explore Now →",
          buttonLink: "/shop",
          secondaryButtonText: "Find Nearest Store",
          secondaryButtonLink: "#store-locator",
          image: "",
          mobileImage: "",
          imageFit: "cover",
          focalPosition: "center",
          textAlignment: "left",
          overlayStyle: "gradient",
          bgStyle: "slide-light",
          isActive: true,
          hideText: true
        }
      ]
    }));
  };

  const handleRemoveSlide = async (index) => {
    if (siteForm.heroSlides.length <= 1) {
      alert("At least 1 hero banner is required.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this banner slide?")) {
      return;
    }
    const updatedSlides = siteForm.heroSlides.filter((_, i) => i !== index);
    setSiteForm((prev) => ({
      ...prev,
      heroSlides: updatedSlides
    }));
    try {
      await axiosClient.put('/settings', { ...siteForm, heroSlides: updatedSlides });
      notifyAdminChange('settings', { action: 'update_banners' });
      showSuccessMessage('Banner slide removed successfully!');
    } catch (err) {
      console.error('Failed to auto-save slide deletion:', err);
    }
  };

  const handleSlideChange = (index, field, value) => {
    setSiteForm((prev) => {
      const updatedSlides = [...prev.heroSlides];
      updatedSlides[index] = {
        ...updatedSlides[index],
        [field]: value
      };
      return { ...prev, heroSlides: updatedSlides };
    });
  };

  const handleToggleActive = (index) => {
    setSiteForm((prev) => {
      const updatedSlides = [...prev.heroSlides];
      const currentActive = updatedSlides[index].isActive !== false;
      updatedSlides[index] = {
        ...updatedSlides[index],
        isActive: !currentActive
      };
      return { ...prev, heroSlides: updatedSlides };
    });
  };

  const handleMoveToFirst = (index) => {
    if (index === 0) return;
    setSiteForm((prev) => {
      const updatedSlides = [...prev.heroSlides];
      const [targetSlide] = updatedSlides.splice(index, 1);
      updatedSlides.unshift(targetSlide);
      return { ...prev, heroSlides: updatedSlides };
    });
  };

  const handleMoveSlide = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siteForm.heroSlides.length) return;

    setSiteForm((prev) => {
      const updatedSlides = [...prev.heroSlides];
      const temp = updatedSlides[index];
      updatedSlides[index] = updatedSlides[targetIndex];
      updatedSlides[targetIndex] = temp;
      return { ...prev, heroSlides: updatedSlides };
    });
  };

  const handleAddTestimonial = () => {
    setSiteForm((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        {
          stars: 5,
          text: '"Enter customer review or quote here..."',
          author: '— Customer Name, Role, City',
          isActive: true
        }
      ]
    }));
  };

  const handleRemoveTestimonial = (index) => {
    setSiteForm((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const handleTestimonialChange = (index, field, value) => {
    setSiteForm((prev) => {
      const updated = [...prev.testimonials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testimonials: updated };
    });
  };

  const handleToggleTestimonialActive = (index) => {
    setSiteForm((prev) => {
      const updated = [...prev.testimonials];
      const currentActive = updated[index].isActive !== false;
      updated[index] = { ...updated[index], isActive: !currentActive };
      return { ...prev, testimonials: updated };
    });
  };

  const handleMoveTestimonial = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siteForm.testimonials.length) return;

    setSiteForm((prev) => {
      const updated = [...prev.testimonials];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, testimonials: updated };
    });
  };

  const handleBannerImageUpload = async (index, e, fieldName = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }

    setUploadingIndex(`${index}-${fieldName}`);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosClient.post('/upload/single', formData);
      const uploadedUrl = response.data?.url || response.data?.imageUrl;
      if (uploadedUrl) {
        const updatedSlides = [...siteForm.heroSlides];
        updatedSlides[index] = {
          ...updatedSlides[index],
          [fieldName]: uploadedUrl,
          hideText: true,
          imageFit: 'cover'
        };

        const updatedForm = {
          ...siteForm,
          heroSlides: updatedSlides,
          ...(index === 0 && fieldName === 'image' ? { homeHeroImage: uploadedUrl } : {})
        };

        setSiteForm(updatedForm);

        // Auto-save immediately to database so storefront updates live instantly
        await axiosClient.put('/settings', updatedForm);
        notifyAdminChange('settings', { action: 'update_banner_image' });
        showSuccessMessage(`${fieldName === 'mobileImage' ? 'Mobile' : 'Desktop'} banner image updated & published live!`);
      }
    } catch (err) {
      console.warn('Server upload fallback triggered:', err);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result;
        const updatedSlides = [...siteForm.heroSlides];
        updatedSlides[index] = {
          ...updatedSlides[index],
          [fieldName]: base64Url,
          hideText: true,
          imageFit: 'cover'
        };
        const updatedForm = {
          ...siteForm,
          heroSlides: updatedSlides,
          ...(index === 0 && fieldName === 'image' ? { homeHeroImage: base64Url } : {})
        };
        setSiteForm(updatedForm);
        try {
          await axiosClient.put('/settings', updatedForm);
          notifyAdminChange('settings', { action: 'update_banner_image' });
          showSuccessMessage(`${fieldName === 'mobileImage' ? 'Mobile' : 'Desktop'} banner image loaded & saved live!`);
        } catch (saveErr) {
          console.error('Auto-save fallback failed:', saveErr);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveSlideImage = async (index, fieldName = 'image') => {
    const updatedSlides = [...siteForm.heroSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [fieldName]: ''
    };
    const updatedForm = {
      ...siteForm,
      heroSlides: updatedSlides,
      ...(index === 0 && fieldName === 'image' ? { homeHeroImage: '' } : {})
    };
    setSiteForm(updatedForm);
    try {
      await axiosClient.put('/settings', updatedForm);
      notifyAdminChange('settings', { action: 'remove_banner_image' });
      showSuccessMessage('Banner image removed & published live!');
    } catch (err) {
      console.error('Failed to auto-save image removal:', err);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="text-left space-y-6">
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans flex items-center gap-2.5">
            <Home className="h-6 w-6 text-[#0071e3]" />
            Hero Banners & Slider Manager
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Add custom banner images, title text, CTA buttons, and control visibility for homepage slides.</p>
        </div>

        <button
          type="button"
          onClick={handleAddSlide}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Hero Slide
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSiteSubmit} className="space-y-8">
          {/* Main IndiaStore Style Homepage Hero Section Form */}
          <div className="bg-zinc-900 text-white rounded-2xl p-6 space-y-4 shadow-md border border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-[#0071e3] uppercase font-extrabold tracking-widest block">MAIN HOMEPAGE HERO BANNER</span>
                <h3 className="text-lg font-bold text-white">IndiaStore Style Dark Hero Section</h3>
              </div>
              <span className="bg-[#0071e3]/20 text-[#0071e3] text-[11px] font-bold px-3 py-1 rounded-full border border-[#0071e3]/40">
                Live Active Hero
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Top Blue Badge Text</label>
                <input
                  type="text"
                  value={siteForm.homeHeroBadge || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroBadge: e.target.value })}
                  placeholder="e.g. Apple Authorised Resellers across India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Main Large Headline (Use Enter/Line Breaks for stacked lines)</label>
                <textarea
                  rows={2}
                  value={siteForm.homeHeroTitle || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroTitle: e.target.value })}
                  placeholder="The latest.&#10;The best. Authorised."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-base font-extrabold tracking-tight font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={siteForm.homeHeroSubtitle || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroSubtitle: e.target.value })}
                  placeholder="Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Primary Button Label</label>
                <input
                  type="text"
                  value={siteForm.homeHeroPrimaryBtnText || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroPrimaryBtnText: e.target.value })}
                  placeholder="e.g. Shop Now"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={siteForm.homeHeroPrimaryBtnLink || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroPrimaryBtnLink: e.target.value })}
                  placeholder="e.g. /iphone or /shop"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Secondary Button Label</label>
                <input
                  type="text"
                  value={siteForm.homeHeroSecondaryBtnText || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroSecondaryBtnText: e.target.value })}
                  placeholder="e.g. Find Nearest Store"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Secondary Button Link</label>
                <input
                  type="text"
                  value={siteForm.homeHeroSecondaryBtnLink || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, homeHeroSecondaryBtnLink: e.target.value })}
                  placeholder="e.g. #store-locator or /stores"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Hero Image (Optional Upload or Custom Image URL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={siteForm.homeHeroImage || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedSlides = [...siteForm.heroSlides];
                      if (updatedSlides.length > 0) {
                        updatedSlides[0] = { ...updatedSlides[0], image: val, hideText: true, imageFit: 'cover' };
                      }
                      setSiteForm({ ...siteForm, homeHeroImage: val, heroSlides: updatedSlides });
                    }}
                    onBlur={async () => {
                      try {
                        await axiosClient.put('/settings', siteForm);
                        notifyAdminChange('settings', { action: 'update_banner_image' });
                        showSuccessMessage('Main banner image URL saved live!');
                      } catch (err) {
                        console.error('Auto-save on blur failed:', err);
                      }
                    }}
                    placeholder="e.g. /iphone_category_uploaded.jpg or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:border-[#0071e3] outline-none text-xs font-mono"
                  />
                  <label className="bg-[#0071e3] hover:bg-[#005bb5] text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const res = await axiosClient.post('/upload/single', formData);
                          const uploadedUrl = res.data?.url || res.data?.imageUrl;
                          if (uploadedUrl) {
                            const updatedSlides = [...siteForm.heroSlides];
                            if (updatedSlides.length > 0) {
                              updatedSlides[0] = { ...updatedSlides[0], image: uploadedUrl, hideText: true, imageFit: 'cover' };
                            }
                            const updatedForm = {
                              ...siteForm,
                              homeHeroImage: uploadedUrl,
                              heroSlides: updatedSlides
                            };
                            setSiteForm(updatedForm);
                            await axiosClient.put('/settings', updatedForm);
                            notifyAdminChange('settings', { action: 'update_banner_image' });
                            showSuccessMessage('Homepage hero banner image updated & published live!');
                          }
                        } catch (err) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = reader.result;
                            const updatedSlides = [...siteForm.heroSlides];
                            if (updatedSlides.length > 0) {
                              updatedSlides[0] = { ...updatedSlides[0], image: base64, hideText: true, imageFit: 'cover' };
                            }
                            const updatedForm = {
                              ...siteForm,
                              homeHeroImage: base64,
                              heroSlides: updatedSlides
                            };
                            setSiteForm(updatedForm);
                            try {
                              await axiosClient.put('/settings', updatedForm);
                              notifyAdminChange('settings', { action: 'update_banner_image' });
                              showSuccessMessage('Homepage hero banner image loaded & saved live!');
                            } catch (e) {}
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0071e3] hover:bg-[#005bb5] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save Homepage Hero Settings</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-widest block">PROMOTIONAL ANNOUNCEMENT BANNER</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Bold Highlight Portion</label>
                <input
                  type="text"
                  value={siteForm.announcementBold || ''}
                  onChange={(e) => {
                    const boldVal = e.target.value;
                    setSiteForm(prev => ({
                      ...prev,
                      announcementBold: boldVal,
                      announcement: `${boldVal} ${prev.announcementNormal || ''}`.trim()
                    }));
                  }}
                  placeholder="e.g. 🔥 FREE SHIPPING"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-bold text-zinc-900 bg-zinc-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Normal Text Portion</label>
                <input
                  type="text"
                  value={siteForm.announcementNormal || ''}
                  onChange={(e) => {
                    const normVal = e.target.value;
                    setSiteForm(prev => ({
                      ...prev,
                      announcementNormal: normVal,
                      announcement: `${prev.announcementBold || ''} ${normVal}`.trim()
                    }));
                  }}
                  placeholder="e.g. ON ORDERS ABOVE INR 1,499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-normal text-zinc-800 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Combined Announcement Notice</label>
              <input
                type="text"
                value={siteForm.announcement}
                onChange={(e) => setSiteForm({...siteForm, announcement: e.target.value})}
                placeholder="e.g. 🔥 FREE SHIPPING ON ORDERS ABOVE INR 1,499"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none text-zinc-600"
              />
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Deal of the Week Banner Settings */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-amber-600 uppercase font-extrabold tracking-widest block">DEAL OF THE WEEK BANNER</span>
              <h3 className="text-base font-bold text-zinc-900 mt-0.5">Customize Homepage Featured Deal</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Eyebrow Tag</label>
                <input
                  type="text"
                  value={siteForm.dealEyebrow || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealEyebrow: e.target.value })}
                  placeholder="e.g. Deal of the Week"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-semibold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Deal Title</label>
                <input
                  type="text"
                  value={siteForm.dealTitle || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealTitle: e.target.value })}
                  placeholder="e.g. MacBook Neo – Stock Clearance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-semibold text-zinc-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Deal Description</label>
                <textarea
                  rows={2}
                  value={siteForm.dealDesc || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealDesc: e.target.value })}
                  placeholder="Deal details, offers, warranty..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Deal Special Price</label>
                <input
                  type="text"
                  value={siteForm.dealPrice || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealPrice: e.target.value })}
                  placeholder="e.g. ₹72,900"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Original Price (Crossed)</label>
                <input
                  type="text"
                  value={siteForm.dealOldPrice || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealOldPrice: e.target.value })}
                  placeholder="e.g. ₹79,900"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm font-normal text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Button Text</label>
                <input
                  type="text"
                  value={siteForm.dealButtonText || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealButtonText: e.target.value })}
                  placeholder="e.g. Grab the Deal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Button Target Link</label>
                <input
                  type="text"
                  value={siteForm.dealButtonLink || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, dealButtonLink: e.target.value })}
                  placeholder="e.g. /macbook"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs text-zinc-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Deal Image URL or Upload</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={siteForm.dealImage || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, dealImage: e.target.value })}
                    placeholder="e.g. /mac_nav/macbook_neo.png or image URL"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs text-zinc-800"
                  />
                  <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await axiosClient.post('/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            if (res.data.imageUrl) {
                              setSiteForm(prev => ({ ...prev, dealImage: res.data.imageUrl }));
                            }
                          } catch (err) {
                            alert('Image upload failed');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-zinc-100" />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-widest block">HOMEPAGE HERO SLIDES ({siteForm.heroSlides.length})</span>
                <h3 className="text-base font-bold text-zinc-900 mt-0.5">Manage All Active & Hidden Slides</h3>
              </div>
              
              {/* Device Preview Mode Selector */}
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'desktop'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop (1920×520)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'mobile'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile (390px)
                </button>
              </div>
            </div>

            {/* REAL-TIME INTERACTIVE BANNER PREVIEW */}
            {siteForm.heroSlides.length > 0 && (() => {
              const safeIndex = Math.min(selectedPreviewIndex, siteForm.heroSlides.length - 1);
              const previewSlide = siteForm.heroSlides[safeIndex] || siteForm.heroSlides[0];
              const fitCls = previewSlide.imageFit === 'cover' ? 'object-cover' : 'object-contain';
              const focalCls = previewSlide.focalPosition === 'center'
                ? 'object-center'
                : previewSlide.focalPosition === 'left'
                ? 'object-left'
                : 'object-right';
              const imgUrl = previewMode === 'mobile' && previewSlide.mobileImage 
                ? previewSlide.mobileImage 
                : previewSlide.image;

              return (
                <div className="bg-zinc-900 rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-xl border border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">Live Simulator Preview</span>
                      <span className="text-[11px] text-zinc-400">
                        (Viewing Slide #{safeIndex + 1}: {previewSlide.titleBold || previewSlide.title || 'Untitled'})
                      </span>
                    </div>

                    {/* Slide Selector Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {siteForm.heroSlides.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPreviewIndex(idx)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            safeIndex === idx
                              ? 'bg-[#0071e3] text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          Slide {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulator Canvas Frame */}
                  <div className="flex justify-center bg-zinc-950/70 p-3 sm:p-5 rounded-2xl border border-zinc-800/80 overflow-hidden">
                    {previewMode === 'desktop' ? (
                      /* DESKTOP 1920×520 CANVAS */
                      <div className="w-full max-w-5xl aspect-[1920/520] min-h-[220px] max-h-[360px] rounded-2xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-zinc-900 relative overflow-hidden shadow-md flex items-center border border-zinc-200/80">
                        {previewSlide.hideText !== false ? (
                          /* Image-only desktop banner */
                          <div className="w-full h-full relative flex items-center justify-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt="Banner"
                                className={`w-full h-full ${fitCls} ${focalCls}`}
                              />
                            ) : (
                              <div className="text-center p-6 text-zinc-400">
                                <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-xs font-bold">No image uploaded for this slide</p>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-zinc-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                              Image Only Mode (Text overlay hidden)
                            </div>
                          </div>
                        ) : (
                          /* Split desktop banner: Text Left, Product Right */
                          <div className="w-full h-full grid grid-cols-12 items-center px-6 sm:px-10 lg:px-12 py-4 relative z-10">
                            <div className="col-span-7 sm:col-span-6 space-y-2 text-left z-20">
                              {previewSlide.badge && (
                                <span className="inline-block text-[10px] sm:text-xs font-bold tracking-wider text-[#0071e3] uppercase">
                                  {previewSlide.badge}
                                </span>
                              )}
                              <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-zinc-900 tracking-tight leading-tight line-clamp-2">
                                <span className="font-extrabold">{previewSlide.titleBold || previewSlide.title || 'Apple for Business'}</span>{' '}
                                <span className="font-medium text-zinc-600">{previewSlide.titleNormal || ''}</span>
                              </h2>
                              <p className="text-[11px] sm:text-xs text-zinc-600 line-clamp-2 max-w-md">
                                {previewSlide.subtitle || 'Discover premium genuine Apple hardware with official warranty and GST invoicing.'}
                              </p>
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {previewSlide.buttonText && (
                                  <span className="bg-[#0071e3] text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full shadow-xs inline-block">
                                    {previewSlide.buttonText}
                                  </span>
                                )}
                                {previewSlide.secondaryButtonText && (
                                  <span className="bg-white/90 text-zinc-800 border border-zinc-300 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full inline-block">
                                    {previewSlide.secondaryButtonText}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-span-5 sm:col-span-6 h-full flex items-center justify-end relative">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt="Product"
                                  className={`w-full h-full max-h-[220px] sm:max-h-[300px] ${fitCls} ${focalCls} drop-shadow-xl`}
                                />
                              ) : (
                                <div className="w-48 h-32 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400 text-xs font-semibold">
                                  Product Image Area
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-2.5 right-3 bg-zinc-900/60 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                          1920 × 520 Ratio
                        </div>
                      </div>
                    ) : (
                      /* MOBILE 390px PHONE CANVAS */
                      <div className="w-[340px] sm:w-[380px] min-h-[460px] rounded-[32px] border-4 border-zinc-700 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-zinc-900 relative overflow-hidden shadow-2xl flex flex-col justify-between p-5">
                        <div className="w-20 h-4 bg-zinc-800 rounded-full mx-auto mb-2"></div>
                        
                        {previewSlide.hideText !== false ? (
                          <div className="flex-1 flex items-center justify-center relative">
                            {(previewSlide.mobileImage || imgUrl) ? (
                              <img
                                src={previewSlide.mobileImage || imgUrl}
                                alt="Banner"
                                className="w-full h-full max-h-[380px] object-contain drop-shadow-lg"
                              />
                            ) : (
                              <p className="text-zinc-400 text-xs">No image uploaded</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 text-center pt-2">
                              {previewSlide.badge && (
                                <span className="inline-block text-[10px] font-bold tracking-wider text-[#0071e3] uppercase">
                                  {previewSlide.badge}
                                </span>
                              )}
                              <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">
                                {previewSlide.titleBold || previewSlide.title || 'Apple for Business'}
                              </h2>
                              <p className="text-xs text-zinc-600 line-clamp-2">
                                {previewSlide.subtitle || 'Discover premium genuine Apple hardware.'}
                              </p>
                              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                                {previewSlide.buttonText && (
                                  <span className="bg-[#0071e3] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs inline-block">
                                    {previewSlide.buttonText}
                                  </span>
                                )}
                                {previewSlide.secondaryButtonText && (
                                  <span className="bg-white text-zinc-800 border border-zinc-300 text-[11px] font-bold px-3 py-1.5 rounded-full inline-block">
                                    {previewSlide.secondaryButtonText}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center py-4">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt="Product"
                                  className="w-full max-h-[200px] object-contain drop-shadow-md"
                                />
                              ) : (
                                <div className="w-36 h-28 border border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400 text-[11px]">
                                  Mobile Product
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        <div className="w-24 h-1 bg-zinc-300 rounded-full mx-auto"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              {siteForm.heroSlides.map((slide, index) => (
                <div 
                  key={index}
                  className={`p-5 sm:p-6 border rounded-2xl space-y-5 relative transition-all ${
                    slide.isActive !== false 
                      ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-2xs' 
                      : 'bg-zinc-100/70 border-zinc-250 opacity-75'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 pb-3 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-zinc-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        Slide #{index + 1} {index === 0 && ' (Shown 1st)'}
                      </span>
                      
                      {slide.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          <Eye className="h-3 w-3 text-emerald-600" /> Visible Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 bg-zinc-200 border border-zinc-300 px-2 py-0.5 rounded-md">
                          <EyeOff className="h-3 w-3 text-zinc-500" /> Hidden
                        </span>
                      )}

                      {slide.image && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          <ImageIcon className="h-3 w-3" /> Image Banner
                        </span>
                      )}

                      {slide.hideText && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-md">
                          Text Hidden
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewIndex(index)}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        title="Preview this slide in simulator above"
                      >
                        <Eye className="h-3 w-3" /> Preview
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await axiosClient.put('/settings', siteForm);
                            notifyAdminChange('settings', { action: 'update_banners' });
                            showSuccessMessage(`Slide #${index + 1} published live successfully!`);
                          } catch (err) {
                            alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#0071e3] hover:bg-[#005bb5] px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs border-0"
                        title="Save & publish this slide live right now"
                      >
                        <Check className="h-3 w-3" /> Save Slide
                      </button>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveToFirst(index)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-all cursor-pointer"
                          title="Show as 1st slide on homepage"
                        >
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          Show 1st
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          const newHide = slide.hideText === false ? true : false;
                          handleSlideChange(index, 'hideText', newHide);
                          const updatedSlides = [...siteForm.heroSlides];
                          updatedSlides[index] = { ...updatedSlides[index], hideText: newHide };
                          const updatedForm = { ...siteForm, heroSlides: updatedSlides };
                          try {
                            await axiosClient.put('/settings', updatedForm);
                            notifyAdminChange('settings', { action: 'update_banners' });
                            showSuccessMessage(newHide ? 'Text hidden — Image-only mode active!' : 'Text overlay enabled.');
                          } catch (err) {}
                        }}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          slide.hideText !== false 
                            ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-300' 
                            : 'text-zinc-700 bg-white hover:bg-zinc-100 border-zinc-250'
                        }`}
                        title="Toggle Text Overlay on Live Banner"
                      >
                        {slide.hideText !== false ? 'Text Hidden (Image Banner)' : 'Hide Text'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(index)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          slide.isActive !== false 
                            ? 'text-zinc-700 bg-white hover:bg-zinc-100 border-zinc-250' 
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                        }`}
                      >
                        {slide.isActive !== false ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                            Hide Slide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            Unhide Slide
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSlide(index, 'up')}
                        className="p-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 cursor-pointer text-zinc-600"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === siteForm.heroSlides.length - 1}
                        onClick={() => handleMoveSlide(index, 'down')}
                        className="p-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 cursor-pointer text-zinc-600"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(index)}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-2 py-1 rounded-lg transition-all cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hide Text on Banner Toggle Switch */}
                    <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
                      <div>
                        <label className="text-xs font-bold text-zinc-900 block cursor-pointer">
                          Hide Text Overlay on Banner (Image-Only Banner Mode)
                        </label>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Turn this ON if your uploaded graphic already contains typography and you want a pure visual billboard.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={slide.hideText !== false}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          handleSlideChange(index, 'hideText', val);
                          const updatedSlides = [...siteForm.heroSlides];
                          updatedSlides[index] = { ...updatedSlides[index], hideText: val };
                          const updatedForm = { ...siteForm, heroSlides: updatedSlides };
                          try {
                            await axiosClient.put('/settings', updatedForm);
                            notifyAdminChange('settings', { action: 'update_banners' });
                          } catch (err) {}
                        }}
                        className="w-5 h-5 text-[#0071e3] rounded cursor-pointer accent-[#0071e3]"
                      />
                    </div>

                    {/* Eyebrow Badge Text */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        Eyebrow / Badge Text (Small Blue Header)
                      </label>
                      <input
                        type="text"
                        value={slide.badge || ''}
                        onChange={(e) => handleSlideChange(index, 'badge', e.target.value)}
                        placeholder="e.g. APPLE AUTHORISED RESELLERS ACROSS INDIA"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs font-semibold focus:border-[#0071e3] outline-none text-[#0071e3]"
                      />
                    </div>

                    {/* Separate Bold Title vs Normal Title Fields */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Heading Bold Portion</label>
                      <input
                        type="text"
                        value={slide.titleBold || ''}
                        onChange={(e) => {
                          const boldVal = e.target.value;
                          handleSlideChange(index, 'titleBold', boldVal);
                          if (boldVal || slide.titleNormal) {
                            handleSlideChange(index, 'title', `${boldVal} ${slide.titleNormal || ''}`.trim());
                          }
                        }}
                        placeholder="e.g. The latest Apple lineup,"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs font-bold focus:border-[#0071e3] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Heading Normal Text Portion</label>
                      <input
                        type="text"
                        value={slide.titleNormal || ''}
                        onChange={(e) => {
                          const normVal = e.target.value;
                          handleSlideChange(index, 'titleNormal', normVal);
                          if (slide.titleBold || normVal) {
                            handleSlideChange(index, 'title', `${slide.titleBold || ''} ${normVal}`.trim());
                          }
                        }}
                        placeholder="e.g. in stock and ready to ship today."
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs font-normal focus:border-[#0071e3] outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Full Heading Message</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        placeholder="e.g. The latest Apple lineup, in stock today."
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-zinc-200 text-sm font-semibold focus:border-[#0071e3] outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subtitle / Supporting Text</label>
                      <textarea
                        rows={2}
                        value={slide.subtitle || ''}
                        onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                        placeholder="Brief description of the banner slide..."
                        className="w-full px-3.5 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none resize-none"
                      />
                    </div>

                    {/* CTA BUTTON 1 (Primary) */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">CTA Button 1 Text (Primary Pill)</label>
                      <input
                        type="text"
                        value={slide.buttonText || ''}
                        onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)}
                        placeholder="e.g. Browse Catalogue →"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs font-semibold focus:border-[#0071e3] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">CTA Button 1 Link (URL / Anchor)</label>
                      <input
                        type="text"
                        value={slide.buttonLink || ''}
                        onChange={(e) => handleSlideChange(index, 'buttonLink', e.target.value)}
                        placeholder="e.g. /shop or #categories"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none font-mono"
                      />
                    </div>

                    {/* CTA BUTTON 2 (Secondary) */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">CTA Button 2 Text (Secondary)</label>
                      <input
                        type="text"
                        value={slide.secondaryButtonText || ''}
                        onChange={(e) => handleSlideChange(index, 'secondaryButtonText', e.target.value)}
                        placeholder="e.g. Find Nearest Store"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs font-semibold focus:border-[#0071e3] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">CTA Button 2 Link</label>
                      <input
                        type="text"
                        value={slide.secondaryButtonLink || ''}
                        onChange={(e) => handleSlideChange(index, 'secondaryButtonLink', e.target.value)}
                        placeholder="e.g. #store-locator or /stores"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none font-mono"
                      />
                    </div>

                    {/* Image Fit and Focal Position Configuration */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Image Fit (Contain vs Cover)</label>
                      <select
                        value={slide.imageFit || 'contain'}
                        onChange={(e) => handleSlideChange(index, 'imageFit', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                      >
                        <option value="contain">Contain (Recommended for isolated products to prevent any cropping)</option>
                        <option value="cover">Cover (Fills entire right canvas, best for edge-to-edge graphics)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Image Focal Position</label>
                      <select
                        value={slide.focalPosition || 'right'}
                        onChange={(e) => handleSlideChange(index, 'focalPosition', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                      >
                        <option value="right">Right Aligned (Apple default hero layout)</option>
                        <option value="center">Center Aligned</option>
                        <option value="left">Left Aligned</option>
                      </select>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Text Alignment</label>
                      <select
                        value={slide.textAlignment || 'left'}
                        onChange={(e) => handleSlideChange(index, 'textAlignment', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Center Aligned</option>
                      </select>
                    </div>

                    {/* Background Theme Style */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Background Theme Style</label>
                      <select
                        value={slide.bgStyle || 'slide-dark'}
                        onChange={(e) => handleSlideChange(index, 'bgStyle', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                      >
                        <option value="slide-dark">Dark Minimalist Gradient</option>
                        <option value="slide-light">Light Apple Clean</option>
                        <option value="slide-dark-blue">Dark Sapphire Blue</option>
                        <option value="slide-warm">Warm Charcoal / Amber</option>
                      </select>
                    </div>

                    {/* Desktop Product / Banner Image */}
                    <div className="md:col-span-2 space-y-1 bg-white p-3.5 rounded-xl border border-zinc-200">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider">
                          Desktop Product / Banner Image (Target: 1920 × 520 px, Max 10MB)
                        </label>
                        {slide.image && (
                          <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slide.image || ''}
                          onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                          onBlur={async () => {
                            try {
                              const updatedSlides = [...siteForm.heroSlides];
                              updatedSlides[index] = {
                                ...updatedSlides[index],
                                hideText: true,
                                imageFit: 'cover'
                              };
                              const updatedForm = {
                                ...siteForm,
                                heroSlides: updatedSlides,
                                ...(index === 0 ? { homeHeroImage: slide.image } : {})
                              };
                              setSiteForm(updatedForm);
                              await axiosClient.put('/settings', updatedForm);
                              notifyAdminChange('settings', { action: 'update_banner_image' });
                              showSuccessMessage(`Slide #${index + 1} image URL saved live!`);
                            } catch (err) {
                              console.error('Auto-save on blur failed:', err);
                            }
                          }}
                          placeholder="Image URL or upload file..."
                          className="flex-1 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                        />
                        <label className="flex items-center gap-1 bg-[#0071e3] hover:bg-[#005bb5] text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                          {uploadingIndex === `${index}-image` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBannerImageUpload(index, e, 'image')}
                          />
                        </label>
                        {slide.image && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlideImage(index, 'image')}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Remove Image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Banner Image (Optional) */}
                    <div className="md:col-span-2 space-y-1 bg-white p-3.5 rounded-xl border border-zinc-200">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider">
                            Mobile Banner Image (Optional, for 390px phone screens)
                          </label>
                          <p className="text-[10px] text-zinc-400">
                            Leave empty to automatically use desktop image with responsive mobile scaling.
                          </p>
                        </div>
                        {slide.mobileImage && (
                          <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slide.mobileImage || ''}
                          onChange={(e) => handleSlideChange(index, 'mobileImage', e.target.value)}
                          onBlur={async () => {
                            try {
                              await axiosClient.put('/settings', siteForm);
                              notifyAdminChange('settings', { action: 'update_banner_image' });
                              showSuccessMessage(`Slide #${index + 1} mobile image URL saved live!`);
                            } catch (err) {
                              console.error('Auto-save on blur failed:', err);
                            }
                          }}
                          placeholder="Mobile image URL or upload..."
                          className="flex-1 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                        />
                        <label className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                          {uploadingIndex === `${index}-mobileImage` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Upload Mobile
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBannerImageUpload(index, e, 'mobileImage')}
                          />
                        </label>
                        {slide.mobileImage && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlideImage(index, 'mobileImage')}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Remove Mobile Image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              className="w-full py-4 border-2 border-dashed border-zinc-250 hover:border-[#0071e3] bg-zinc-50/80 hover:bg-blue-50/50 text-zinc-700 hover:text-[#0071e3] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="h-4.5 w-4.5" />
              + Add Another Hero Slide
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] disabled:bg-zinc-400 text-white px-7 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer border-0"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Live Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
