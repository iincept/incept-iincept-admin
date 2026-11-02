import { useState, useEffect } from 'react';
import { 
  Tag, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  FolderPlus 
} from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryApi';
import axiosClient from '../../services/axiosClient';
import { notifyAdminChange } from '../../services/liveSyncService';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Category form data
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });

  // Uploading status
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const catData = await getCategories();
      setCategories(catData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCatImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await axiosClient.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setCategoryForm(prev => ({
        ...prev,
        image: response.data.url
      }));
      showSuccessMessage('Category icon uploaded!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Category image upload failed');
    } finally {
      setUploadingCatImage(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.image) {
      setError('Category image is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCategory(categoryForm);
      notifyAdminChange('categories', { action: 'create' });
      showSuccessMessage('Category created successfully!');
      resetCategoryForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Category creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? (This might fail if there are dependent products)')) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      notifyAdminChange('categories', { action: 'delete', id });
      showSuccessMessage('Category deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: ''
    });
    setShowCategoryForm(false);
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-zinc-800" />
            Product Catalog Categories
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Create and manage store product categories used for catalog filtering and product assignments.</p>
        </div>

        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#005bb5] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-0"
        >
          {showCategoryForm ? <X className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
          {showCategoryForm ? 'Cancel' : 'Create Product Category'}
        </button>
      </header>

      {/* Form to Add New Category */}
      {showCategoryForm && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 max-w-xl">
          <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">Add New Product Category</h3>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Category Name</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="e.g. iPhone 17 Pro, MacBook Air, Audio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold focus:border-[#0071e3] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Category description..."
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Category Image / Icon</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                  placeholder="Image URL or upload..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:border-[#0071e3] outline-none"
                />
                <label className="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                  {uploadingCatImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleCategoryImageUpload} />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0071e3] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                {loading ? 'Creating...' : 'Save Product Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#0071e3]" />
          <span>Loading product categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-xl object-cover bg-zinc-100 shrink-0" />
                <div className="truncate">
                  <h4 className="font-bold text-xs text-zinc-900 truncate">{cat.name}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{cat.slug}</p>
                </div>
              </div>
              <button
                onClick={() => handleCategoryDelete(cat._id)}
                className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
