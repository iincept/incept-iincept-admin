import React, { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';
import { 
  LayoutGrid, 
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
  FolderPlus
} from 'lucide-react';

export default function FooterManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/settings');
      if (response.data && response.data.footerSections && response.data.footerSections.length > 0) {
        setSections(response.data.footerSections);
      } else {
        // Fallback default sections
        setSections([
          {
            title: 'SHOP',
            isActive: true,
            links: [
              { label: 'iPhone', url: '/iphone', isActive: true },
              { label: 'Mac', url: '/macbook', isActive: true },
              { label: 'iPad', url: '/ipad', isActive: true },
              { label: 'Watch', url: '/watch', isActive: true },
              { label: 'AirPods', url: '/airpods', isActive: true },
              { label: 'AppleCare+', url: '/applecare', isActive: true },
            ]
          },
          {
            title: 'BUSINESS',
            isActive: true,
            links: [
              { label: 'Request a Quote', url: '/bulk-orders', isActive: true },
              { label: 'Bulk Pricing', url: '/bulk-orders', isActive: true },
              { label: 'Dealer Login', url: '/login', isActive: true },
              { label: 'GST Invoicing', url: '/bulk-orders', isActive: true },
            ]
          },
          {
            title: 'COMPANY',
            isActive: true,
            links: [
              { label: 'About iincept', url: '/about', isActive: true },
              { label: 'Contact Us', url: '/contact', isActive: true },
              { label: 'FAQ', url: '/faq', isActive: true },
            ]
          },
          {
            title: 'POLICIES',
            isActive: true,
            links: [
              { label: 'Shipping Policy', url: '/shipping-policy', isActive: true },
              { label: 'Returns & Refund Policy', url: '/returns-refund-policy', isActive: true },
              { label: 'Privacy Policy', url: '/privacy-policy', isActive: true },
              { label: 'Terms of Service', url: '/terms-of-service', isActive: true },
            ]
          }
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  // Section level handlers
  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        title: 'NEW SECTION',
        isActive: true,
        links: [
          { label: 'New Link', url: '/accessories', isActive: true }
        ]
      }
    ]);
  };

  const handleRemoveSection = (sectionIndex) => {
    if (sections.length <= 1) {
      alert("At least 1 footer section column is required.");
      return;
    }
    if (window.confirm(`Delete section column "${sections[sectionIndex].title}" and all its links?`)) {
      setSections(prev => prev.filter((_, i) => i !== sectionIndex));
    }
  };

  const handleSectionTitleChange = (sectionIndex, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex] = { ...updated[sectionIndex], title: value };
      return updated;
    });
  };

  const handleToggleSectionActive = (sectionIndex) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex] = { 
        ...updated[sectionIndex], 
        isActive: updated[sectionIndex].isActive === false ? true : false 
      };
      return updated;
    });
  };

  const handleMoveSection = (sectionIndex, direction) => {
    const target = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (target < 0 || target >= sections.length) return;
    setSections(prev => {
      const updated = [...prev];
      const temp = updated[sectionIndex];
      updated[sectionIndex] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  // Link level handlers
  const handleAddLink = (sectionIndex) => {
    setSections(prev => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      section.links = [
        ...(section.links || []),
        { label: 'New Link', url: '/accessories', isActive: true }
      ];
      updated[sectionIndex] = section;
      return updated;
    });
  };

  const handleRemoveLink = (sectionIndex, linkIndex) => {
    setSections(prev => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      if (section.links.length <= 1) {
        alert("Each section must have at least 1 link item.");
        return prev;
      }
      section.links = section.links.filter((_, i) => i !== linkIndex);
      updated[sectionIndex] = section;
      return updated;
    });
  };

  const handleLinkChange = (sectionIndex, linkIndex, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      const links = [...(section.links || [])];
      links[linkIndex] = { ...links[linkIndex], [field]: value };
      section.links = links;
      updated[sectionIndex] = section;
      return updated;
    });
  };

  const handleToggleLinkActive = (sectionIndex, linkIndex) => {
    setSections(prev => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      const links = [...(section.links || [])];
      links[linkIndex] = { 
        ...links[linkIndex], 
        isActive: links[linkIndex].isActive === false ? true : false 
      };
      section.links = links;
      updated[sectionIndex] = section;
      return updated;
    });
  };

  const handleMoveLink = (sectionIndex, linkIndex, direction) => {
    const section = sections[sectionIndex];
    const links = section.links || [];
    const target = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    if (target < 0 || target >= links.length) return;

    setSections(prev => {
      const updated = [...prev];
      const sec = { ...updated[sectionIndex] };
      const updatedLinks = [...sec.links];
      const temp = updatedLinks[linkIndex];
      updatedLinks[linkIndex] = updatedLinks[target];
      updatedLinks[target] = temp;
      sec.links = updatedLinks;
      updated[sectionIndex] = sec;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axiosClient.put('/settings', { footerSections: sections });
      notifyAdminChange('settings', { action: 'update_footer' });
      showSuccessMessage('Footer Sections and links updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save footer settings');
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
            <LayoutGrid className="h-6 w-6 text-[#0071e3]" />
            Footer Menu Manager
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Add, edit, reorder columns and links rendered in the website footer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-0 shrink-0"
        >
          <FolderPlus className="h-4 w-4" />
          Add Column Section
        </button>
      </header>

      {/* Main Form */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#0071e3]" />
          <span>Loading footer settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Sections List */}
          <div className="space-y-6">
            {sections.map((section, sIdx) => (
              <div 
                key={sIdx} 
                className={`bg-white rounded-3xl border transition-all p-6 shadow-sm ${
                  section.isActive !== false 
                    ? 'border-zinc-200' 
                    : 'border-zinc-200 opacity-60 bg-zinc-50/50'
                }`}
              >
                {/* Section Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-150">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-extrabold text-zinc-400 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl shrink-0">
                      Column #{sIdx + 1}
                    </span>

                    <div className="flex-1 max-w-sm">
                      <label className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        Section Column Title
                      </label>
                      <input
                        type="text"
                        value={section.title || ''}
                        onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                        placeholder="e.g. SHOP, POLICIES..."
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm font-bold uppercase tracking-wider focus:border-[#0071e3] outline-none bg-white text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionActive(sIdx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                        section.isActive !== false 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                      }`}
                    >
                      {section.isActive !== false ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-500" />}
                      {section.isActive !== false ? 'Active Column' : 'Hidden Column'}
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleMoveSection(sIdx, 'up')}
                      className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Section Left/Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={sIdx === sections.length - 1}
                      onClick={() => handleMoveSection(sIdx, 'down')}
                      className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Section Right/Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer ml-1"
                      title="Delete Column Section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Section Links */}
                <div className="pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Links inside "{section.title || 'Untitled Column'}"
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleAddLink(sIdx)}
                      className="text-xs font-bold text-[#0071e3] hover:text-[#005bb5] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(section.links || []).map((linkItem, lIdx) => (
                      <div 
                        key={lIdx} 
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          linkItem.isActive !== false 
                            ? 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300' 
                            : 'bg-zinc-100/50 border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                          <div>
                            <label className="block text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                              Link Label
                            </label>
                            <input
                              type="text"
                              value={linkItem.label || ''}
                              onChange={(e) => handleLinkChange(sIdx, lIdx, 'label', e.target.value)}
                              placeholder="e.g. Privacy Policy"
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium focus:border-[#0071e3] outline-none bg-white text-zinc-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                              Target Path / URL
                            </label>
                            <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 focus-within:border-[#0071e3]">
                              <LinkIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                              <input
                                type="text"
                                value={linkItem.url || ''}
                                onChange={(e) => handleLinkChange(sIdx, lIdx, 'url', e.target.value)}
                                placeholder="e.g. /privacy-policy"
                                className="w-full text-xs font-mono outline-none bg-transparent text-zinc-800"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Link Controls */}
                        <div className="flex items-center gap-1.5 justify-end shrink-0 pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleToggleLinkActive(sIdx, lIdx)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                              linkItem.isActive !== false 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                            }`}
                          >
                            {linkItem.isActive !== false ? 'Active' : 'Hidden'}
                          </button>

                          <button
                            type="button"
                            disabled={lIdx === 0}
                            onClick={() => handleMoveLink(sIdx, lIdx, 'up')}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                            title="Move Link Up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            disabled={lIdx === (section.links || []).length - 1}
                            onClick={() => handleMoveLink(sIdx, lIdx, 'down')}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer shadow-2xs"
                            title="Move Link Down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveLink(sIdx, lIdx)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer ml-1"
                            title="Delete Link"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddLink(sIdx)}
                    className="w-full py-2 border border-dashed border-zinc-300 hover:border-[#0071e3] text-zinc-600 hover:text-[#0071e3] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-50/50 hover:bg-blue-50/30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Another Link to "{section.title || 'Section'}"
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs">
            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <FolderPlus className="h-4 w-4 text-zinc-600" />
              Add Another Column Section
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] disabled:bg-zinc-400 text-white px-7 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer border-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Footer Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
