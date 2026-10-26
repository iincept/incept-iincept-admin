import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  GripVertical,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Star,
  Eye,
  Smartphone,
  Monitor,
  Search,
  History,
  FileSpreadsheet,
  Download,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Plug,
  Tv,
  FileText
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, exportProductsExcel, previewImportProductsExcel, importProductsExcel } from '../../services/productApi';
import { getCategories } from '../../services/categoryApi';
import axiosClient from '../../services/axiosClient';
import VariantTagInput from '../../components/VariantTagInput';
import { notifyAdminChange } from '../../services/liveSyncService';
import { resolveColorHex, resolveColorValue, isValidHex, normalizeHex } from '../../utils/colorResolver';

const WATCH_BAND_SIZES = [
  '40mm',
  '41mm',
  '42mm',
  '46mm',
  '49mm'
];

const WATCH_STRAP_SIZES = [
  'S/M',
  'M/L',
  'Small',
  'Medium',
  'Large',
  'Loop'
];

const checkIsWatchBand = (product, catSlug = '') => {
  if (!product) return false;
  const isWatch = catSlug.includes('watch') || catSlug.includes('wearable');
  if (isWatch) return true;
  const isAcc = catSlug.includes('accessori');
  if (!isAcc) return false;
  if (product.isWatchBand === true) return true;
  if (Array.isArray(product.bandSizes) && product.bandSizes.length > 0) return true;
  if (Array.isArray(product.strapSizes) && product.strapSizes.length > 0) return true;
  const title = (product.title || '').trim();
  if (!title) return false;
  if (/head|cushion/i.test(title)) return false;
  return /\b(watch\s*band|sport\s*band|ocean\s*band|milanese|sport\s*loop|solo\s*loop|alpine\s*loop|trail\s*loop|braided\s*solo|link\s*bracelet|modern\s*buckle|watch\s*strap)\b/i.test(title) ||
    /(\bband\b|\bloop\b)/i.test(title);
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock logs modal states
  const [showStockLogsModal, setShowStockLogsModal] = useState(false);
  const [stockLogs, setStockLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Category Excel Manager states
  const [showExcelManagerModal, setShowExcelManagerModal] = useState(false);
  const [exportingCategory, setExportingCategory] = useState(null);
  
  const [showExcelPreviewModal, setShowExcelPreviewModal] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [selectedCategoryForImport, setSelectedCategoryForImport] = useState(null);
  const [loadingExcelPreview, setLoadingExcelPreview] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState(null);
  const [importingExcel, setImportingExcel] = useState(false);

  const CATEGORY_EXCEL_ITEMS = [
    { key: 'mac', name: 'Mac', subtitle: 'MacBook Air, Pro, iMac, Mac Studio, Mac mini', icon: Laptop, color: 'bg-blue-600', textColor: 'text-blue-600', bgSoft: 'bg-blue-50 border-blue-200' },
    { key: 'ipad', name: 'iPad', subtitle: 'iPad Pro, Air, mini, Standard iPad', icon: Tablet, color: 'bg-purple-600', textColor: 'text-purple-600', bgSoft: 'bg-purple-50 border-purple-200' },
    { key: 'iphone', name: 'iPhone', subtitle: 'iPhone 16 Pro, 16, 15, 14, SE series', icon: Smartphone, color: 'bg-slate-800', textColor: 'text-slate-800', bgSoft: 'bg-slate-100 border-slate-300' },
    { key: 'watch', name: 'Watch', subtitle: 'Apple Watch Series 12, 10, Ultra, SE', icon: Watch, color: 'bg-rose-600', textColor: 'text-rose-600', bgSoft: 'bg-rose-50 border-rose-200' },
    { key: 'airpods', name: 'AirPods', subtitle: 'AirPods Pro 2, Max, AirPods 4, HomePod', icon: Headphones, color: 'bg-sky-600', textColor: 'text-sky-600', bgSoft: 'bg-sky-50 border-sky-200' },
    { key: 'accessories', name: 'Accessories', subtitle: 'Cases, Chargers, MagSafe, Adapters', icon: Plug, color: 'bg-amber-600', textColor: 'text-amber-600', bgSoft: 'bg-amber-50 border-amber-200' },
    { key: 'tv-home', name: 'TV & Home', subtitle: 'Apple TV 4K, Smart Home & Display', icon: Tv, color: 'bg-emerald-600', textColor: 'text-emerald-600', bgSoft: 'bg-emerald-50 border-emerald-200' },
  ];

  const handleDownloadCategoryExcel = async (categoryKey, categoryName) => {
    setExportingCategory(categoryKey);
    try {
      const response = await exportProductsExcel(categoryKey);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${categoryKey}_products.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Excel sheet for ${categoryName} downloaded successfully!`);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to export Excel sheet.');
    } finally {
      setExportingCategory(null);
    }
  };

  const handleFileSelectForCategory = async (e, categoryKey, categoryName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedExcelFile(file);
    setSelectedCategoryForImport({ key: categoryKey, name: categoryName });
    setLoadingExcelPreview(true);
    setShowExcelPreviewModal(true);

    try {
      const preview = await previewImportProductsExcel(file, categoryKey);
      setExcelPreviewData(preview);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to parse Excel file preview.');
      setShowExcelPreviewModal(false);
    } finally {
      setLoadingExcelPreview(false);
      e.target.value = '';
    }
  };

  const handleConfirmExcelImport = async () => {
    if (!selectedExcelFile || !selectedCategoryForImport) return;
    setImportingExcel(true);
    try {
      const result = await importProductsExcel(selectedExcelFile, selectedCategoryForImport.key);
      setSuccess(result.message || `Products uploaded successfully for ${selectedCategoryForImport.name}!`);
      setShowExcelPreviewModal(false);
      setShowExcelManagerModal(false);

      notifyAdminChange();
      await fetchData();

      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to import Excel sheet.');
    } finally {
      setImportingExcel(false);
    }
  };

  const fetchStockLogs = async () => {
    setLoadingLogs(true);
    setShowStockLogsModal(true);
    try {
      const response = await axiosClient.get('/products/admin/stock-history');
      setStockLogs(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };


  const handleToggleStock = async (prod) => {
    const targetStock = prod.stock === 0 ? 10 : 0;
    try {
      await updateProduct(prod._id, { stock: targetStock });
      setSuccess('Product stock status toggled successfully!');
      // Update local state
      setProducts(products.map(p => p._id === prod._id ? { ...p, stock: targetStock } : p));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update stock status.');
    }
  };

  const filteredProducts = products.filter(prod => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    
    const title = (prod.title || prod.name || '').toString().toLowerCase();
    const category = (prod.category?.name || prod.category?.slug || prod.category || '').toString().toLowerCase();
    const brand = (prod.brand || '').toString().toLowerCase();
    const sku = (prod.sku || prod.partNumber || prod.modelNumber || '').toString().toLowerCase();

    if (title.includes(query) || category.includes(query) || brand.includes(query) || sku.includes(query)) {
      return true;
    }

    const normTitle = title.replace(/^i(?=[a-z])/i, '');
    const normQuery = query.replace(/^i(?=[a-z])/i, '');
    if (normTitle.includes(normQuery)) {
      return true;
    }

    if (prod.variants && Array.isArray(prod.variants)) {
      const matchVariant = prod.variants.some(v => {
        const vText = `${v.title || ''} ${v.displayTitle || ''} ${v.sku || ''} ${v.partNumber || ''} ${v.modelNumber || ''} ${v.color || ''} ${v.storage || ''}`.toLowerCase();
        return vText.includes(query) || vText.includes(normQuery);
      });
      if (matchVariant) return true;
    }

    return false;
  });

  // Forms states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop or mobile
  const [selectedPreviewColor, setSelectedPreviewColor] = useState('');
  const [selectedPreviewStorage, setSelectedPreviewStorage] = useState('');
  const [selectedPreviewRam, setSelectedPreviewRam] = useState('');
  const [activePreviewMainImage, setActivePreviewMainImage] = useState('');

  // Product form data
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: 0,
    stock: '',
    brand: 'Apple',
    category: '',
    sizes: [],
    colors: [],
    storage: [],
    ram: [],
    glasses: [],
    processors: [],
    material: [],
    features: [],
    displayImage: '',
    colorImages: {},
    images: [],
    variants: [],
    partNumber: '',
    modelNumber: '',
    seoTitle: '',
    seoDescription: '',
    tags: []
  });

  const [newTagInput, setNewTagInput] = useState('');

  // Uploading status
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
      setCategories(catData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const uploadedUrl = response.data[0]?.url;
      if (uploadedUrl) {
        setProductForm(prev => ({
          ...prev,
          displayImage: uploadedUrl,
          images: prev.images.includes(uploadedUrl) ? prev.images : [uploadedUrl, ...prev.images]
        }));
        showSuccessMessage('Display Image uploaded successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Display Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const uploadedUrls = response.data.map(item => item.url);
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showSuccessMessage('Images uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVariantImageUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingColorIndex(variantIndex);
    setError(null);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const uploadedUrls = response.data.map(item => item.url);

      // Update variant's image list
      setProductForm(prev => {
        const updatedVariants = [...prev.variants];
        const targetVariant = updatedVariants[variantIndex];
        const existingImages = targetVariant.images || [];

        updatedVariants[variantIndex] = {
          ...targetVariant,
          images: [...existingImages, ...uploadedUrls]
        };

        return {
          ...prev,
          variants: updatedVariants
        };
      });
      showSuccessMessage('Variant images uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Variant image upload failed');
    } finally {
      setUploadingColorIndex(null);
    }
  };

  const handleAutoGenerateColorVariants = () => {
    const currentColors = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c);
    if (currentColors.length === 0) {
      setError("Please add at least one color in 'Colors Config Options' first!");
      return;
    }

    const newVariants = [...(productForm.variants || [])];
    let countAdded = 0;

    currentColors.forEach(colorName => {
      const exists = newVariants.find(v => (v.color || '').toString().toLowerCase() === colorName.toLowerCase());
      if (!exists) {
        newVariants.push({
          id: `var-${Date.now()}-${countAdded}-${Math.random().toString(36).slice(2, 7)}`,
          color: colorName,
          colorHex: resolveColorHex(colorName),
          price: productForm.price || '',
          discountPrice: productForm.discountPrice || '',
          discountPercent: 0,
          discount: 0,
          discountInput: '',
          stock: productForm.stock !== undefined && productForm.stock !== '' ? productForm.stock : 10,
          sku: `${productForm.brand ? productForm.brand.slice(0,3).toUpperCase() : 'APP'}-${colorName.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
          partNumber: '',
          modelNumber: '',
          images: []
        });
        countAdded++;
      }
    });

    setProductForm({
      ...productForm,
      variants: newVariants
    });
    showSuccessMessage(`Generated ${countAdded} Color Part Number blocks! Scroll to 'Variants' below to enter MPNs.`);
  };

  const handleAutoGenerateFullMatrixVariants = () => {
    const currentColors = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
    const currentStorages = (productForm.storages || []).filter(Boolean);
    const currentRams = (productForm.rams || []).filter(Boolean);

    if (currentColors.length === 0 && currentStorages.length === 0 && currentRams.length === 0) {
      setError("Please enter Colors, Storage, or RAM options in Config Options first!");
      return;
    }

    const colorList = currentColors.length > 0 ? currentColors : [''];
    const storageList = currentStorages.length > 0 ? currentStorages : [''];
    const ramList = currentRams.length > 0 ? currentRams : [''];

    const newVariants = [...(productForm.variants || [])];
    let countAdded = 0;

    colorList.forEach(cName => {
      storageList.forEach(sName => {
        ramList.forEach(rName => {
          const exists = newVariants.find(v => 
            (v.color || '').toString().toLowerCase() === (cName || '').toLowerCase() &&
            (v.storage || '').toString().toLowerCase() === (sName || '').toLowerCase() &&
            (v.ram || '').toString().toLowerCase() === (rName || '').toLowerCase()
          );

          if (!exists) {
            newVariants.push({
              id: `var-${Date.now()}-${countAdded}-${Math.random().toString(36).slice(2, 7)}`,
              color: cName,
              colorHex: resolveColorHex(cName),
              storage: sName,
              ram: rName,
              price: productForm.price || '',
              discountPrice: productForm.discountPrice || '',
              discountPercent: 0,
              discount: 0,
              discountInput: '',
              stock: productForm.stock !== undefined && productForm.stock !== '' ? productForm.stock : 10,
              sku: `MPN-${cName ? cName.slice(0,2).toUpperCase() : 'XX'}-${sName ? sName.replace(/[^0-9]/g, '') : '0'}-${rName ? rName.replace(/[^0-9]/g, '') : '0'}-${Date.now().toString().slice(-3)}`,
              partNumber: '',
              modelNumber: '',
              images: []
            });
            countAdded++;
          }
        });
      });
    });

    setProductForm({
      ...productForm,
      variants: newVariants
    });
    showSuccessMessage(`Generated ${countAdded} (Color + Storage + RAM) Combination Variant Blocks! Scroll down to enter individual MPNs & Prices.`);
  };

  const handleAutoGenerateWatchVariants = () => {
    const currentColors = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
    const currentSizes = (productForm.sizes || []).filter(Boolean);
    const currentBandSizes = (productForm.bandSizes || []).filter(Boolean);
    const currentStrapSizes = (productForm.strapSizes || []).filter(Boolean);
    const currentConnectivities = (productForm.connectivities || []).filter(Boolean);

    if (currentColors.length === 0 && currentSizes.length === 0 && currentBandSizes.length === 0 && currentStrapSizes.length === 0 && currentConnectivities.length === 0) {
      setError("Please enter Colors, Band Sizes (40mm, 42mm, etc.), or Strap Sizes (S/M, Loop, etc.) first!");
      return;
    }

    const colorList = currentColors.length > 0 ? currentColors : [''];
    const sizeList = currentSizes.length > 0 ? currentSizes : [''];
    const bandList = currentBandSizes.length > 0 ? currentBandSizes : [''];
    const strapList = currentStrapSizes.length > 0 ? currentStrapSizes : [''];
    const connList = currentConnectivities.length > 0 ? currentConnectivities : [''];

    const newVariants = [...(productForm.variants || [])];
    let countAdded = 0;

    colorList.forEach(cName => {
      sizeList.forEach(sName => {
        bandList.forEach(bName => {
          strapList.forEach(strapName => {
            connList.forEach(connName => {
              const exists = newVariants.find(v => 
                (v.color || '').toString().toLowerCase() === (cName || '').toLowerCase() &&
                (v.size || '').toString().toLowerCase() === (sName || '').toLowerCase() &&
                (v.bandSize || '').toString().toLowerCase() === (bName || '').toLowerCase() &&
                (v.strapSize || '').toString().toLowerCase() === (strapName || '').toLowerCase() &&
                (v.connectivity || '').toString().toLowerCase() === (connName || '').toLowerCase()
              );

              if (!exists) {
                newVariants.push({
                  id: `var-${Date.now()}-${countAdded}-${Math.random().toString(36).slice(2, 7)}`,
                  color: cName,
                  colorHex: resolveColorHex(cName),
                  size: sName || bName,
                  bandSize: bName,
                  strapSize: strapName,
                  accessoriesSize: strapName,
                  connectivity: connName,
                  displayTitle: [bName, strapName, connName].filter(Boolean).join(' '),
                  title: [bName, strapName, connName].filter(Boolean).join(' '),
                  price: productForm.price || '',
                  discountPrice: productForm.discountPrice || '',
                  discountPercent: 0,
                  discount: 0,
                  discountInput: '',
                  stock: productForm.stock !== undefined && productForm.stock !== '' ? productForm.stock : 10,
                  partNumber: '',
                  modelNumber: '',
                  sku: `MPN-${cName ? cName.slice(0,2).toUpperCase() : 'XX'}-${bName ? bName.replace(/[^0-9]/g, '') : '0'}-${strapName ? strapName.replace(/[^A-Za-z0-9]/g, '') : '0'}-${Date.now().toString().slice(-3)}`,
                  images: []
                });
                countAdded++;
              }
            });
          });
        });
      });
    });

    setProductForm({
      ...productForm,
      variants: newVariants
    });
    showSuccessMessage(`Generated ${countAdded} Watch / Watch Band Variant Blocks! Scroll down to enter Part Numbers & Prices.`);
  };


  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!productForm.title || !productForm.title.trim()) {
      setError('Product title is required');
      return;
    }
    if (!productForm.category) {
      setError('Please select a category');
      return;
    }

    if (productForm.variants && productForm.variants.length > 0) {
      for (let i = 0; i < productForm.variants.length; i++) {
        const v = productForm.variants[i];
        const vName = v.color || v.title || v.displayTitle || `Variant #${i + 1}`;
        if (v.price !== undefined && v.price !== '') {
          const numPrice = Number(v.price);
          if (isNaN(numPrice) || numPrice < 0) {
            setError(`Please enter a valid price for ${vName}`);
            return;
          }
        }
        if (v.stock !== undefined && v.stock !== '') {
          const numStock = Number(v.stock);
          if (isNaN(numStock) || numStock < 0) {
            setError(`Please enter a valid stock for ${vName}`);
            return;
          }
        }
      }
    }

    const hasBasePrice = productForm.price !== undefined && productForm.price !== '' && Number(productForm.price) >= 0;
    const hasVariantPrices = (productForm.variants || []).some(v => v.price !== undefined && v.price !== '' && Number(v.price) >= 0);
    if (!hasBasePrice && !hasVariantPrices) {
      setError('Please enter a product price or variant price');
      return;
    }

    setLoading(true);
    setError(null);

    // Ensure we have at least one variant if none are specified
    let finalVariants = [...(productForm.variants || [])];
    if (finalVariants.length === 0) {
      const fallbackColor = productForm.colors?.[0]?.name || productForm.colors?.[0] || 'Standard';
      finalVariants = [{
        size: productForm.sizes?.[0] || 'Standard',
        color: fallbackColor,
        colorHex: resolveColorHex(fallbackColor),
        price: Number(productForm.price || 0),
        discountPrice: Number(productForm.discountPrice || 0),
        stock: Number(productForm.stock || 0),
        sku: `PRO-${Date.now().toString().slice(-4)}`,
        images: productForm.images || []
      }];
    }

    finalVariants = finalVariants.map(v => ({
      ...v,
      colorHex: (v.colorHex && isValidHex(v.colorHex)) ? normalizeHex(v.colorHex) : resolveColorHex(v.color || '')
    }));

    const variantColors = [];
    const variantSizes = [];
    const variantAccessoriesSizes = [];
    const variantBandSizes = [];
    const variantStrapSizes = [];
    const variantConnectivities = [];
    const variantGlasses = [];
    const variantStorage = [];
    const variantRam = [];
    const variantProcessors = [];

    finalVariants.forEach(v => {
      if (v.color && !variantColors.find(c => (c.name || c) === v.color)) {
        const hex = v.colorHex || resolveColorHex(v.color);
        variantColors.push({ name: v.color, value: hex, colorHex: hex, images: v.images || [] });
      }
      if (v.size && !variantSizes.includes(v.size)) {
        variantSizes.push(v.size);
      }
      if (v.accessoriesSize && v.accessoriesSize !== 'None' && !variantAccessoriesSizes.includes(v.accessoriesSize)) {
        variantAccessoriesSizes.push(v.accessoriesSize);
      }
      if (v.bandSize && !variantBandSizes.includes(v.bandSize)) {
        variantBandSizes.push(v.bandSize);
      }
      if (v.strapSize && !variantStrapSizes.includes(v.strapSize)) {
        variantStrapSizes.push(v.strapSize);
      }
      if (v.connectivity && !variantConnectivities.includes(v.connectivity)) {
        variantConnectivities.push(v.connectivity);
      }
      if (v.glass && !variantGlasses.includes(v.glass)) {
        variantGlasses.push(v.glass);
      }
      if (v.storage && !variantStorage.includes(v.storage)) {
        variantStorage.push(v.storage);
      }
      if (v.ram && !variantRam.includes(v.ram)) {
        variantRam.push(v.ram);
      }
      if ((v.processor || v.chip) && !variantProcessors.includes(v.processor || v.chip)) {
        variantProcessors.push(v.processor || v.chip);
      }
    });

    // Combine manual tag inputs and variant-extracted configurations
    const finalColors = [...(productForm.colors || [])];
    variantColors.forEach(vc => {
      const vcName = typeof vc === 'object' ? vc.name : vc;
      if (!finalColors.find(c => (c.name || c) === vcName)) {
        finalColors.push(vc);
      }
    });

    const finalSizes = [...(productForm.sizes || [])];
    variantSizes.forEach(vs => {
      if (!finalSizes.includes(vs)) finalSizes.push(vs);
    });

    const finalBandSizes = [...(productForm.bandSizes || [])];
    variantBandSizes.forEach(vb => {
      if (!finalBandSizes.includes(vb)) finalBandSizes.push(vb);
    });

    const finalStrapSizes = [...(productForm.strapSizes || [])];
    variantStrapSizes.forEach(vs => {
      if (!finalStrapSizes.includes(vs)) finalStrapSizes.push(vs);
    });

    const finalConnectivities = [...(productForm.connectivities || [])];
    variantConnectivities.forEach(vc => {
      if (!finalConnectivities.includes(vc)) finalConnectivities.push(vc);
    });

    const finalGlasses = [...(productForm.glasses || [])];
    variantGlasses.forEach(vg => {
      if (!finalGlasses.includes(vg)) finalGlasses.push(vg);
    });

    const finalStorage = [...(productForm.storage || [])];
    variantStorage.forEach(vt => {
      if (!finalStorage.includes(vt)) finalStorage.push(vt);
    });

    const finalRam = [...(productForm.ram || [])];
    variantRam.forEach(vr => {
      if (!finalRam.includes(vr)) finalRam.push(vr);
    });

    const finalProcessors = [...(productForm.processors || [])];
    variantProcessors.forEach(vp => {
      if (!finalProcessors.includes(vp)) finalProcessors.push(vp);
    });

    const inputDisc = Number(productForm.discountPrice || 0);
    const parentPrice = Number(productForm.price || 0);
    let calcPercent = 0;
    if (inputDisc > 0 && inputDisc <= 99) {
      calcPercent = Math.round(inputDisc);
    } else if (inputDisc > 99 && parentPrice > inputDisc) {
      calcPercent = Math.round(((parentPrice - inputDisc) / parentPrice) * 100);
    }

    const finalVariantsWithPrice = finalVariants.map(v => {
      const vPrice = Number(v.price || parentPrice || 0);
      let rawDiscInput = (v.discountInput !== undefined && v.discountInput !== null && v.discountInput !== "") 
        ? v.discountInput 
        : (v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== ""
            ? v.discountPercent
            : (v.discount !== undefined && v.discount !== null && v.discount !== "" ? v.discount : ""));

      // Fall back to top-level parent discount if variant does not have an explicit discount
      if ((rawDiscInput === "" || rawDiscInput === null || rawDiscInput === undefined) && inputDisc > 0) {
        rawDiscInput = inputDisc;
      }

      const vDiscRaw = (rawDiscInput !== "" && rawDiscInput !== undefined && rawDiscInput !== null) ? Number(rawDiscInput) : 0;
      let vDiscPrice = 0;
      let vDiscPercent = 0;

      if (vDiscRaw > 0 && vDiscRaw <= 99) {
        vDiscPercent = Math.round(vDiscRaw);
        vDiscPrice = vPrice > 0 ? Math.round(vPrice - (vPrice * vDiscRaw / 100)) : vDiscRaw;
      } else if (vDiscRaw > 99 && vPrice > vDiscRaw) {
        if (vDiscRaw < (vPrice / 2)) {
          vDiscPrice = vPrice - vDiscRaw;
          vDiscPercent = Math.round((vDiscRaw / vPrice) * 100);
        } else {
          vDiscPrice = vDiscRaw;
          vDiscPercent = Math.round(((vPrice - vDiscRaw) / vPrice) * 100);
        }
      } else {
        vDiscPercent = 0;
        vDiscPrice = 0;
      }

      const vCopy = {
        ...v,
        bandSize: v.bandSize || '',
        strapSize: v.strapSize || v.accessoriesSize || '',
        size: v.size || v.bandSize || '',
        accessoriesSize: v.accessoriesSize || v.strapSize || '',
        price: vPrice,
        discountPrice: vDiscPrice,
        discountPercent: vDiscPercent,
        discount: vDiscPercent || (vDiscRaw > 0 ? vDiscRaw : 0),
        discountInput: vDiscRaw > 0 ? vDiscRaw : "",
        stock: Number(v.stock !== undefined && v.stock !== '' ? v.stock : (productForm.stock || 0))
      };
      if (vCopy._id && !/^[0-9a-fA-F]{24}$/.test(String(vCopy._id))) {
        delete vCopy._id;
      }
      return vCopy;
    });

    const validVariantDiscPrices = finalVariantsWithPrice
      .filter(v => Number(v.discountPrice) > 0 && Number(v.discountPrice) < Number(v.price))
      .map(v => Number(v.discountPrice));
    const validVariantDiscPercents = finalVariantsWithPrice
      .filter(v => Number(v.discountPercent) > 0)
      .map(v => Number(v.discountPercent));

    let finalParentDiscPrice = 0;
    let finalParentDiscPercent = 0;

    if (validVariantDiscPrices.length > 0) {
      finalParentDiscPrice = Math.min(...validVariantDiscPrices);
      finalParentDiscPercent = Math.max(...validVariantDiscPercents);
    } else if (inputDisc > 0) {
      finalParentDiscPercent = calcPercent;
      finalParentDiscPrice = inputDisc <= 99 ? Math.round(parentPrice - (parentPrice * inputDisc / 100)) : inputDisc;
    } else {
      finalParentDiscPrice = 0;
      finalParentDiscPercent = 0;
    }

    const formattedProduct = {
      ...productForm,
      price: Number(productForm.price || finalVariantsWithPrice[0]?.price || 0),
      discountPrice: finalParentDiscPrice,
      discountPercent: finalParentDiscPercent,
      discount: finalParentDiscPercent,
      stock: finalVariantsWithPrice.reduce((acc, v) => acc + Number(v.stock || 0), 0),
      sizes: finalBandSizes.length > 0 ? finalBandSizes : finalSizes,
      accessoriesSizes: finalStrapSizes.length > 0 ? finalStrapSizes : (variantAccessoriesSizes.length > 0 ? variantAccessoriesSizes : (finalBandSizes.length > 0 ? finalBandSizes : [])),
      bandSizes: finalBandSizes,
      strapSizes: finalStrapSizes,
      connectivities: finalConnectivities,
      glasses: finalGlasses,
      colors: finalColors,
      storage: finalStorage,
      ram: finalRam,
      processors: finalProcessors,
      variants: finalVariantsWithPrice,
      displayImage: productForm.displayImage || (finalVariantsWithPrice[0]?.images?.[0]) || '',
      colorImages: productForm.colorImages || {}
    };

    // Auto-populate top-level images from all variant images
    const allImages = [];
    if (productForm.displayImage && !allImages.includes(productForm.displayImage)) {
      allImages.push(productForm.displayImage);
    }
    if (productForm.images && productForm.images.length > 0) {
      productForm.images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }
    finalVariants.forEach(v => {
      if (v.images) {
        v.images.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
        });
      }
    });
    formattedProduct.images = allImages;

    if (formattedProduct.images.length === 0) {
      setError('Please upload at least one product image, display image, or variant image');
      setLoading(false);
      return;
    }

    try {
      if (editProductId) {
        await updateProduct(editProductId, formattedProduct);
        showSuccessMessage('Product updated successfully!');
        notifyAdminChange('products', { action: 'update', id: editProductId });
      } else {
        await createProduct(formattedProduct);
        showSuccessMessage('Product created successfully!');
        notifyAdminChange('products', { action: 'create' });
      }
      resetProductForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Product operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProductEditClick = (prod) => {
    setEditProductId(prod._id);

    const prodVariants = Array.isArray(prod.variants) ? prod.variants : [];

    const mappedVariants = prodVariants.map((v, idx) => {
      let discVal = (v.discountInput !== undefined && v.discountInput !== null && v.discountInput !== '')
        ? v.discountInput
        : (v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== '' 
            ? v.discountPercent 
            : (v.discount !== undefined && v.discount !== null && v.discount !== '' ? v.discount : ''));

      if (discVal === '' || discVal === undefined) {
        if (v.discountPrice !== undefined && v.discountPrice !== null && Number(v.discountPrice) > 0 && v.price && Number(v.price) > Number(v.discountPrice)) {
          const pct = Math.round(((Number(v.price) - Number(v.discountPrice)) / Number(v.price)) * 100);
          discVal = pct;
        }
      }

      const numDisc = (discVal !== '' && discVal !== undefined && discVal !== null) ? Number(discVal) : null;

      // Resolve bandSize (e.g. 40mm, 42mm) and strapSize (e.g. S/M, Loop)
      let resolvedBandSize = v.bandSize || '';
      let resolvedStrapSize = v.strapSize || '';
      if (!resolvedBandSize && /mm$/i.test(v.size || '')) {
        resolvedBandSize = v.size;
      }
      if (!resolvedBandSize && /mm$/i.test(v.accessoriesSize || '')) {
        resolvedBandSize = v.accessoriesSize;
      }
      if (!resolvedStrapSize && v.accessoriesSize && !/mm$/i.test(v.accessoriesSize)) {
        resolvedStrapSize = v.accessoriesSize;
      }
      if (!resolvedStrapSize && v.size && !/mm$/i.test(v.size) && !WATCH_BAND_SIZES.includes(v.size)) {
        resolvedStrapSize = v.size;
      }

      return {
        ...v,
        id: v.id || (v._id ? String(v._id) : `var-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`),
        bandSize: resolvedBandSize,
        strapSize: resolvedStrapSize,
        discount: numDisc !== null ? numDisc : (v.discount ?? 0),
        discountPercent: numDisc !== null ? numDisc : (v.discountPercent ?? 0),
        discountInput: (numDisc !== null && numDisc !== 0) ? numDisc : '',
        discountPrice: (v.discountPrice !== undefined && v.discountPrice !== null) ? v.discountPrice : (v.price || '')
      };
    });

    setProductForm({
      title: prod.title || '',
      description: prod.description || '',
      price: prod.price || '',
      // Show the discount input as empty when no active discount (discountPrice=0)
      // Use discountPercent as the display value when there IS a real discount
      discountPrice: (prod.discountPrice && Number(prod.discountPrice) > 0 && Number(prod.discountPrice) < Number(prod.price))
        ? prod.discountPrice  // actual discounted selling price
        : (prod.discountPercent && Number(prod.discountPercent) > 0 ? prod.discountPercent : ''),
      stock: prod.stock || '',
      brand: prod.brand || 'Apple',
      category: prod.category?._id || prod.category || '',
      sizes: Array.isArray(prod.sizes) ? prod.sizes : (prod.sizes ? [prod.sizes] : []),
      bandSizes: (() => {
        if (Array.isArray(prod.bandSizes) && prod.bandSizes.length > 0) return prod.bandSizes;
        const candidate = Array.isArray(prod.accessoriesSizes) ? prod.accessoriesSizes : (Array.isArray(prod.sizes) ? prod.sizes : []);
        const mmSizes = candidate.filter(s => /mm$/i.test(s) || WATCH_BAND_SIZES.includes(s));
        if (mmSizes.length > 0) return Array.from(new Set(mmSizes));
        const varBand = prodVariants.map(v => v.bandSize).filter(Boolean);
        if (varBand.length > 0) return Array.from(new Set(varBand));
        return [];
      })(),
      strapSizes: (() => {
        if (Array.isArray(prod.strapSizes) && prod.strapSizes.length > 0) return prod.strapSizes;
        const candidate = Array.isArray(prod.accessoriesSizes) ? prod.accessoriesSizes : (Array.isArray(prod.sizes) ? prod.sizes : []);
        const nonMmSizes = candidate.filter(s => !/mm$/i.test(s) && !WATCH_BAND_SIZES.includes(s));
        if (nonMmSizes.length > 0) return Array.from(new Set(nonMmSizes));
        const varStrap = prodVariants.map(v => v.strapSize).filter(Boolean);
        if (varStrap.length > 0) return Array.from(new Set(varStrap));
        return [];
      })(),
      isWatchBand: Boolean(
        (Array.isArray(prod.bandSizes) && prod.bandSizes.length > 0) ||
        (Array.isArray(prod.strapSizes) && prod.strapSizes.length > 0) ||
        (Array.isArray(prod.accessoriesSizes) && prod.accessoriesSizes.length > 0) ||
        (/\b(watch\s*band|sport\s*band|ocean\s*band|milanese|sport\s*loop|solo\s*loop|alpine\s*loop|trail\s*loop|braided\s*solo|link\s*bracelet|modern\s*buckle|watch\s*strap)\b/i.test(prod.title || '')) ||
        (/(\bband\b|\bloop\b)/i.test(prod.title || '') && !/head|cushion/i.test(prod.title || ''))
      ),
      connectivities: (Array.isArray(prod.connectivities) && prod.connectivities.length > 0)
        ? prod.connectivities
        : Array.from(new Set(prodVariants.map(v => v.connectivity).filter(Boolean))),
      colors: Array.isArray(prod.colors) ? prod.colors : (prod.colors ? [prod.colors] : []),
      storage: Array.isArray(prod.storage) ? prod.storage : (prod.storage ? [prod.storage] : []),
      ram: Array.isArray(prod.ram) ? prod.ram : (prod.ram ? [prod.ram] : []),
      glasses: Array.isArray(prod.glasses) ? prod.glasses : (prod.glasses ? [prod.glasses] : []),
      processors: Array.isArray(prod.processors) ? prod.processors : (prod.processor ? [prod.processor] : []),
      material: prod.material || [],
      features: prod.features || [],
      displayImage: prod.displayImage || '',
      colorImages: prod.colorImages || {},
      images: prod.images || [],
      variants: mappedVariants,
      partNumber: prod.partNumber || '',
      modelNumber: prod.modelNumber || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
      tags: prod.tags || (prod.title ? prod.title.split(' ') : [])
    });
    setShowProductForm(true);

    // Set initial preview selections
    if (prod.colors && prod.colors.length > 0) {
      setSelectedPreviewColor(prod.colors[0]?.name || prod.colors[0]);
    }
    if (prod.storage && prod.storage.length > 0) {
      setSelectedPreviewStorage(prod.storage[0]);
    }
    if (prod.ram && prod.ram.length > 0) {
      setSelectedPreviewRam(prod.ram[0]);
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setProducts(prev => prev.filter(p => p._id !== id));
    try {
      await deleteProduct(id);
      showSuccessMessage('Product deleted successfully!');
      notifyAdminChange('products', { action: 'delete', id });
      fetchData();
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
      fetchData();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      discountPrice: 0,
      stock: '',
      brand: 'Apple',
      category: '',
      sizes: [],
      bandSizes: [],
      strapSizes: [],
      isWatchBand: false,
      colors: [],
      storage: [],
      ram: [],
      glasses: [],
      material: [],
      features: [],
      displayImage: '',
      colorImages: {},
      images: [],
      variants: [],
      partNumber: '',
      modelNumber: '',
      seoTitle: '',
      seoDescription: '',
      tags: []
    });
    setEditProductId(null);
    setShowProductForm(false);
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const addTag = () => {
    if (newTagInput.trim() && !productForm.tags?.includes(newTagInput.trim())) {
      setProductForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTagInput.trim()]
      }));
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleAddVariant = () => {
    setProductForm(prev => {
      const cName = prev.colors?.[0]?.name || prev.colors?.[0] || '';
      const cHex = prev.colors?.[0]?.colorHex || prev.colors?.[0]?.value || resolveColorHex(cName);
      const newVariant = {
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        color: cName,
        colorHex: cHex,
        price: prev.price || '',
        discountPrice: '',
        discountPercent: 0,
        discount: 0,
        discountInput: '',
        stock: prev.stock !== undefined && prev.stock !== '' ? prev.stock : 10,
        sku: `PRO-${Date.now().toString().slice(-4)}`,
        partNumber: '',
        modelNumber: '',
        storage: prev.storage?.[0] || '',
        ram: prev.ram?.[0] || '',
        size: prev.sizes?.[0] || '',
        bandSize: prev.bandSizes?.[0] || '',
        strapSize: prev.strapSizes?.[0] || '',
        connectivity: prev.connectivities?.[0] || '',
        accessoriesSize: prev.strapSizes?.[0] || '',
        glass: prev.glasses?.[0] || '',
        processor: prev.processors?.[0] || '',
        displayTitle: '',
        images: []
      };
      return {
        ...prev,
        variants: [...(prev.variants || []), newVariant]
      };
    });
  };

  const handleUpdateVariant = (index, updates) => {
    setProductForm(prev => {
      const variants = [...(prev.variants || [])];
      if (index < 0 || index >= variants.length) return prev;
      variants[index] = {
        ...variants[index],
        ...(typeof updates === 'function' ? updates(variants[index]) : updates)
      };
      return { ...prev, variants };
    });
  };

  const handleDeleteVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const handleMoveVariant = (index, direction) => {
    setProductForm(prev => {
      const list = [...(prev.variants || [])];
      if (index < 0 || index >= list.length) return prev;
      const [target] = list.splice(index, 1);
      let newIdx = index;
      if (direction === 'first') newIdx = 0;
      else if (direction === 'up') newIdx = Math.max(0, index - 1);
      else if (direction === 'down') newIdx = Math.min(list.length, index + 1);
      else if (direction === 'last') newIdx = list.length;
      list.splice(newIdx, 0, target);
      return { ...prev, variants: list };
    });
  };

  // Find dynamic price to display in the live preview
  const getPreviewPrice = () => {
    if (productForm.variants && productForm.variants.length > 0) {
      const match = productForm.variants.find(v =>
        (selectedPreviewColor ? v.color === selectedPreviewColor : true) &&
        (selectedPreviewStorage ? v.storage === selectedPreviewStorage : true) &&
        (selectedPreviewRam ? v.ram === selectedPreviewRam : true)
      );
      if (match && match.price) return Number(match.price);
      return Number(productForm.variants[0].price || 0);
    }
    return Number(productForm.price || 0);
  };

  const getPreviewImages = () => {
    // Collect all images matching selected color variant or fallback
    if (selectedPreviewColor && productForm.variants && productForm.variants.length > 0) {
      const match = productForm.variants.find(v => v.color === selectedPreviewColor);
      if (match && match.images && match.images.length > 0) return match.images;
    }
    if (productForm.displayImage) {
      const restImages = (productForm.images || []).filter(img => img !== productForm.displayImage);
      return [productForm.displayImage, ...restImages];
    }
    if (productForm.variants && productForm.variants.length > 0) {
      const anyVarWithImg = productForm.variants.find(v => v.images && v.images.length > 0);
      if (anyVarWithImg) return anyVarWithImg.images;
    }
    if (productForm.images && productForm.images.length > 0) return productForm.images;
    return ['/iphone_category_v2.jpg'];
  };

  // Sync active main image with selected preview color's images
  useEffect(() => {
    const imgs = getPreviewImages();
    if (imgs && imgs.length > 0) {
      setActivePreviewMainImage(imgs[0]);
    } else {
      setActivePreviewMainImage('/iphone_category_v2.jpg');
    }
  }, [selectedPreviewColor, productForm.variants, productForm.images, productForm.displayImage]);

  return (
    <div className="w-full text-left font-sans">
      {/* Alert toast notification */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Global error banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm text-left">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Operation Error</p>
            <p className="text-rose-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-450 hover:text-rose-650 cursor-pointer border-0 bg-transparent">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!showProductForm ? (
        <div>
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 text-left">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-900">Products Inventory</h1>
              <p className="text-zinc-500 mt-1 text-sm">Add product models, modify specifications, and manage galleries.</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={fetchStockLogs}
                className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-zinc-250"
              >
                <History className="h-4 w-4 text-zinc-500" />
                STOCK LOGS
              </button>
              <button
                onClick={() => setShowExcelManagerModal(true)}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
                EXCEL SHEETS
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-3 rounded-2xl text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer border-0"
              >
                <Plus className="h-4.5 w-4.5" />
                Add Product
              </button>
            </div>
          </header>

          {/* Category Excel Sheet Quick Manager Grid */}
          <div className="mb-8 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-6 text-white shadow-lg border border-zinc-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-base font-bold font-sans tracking-wide">Category Excel Sheets (Download & Upload)</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Download pre-formatted product sheets per category, update prices/variants in Excel, and upload back to live sync.</p>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                7 Categories Excel Support
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {CATEGORY_EXCEL_ITEMS.map((cat) => {
                const IconComp = cat.icon;
                const isExporting = exportingCategory === cat.key;
                
                return (
                  <div key={cat.key} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between transition-all group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${cat.color} text-white shrink-0`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-sm text-white font-sans">{cat.name}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mb-3.5">{cat.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => handleDownloadCategoryExcel(cat.key, cat.name)}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 px-2.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border border-zinc-700/60 disabled:opacity-50"
                        title={`Download ${cat.name} Excel Sheet`}
                      >
                        {isExporting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <Download className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        <span>Download</span>
                      </button>

                      <label className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-2.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border-0 text-center">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          className="hidden"
                          onChange={(e) => handleFileSelectForCategory(e, cat.key, cat.name)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Search Input Bar */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>

          {/* Products Table List */}
          <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm overflow-hidden text-left">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mb-3" />
                <span className="text-sm">Fetching catalog list...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Package className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <span className="text-sm">No products found in the database. Click "Add Product" to create one.</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Package className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <span className="text-sm">No products match your search query. Try another term.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 uppercase text-[10px] tracking-widest font-extrabold border-b border-zinc-100">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod._id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white border border-zinc-150 p-1 flex items-center justify-center overflow-hidden shrink-0 relative">
                            <img
                              src={prod.displayImage || prod.images?.[0] || '/iphone_category_v2.jpg'}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                            {prod.displayImage && (
                              <span className="absolute bottom-0.5 right-0.5 bg-[#0071e3] text-white text-[9px] font-bold px-1 py-0 rounded" title="Display Image Active">
                                ★
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 block font-sans text-sm">
                              {(() => {
                                const cleanTitle = (t) => (t || '').replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();
                                return cleanTitle(prod.title);
                              })()}
                            </span>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {/* Variants Count badge */}
                              {prod.variants && prod.variants.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-[#0071e3] border border-blue-200/80">
                                  {prod.variants.length} Variants
                                </span>
                              )}

                              {/* Storage badge */}
                              {prod.storage && prod.storage.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  💾 {Array.isArray(prod.storage) ? prod.storage.join(', ') : prod.storage}
                                </span>
                              )}

                              {/* RAM badge */}
                              {prod.ram && prod.ram.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  ⚡ {Array.isArray(prod.ram) ? prod.ram.join(', ') : prod.ram}
                                </span>
                              )}

                              {/* Part Number / SKU badge */}
                              {(() => {
                                const skus = Array.from(new Set([
                                  prod.partNumber,
                                  ...(prod.variants || []).map(v => v.partNumber || v.sku)
                                ].filter(Boolean)));

                                if (skus.length === 0) return null;

                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-50 text-amber-900 border border-amber-200/80" title={skus.join(', ')}>
                                    <span className="text-amber-700 uppercase font-sans">SKU{skus.length > 1 ? `s (${skus.length})` : ''}:</span>
                                    <span>{skus.slice(0, 3).join(', ')}{skus.length > 3 ? ` +${skus.length - 3} more` : ''}</span>
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-500 font-medium font-sans">
                          {prod.category?.name || 'Unassigned'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-zinc-800 font-sans">
                          ₹{prod.price?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div>
                              {prod.stock === 0 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                  OUT OF STOCK
                                </span>
                              ) : prod.stock <= 5 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                  LOW STOCK ({prod.stock})
                                </span>
                              ) : (
                                <span className="text-zinc-650 font-bold text-xs bg-zinc-100 px-2 py-1 rounded-md">{prod.stock} units</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleStock(prod)}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase transition-all border cursor-pointer ${
                                prod.stock === 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-750 border-rose-250 hover:bg-rose-100'
                              }`}
                              title={prod.stock === 0 ? "Mark In-Stock (10 units)" : "Mark Out-of-Stock (0 units)"}
                            >
                              {prod.stock === 0 ? 'Restock' : 'OOS'}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleProductEditClick(prod)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-[#0071e3] transition-all cursor-pointer inline-block border-0 bg-transparent"
                            title="Edit specs"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod._id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-all cursor-pointer inline-block border-0 bg-transparent"
                            title="Delete model"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Add / Edit Product Form UI matching screenshot layout
        <div className="bg-[#f8fafc] min-h-screen -m-6 sm:-m-8 md:-m-10 p-6 sm:p-8 font-sans">

          {/* Header Row */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left border-b border-zinc-200 pb-5">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={resetProductForm}
                className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 cursor-pointer transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Products</span>
                  <span className="text-zinc-300 text-sm">/</span>
                  <span className="text-xs text-zinc-650 font-bold uppercase tracking-wider">{editProductId ? 'Edit Product' : 'Add Product'}</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-1">
                  {productForm.title || (editProductId ? 'Edit Product' : 'New Product')}
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </h1>
              </div>
            </div>

            {/* Top controls: Desktop/Mobile toggles & action buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white border border-zinc-200 rounded-xl p-1 flex items-center shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-0 ${previewMode === 'desktop' ? 'bg-[#0071e3] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-850 bg-transparent'}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-0 ${previewMode === 'mobile' ? 'bg-[#0071e3] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-850 bg-transparent'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleProductSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer border-0 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                  Publish Product
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Form on left, live preview on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column (Col Span 8) - Editor Form */}
            <div className="lg:col-span-8 space-y-6">

              {/* Tabs indicator */}
              <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-450 pb-2">
                <span className="text-[#0071e3] border-b-2 border-[#0071e3] pb-2 cursor-pointer">Basic Information</span>
                <span className="hover:text-zinc-800 cursor-pointer pb-2">Variants</span>
                <span className="hover:text-zinc-800 cursor-pointer pb-2">Images</span>
                <span className="hover:text-zinc-800 cursor-pointer pb-2">SEO</span>
                <span className="hover:text-zinc-800 cursor-pointer pb-2">Shipping</span>
                <span className="hover:text-zinc-800 cursor-pointer pb-2">More</span>
              </div>

              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm text-left">

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MacBook Air (M3 Chip)"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:border-[#0071e3]"
                  />
                </div>

                {/* Description with editor toolbar */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <div className="flex items-center gap-1.5 border border-zinc-200 border-b-0 rounded-t-xl px-3 py-2.5 bg-zinc-50/50">
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Bold className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Italic className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Underline className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-4 bg-zinc-200"></span>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><List className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><ListOrdered className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-4 bg-zinc-200"></span>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Quote className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><LinkIcon className="h-3.5 w-3.5" /></button>
                  </div>
                  <textarea
                    rows="5"
                    placeholder="Introduce key specs, chipset details, camera lens, etc."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-b-xl border border-zinc-200 border-t-0 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] outline-none text-sm transition-all resize-none text-zinc-800 leading-relaxed"
                  />
                </div>

                {/* Category & Brand side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Brand *
                    </label>
                    <select
                      required
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white cursor-pointer"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Belkin">Belkin</option>
                      <option value="Sony">Sony</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Model Number & Part Number / MPN side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Base Model Number (e.g. A3113 / A2681)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A3113"
                      value={productForm.modelNumber || ''}
                      onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Base Part Number / MPN (e.g. MW2U3HN/A)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MW2U3HN/A"
                      value={productForm.partNumber || ''}
                      onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white font-mono text-zinc-800"
                    />
                  </div>
                </div>

                {/* Tags section matching design */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border border-zinc-200 rounded-xl min-h-[48px] bg-white">
                    {productForm.tags && productForm.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-zinc-800 bg-transparent border-0 cursor-pointer p-0"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 outline-none text-xs px-2 py-1 min-w-[80px]"
                    />
                  </div>
                </div>

                {/* Primary Display Image (Card Cover Image) */}
                <div className="border-t border-zinc-150 pt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-extrabold text-[#0071e3] uppercase tracking-wider">
                        🖼️ Primary Display Image (Hero Card Cover Image)
                      </label>
                      {productForm.displayImage && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Display Image Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      This image is shown on store product cards (Mac, iPhone, iPad, Watch, AirPods) as default cover before a color swatch is clicked.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                    <input
                      type="file"
                      accept="image/*"
                      id="display-image-upload"
                      onChange={handleDisplayImageUpload}
                      className="hidden"
                    />

                    {/* Current Display Image Preview */}
                    {productForm.displayImage ? (
                      <div className="relative h-24 w-24 rounded-xl border border-blue-200 bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img src={productForm.displayImage} alt="Display Image" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, displayImage: '' }))}
                          className="absolute top-1 right-1 h-5 w-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm"
                          title="Remove Display Image"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-xl border-2 border-dashed border-blue-200 bg-white flex flex-col items-center justify-center text-center p-2 text-zinc-400 shrink-0">
                        <Package className="h-6 w-6 mb-1 text-blue-400" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">No Image</span>
                      </div>
                    )}

                    {/* Controls & URL input */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => document.getElementById('display-image-upload').click()}
                          className="px-3.5 py-2 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-xs transition-all"
                        >
                          {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          Upload Display Image
                        </button>
                        {productForm.images && productForm.images.length > 0 && !productForm.displayImage && (
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, displayImage: prev.images[0] }))}
                            className="px-3 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                          >
                            Set First Product Image
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Or paste Display Image URL (e.g. /mac_nav/macbook_air_m3.png or https://...)"
                          value={productForm.displayImage || ''}
                          onChange={(e) => setProductForm({ ...productForm, displayImage: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs outline-none bg-white font-mono focus:border-[#0071e3]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Product Image Upload (Used if no variants exist) */}
                <div className="border-t border-zinc-150 pt-4">
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Base Product Gallery Images
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="base-product-upload"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />

                    {productForm.images && productForm.images.map((imgUrl, imgIdx) => {
                      const isDisplay = productForm.displayImage === imgUrl;
                      return (
                        <div key={imgIdx} className={`relative h-16 w-16 rounded-xl border ${isDisplay ? 'border-2 border-[#0071e3] ring-2 ring-blue-100' : 'border-zinc-200'} bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-sm group`}>
                          <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm(prev => ({
                                ...prev,
                                displayImage: isDisplay ? '' : imgUrl
                              }));
                            }}
                            className={`absolute bottom-1 left-1 h-5 w-5 ${isDisplay ? 'bg-[#0071e3] text-white' : 'bg-black/40 hover:bg-black text-white'} font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm`}
                            title={isDisplay ? "Current Display Image" : "Set as Display Image"}
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== imgIdx),
                                displayImage: prev.displayImage === imgUrl ? '' : prev.displayImage
                              }));
                            }}
                            className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('base-product-upload').click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#0071e3] hover:bg-zinc-50 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent transition-all shadow-sm"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                      ) : (
                        <Upload className="h-4 w-4 text-zinc-400" />
                      )}
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Upload</span>
                    </button>
                  </div>
                </div>

                {/* Base price & stock input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-150 pt-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Base Price / MRP (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 79900"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-xs font-bold text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Default Stock *
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Spec Option Config tags */}
                {(() => {
                  const selectedCatObj = categories.find(c => c._id === productForm.category || c.slug === productForm.category || c.name === productForm.category);
                  const selectedCatSlug = (selectedCatObj?.slug || selectedCatObj?.name || productForm.category || '').toString().toLowerCase();
                  const isWatchCategory = selectedCatSlug.includes('watch') || selectedCatSlug.includes('wearable');
                  const isAccessoriesCategory = selectedCatSlug.includes('accessori');
                  const isWatchBand = checkIsWatchBand(productForm, selectedCatSlug);

                  return (
                    <div className="border-t border-zinc-150 pt-4 space-y-4">
                      {isAccessoriesCategory && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                          <div>
                            <span className="text-xs font-bold text-zinc-800">Watch Band Accessory</span>
                            <p className="text-[11px] text-zinc-500">Enable Watch Band size options for this accessory</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(isWatchBand)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setProductForm(prev => ({
                                  ...prev,
                                  isWatchBand: checked,
                                  bandSizes: checked ? (prev.bandSizes && prev.bandSizes.length > 0 ? prev.bandSizes : []) : [],
                                  strapSizes: checked ? (prev.strapSizes && prev.strapSizes.length > 0 ? prev.strapSizes : []) : []
                                }));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0071e3]"></div>
                          </label>
                        </div>
                      )}

                      {/* Case Size Options */}
                      {!isWatchBand && (
                        <VariantTagInput
                          label={isWatchCategory ? "Case Size Options (Watch)" : "Sizes Config Options"}
                          placeholder={isWatchCategory ? "e.g. 42mm, 46mm, 49mm" : "e.g. 14-inch, 16-inch"}
                          tags={productForm.sizes || []}
                          onChange={(tags) => {
                            const removed = (productForm.sizes || []).filter(t => !tags.includes(t));
                            let updatedVariants = [...(productForm.variants || [])];
                            if (removed.length > 0) {
                              updatedVariants = updatedVariants.map(v => {
                                if (removed.includes(v.size)) {
                                  return { ...v, size: '' };
                                }
                                return v;
                              });
                            }
                            setProductForm({ ...productForm, sizes: tags, variants: updatedVariants });
                          }}
                        />
                      )}

                      {/* Option 1: Band Size Options (Watch & Watch Bands) */}
                      {(isWatchCategory || isWatchBand) && (
                        <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2">
                          <VariantTagInput
                            label={isAccessoriesCategory ? "1. Band Size Options (mm)" : "Band Size Options (Watch)"}
                            placeholder="e.g. 40mm, 41mm, 42mm, 46mm, 49mm"
                            tags={productForm.bandSizes || []}
                            onChange={(tags) => {
                              const removed = (productForm.bandSizes || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.bandSize)) {
                                    return { ...v, bandSize: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, bandSizes: tags, variants: updatedVariants });
                            }}
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-zinc-400 font-semibold self-center">Quick add:</span>
                            {WATCH_BAND_SIZES.map(preset => {
                              const isSelected = (productForm.bandSizes || []).includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    const current = productForm.bandSizes || [];
                                    if (isSelected) {
                                      setProductForm({ ...productForm, bandSizes: current.filter(s => s !== preset) });
                                    } else {
                                      setProductForm({ ...productForm, bandSizes: [...current, preset] });
                                    }
                                  }}
                                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                  }`}
                                >
                                  {isSelected ? '✓ ' : '+ '}{preset}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Option 2: Strap Size Options (Watch Bands & Watches) */}
                      {(isWatchCategory || isWatchBand) && (
                        <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2">
                          <VariantTagInput
                            label={isAccessoriesCategory ? "2. Strap Size Options" : "Strap Size Options (Watch)"}
                            placeholder="e.g. S/M, M/L, Small, Medium, Large, Loop"
                            tags={productForm.strapSizes || []}
                            onChange={(tags) => {
                              const removed = (productForm.strapSizes || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.strapSize)) {
                                    return { ...v, strapSize: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, strapSizes: tags, variants: updatedVariants });
                            }}
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-zinc-400 font-semibold self-center">Quick add:</span>
                            {WATCH_STRAP_SIZES.map(preset => {
                              const isSelected = (productForm.strapSizes || []).includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    const current = productForm.strapSizes || [];
                                    if (isSelected) {
                                      setProductForm({ ...productForm, strapSizes: current.filter(s => s !== preset) });
                                    } else {
                                      setProductForm({ ...productForm, strapSizes: [...current, preset] });
                                    }
                                  }}
                                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                  }`}
                                >
                                  {isSelected ? '✓ ' : '+ '}{preset}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isWatchCategory && !isAccessoriesCategory && (
                        <div>
                          <VariantTagInput
                            label="Connectivity Options (Watch)"
                            placeholder="e.g. GPS, GPS + Cellular"
                            tags={productForm.connectivities || []}
                            onChange={(tags) => {
                              const removed = (productForm.connectivities || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.connectivity)) {
                                    return { ...v, connectivity: '', displayTitle: '', title: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, connectivities: tags, variants: updatedVariants });
                            }}
                          />
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[10px] text-zinc-400 font-semibold self-center">Quick add:</span>
                            {['GPS', 'GPS + Cellular'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  const current = productForm.connectivities || [];
                                  if (!current.includes(preset)) {
                                    setProductForm({ ...productForm, connectivities: [...current, preset] });
                                  }
                                }}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  (productForm.connectivities || []).includes(preset)
                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                }`}
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors Config Options */}
                      <VariantTagInput
                        label="Colors Config Options"
                        placeholder="e.g. Space Grey, Black, Light Gold, Dark Bronze"
                        tags={(productForm.colors || []).map(c => typeof c === 'object' ? c.name : c)}
                        onChange={(tags) => {
                          const removed = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(t => !tags.includes(t));
                          let updatedVariants = [...(productForm.variants || [])];
                          if (removed.length > 0) {
                            updatedVariants = updatedVariants.map(v => {
                              if (removed.includes(v.color)) {
                                return { ...v, color: '' };
                              }
                              return v;
                            });
                          }
                          setProductForm({
                            ...productForm,
                            colors: tags.map(t => {
                              const existing = (productForm.colors || []).find(c => (c?.name || c) === t);
                              return existing || { name: t, value: t, images: [] };
                            }),
                            variants: updatedVariants
                          });
                        }}
                      />

                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={handleAutoGenerateColorVariants}
                          className="text-xs font-bold text-[#0071e3] hover:text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Generate Color-only MPN Fields
                        </button>
                        {isWatchCategory ? (
                          <button
                            type="button"
                            onClick={handleAutoGenerateWatchVariants}
                            className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Generate Watch Variants (Color + Case Size + Band Size + Connectivity)
                          </button>
                        ) : isWatchBand ? (
                          <button
                            type="button"
                            onClick={handleAutoGenerateWatchVariants}
                            className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Generate Watch Band Variants (Color + Band Size + Strap Size)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAutoGenerateFullMatrixVariants}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Generate All (Color + Storage + RAM) Combination MPN & Price Fields
                          </button>
                        )}
                      </div>

                      {/* Non-Watch fields (Storage, RAM, Processor, Glass finish) */}
                      {!isWatchCategory && !isWatchBand && (
                        <>
                          <VariantTagInput
                            label="Storage Options"
                            placeholder="e.g. 256GB SSD, 512GB SSD, 1TB SSD"
                            tags={productForm.storage || []}
                            onChange={(tags) => {
                              const removed = (productForm.storage || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.storage)) {
                                    return { ...v, storage: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, storage: tags, variants: updatedVariants });
                            }}
                          />

                          <VariantTagInput
                            label="RAM Options"
                            placeholder="e.g. 8GB, 16GB, 24GB, 32GB"
                            tags={productForm.ram || []}
                            onChange={(tags) => {
                              const removed = (productForm.ram || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.ram)) {
                                    return { ...v, ram: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, ram: tags, variants: updatedVariants });
                            }}
                          />

                          <VariantTagInput
                            label="Chip & Processor Options (Laptops & PCs / Mac)"
                            placeholder="e.g. Apple M4 chip with 8‑core CPU and 8‑core GPU"
                            tags={productForm.processors || []}
                            onChange={(tags) => {
                              const removed = (productForm.processors || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.processor)) {
                                    return { ...v, processor: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, processors: tags, variants: updatedVariants });
                            }}
                          />

                          <VariantTagInput
                            label="Glass Finish Config Options"
                            placeholder="e.g. Standard glass, Nano-texture glass"
                            tags={productForm.glasses || []}
                            onChange={(tags) => {
                              const removed = (productForm.glasses || []).filter(t => !tags.includes(t));
                              let updatedVariants = [...(productForm.variants || [])];
                              if (removed.length > 0) {
                                updatedVariants = updatedVariants.map(v => {
                                  if (removed.includes(v.glass)) {
                                    return { ...v, glass: '' };
                                  }
                                  return v;
                                });
                              }
                              setProductForm({ ...productForm, glasses: tags, variants: updatedVariants });
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Variants Section Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm text-left">
                <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                      Variants
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Configure color, price, storage, and custom image galleries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-0 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </button>
                </div>

                {/* Variants List */}
                {(!productForm.variants || productForm.variants.length === 0) ? (
                  <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
                    No variants added. The product will be created using basic price and stock settings.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {productForm.variants.map((v, vIdx) => {
                      const selectedCatObj = categories.find(c => c._id === productForm.category || c.slug === productForm.category || c.name === productForm.category);
                      const selectedCatSlug = (selectedCatObj?.slug || selectedCatObj?.name || productForm.category || '').toString().toLowerCase();
                      const isWatchCategory = selectedCatSlug.includes('watch') || selectedCatSlug.includes('wearable');
                      const isAccessoriesCategory = selectedCatSlug.includes('accessori');
                      const isWatchBand = checkIsWatchBand(productForm, selectedCatSlug);
                      const variantKey = v.id || v._id || `variant-${vIdx}`;

                      return (
                        <div key={variantKey} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-zinc-300 transition-all text-left">

                          {/* Variant header row with Excel-style specs summary */}
                          <div className="flex justify-between items-center border-b border-zinc-150 pb-3 bg-zinc-100/70 -mx-5 -mt-5 px-5 py-2.5 rounded-t-xl">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab" />
                              <span className="text-[11px] font-extrabold text-zinc-800 uppercase tracking-wide flex items-center gap-2 font-mono">
                                <span className="inline-block w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0 shadow-2xs" style={{ backgroundColor: resolveColorValue(v.colorHex || v.color) }} />
                                <span>#{vIdx + 1}: {v.color || 'Color'} {v.colorHex ? `(${v.colorHex})` : ''} {v.bandSize ? `| Band: ${v.bandSize}` : ''} {v.strapSize ? `| Strap: ${v.strapSize}` : (v.accessoriesSize && v.accessoriesSize !== 'None' ? `| Size: ${v.accessoriesSize}` : '')} {v.size && v.size !== v.bandSize ? `| ${v.size}` : ''} {v.connectivity ? `| ${v.connectivity}` : ''} {!isWatchCategory && !isWatchBand && v.ram ? `| ${v.ram}` : ''} {!isWatchCategory && !isWatchBand && v.storage ? `| ${v.storage}` : ''} {v.partNumber ? `| MPN: ${v.partNumber}` : ''} {v.sku ? `| SKU: ${v.sku}` : ''} {v.price ? `| ₹${Number(v.price).toLocaleString('en-IN')}` : ''}</span>
                                {vIdx === 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-sans">Default</span>}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-0.5 mr-2 bg-white/80 border border-zinc-200 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'first')}
                                  disabled={vIdx === 0}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move to First (Top)"
                                >
                                  <ArrowUpToLine className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'up')}
                                  disabled={vIdx === 0}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'down')}
                                  disabled={vIdx === productForm.variants.length - 1}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'last')}
                                  disabled={vIdx === productForm.variants.length - 1}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move to Last (Bottom)"
                                >
                                  <ArrowDownToLine className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteVariant(vIdx)}
                                className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Grid row: Watch vs Non-Watch Variant Fields */}
                          <div className={`grid gap-3.5 ${isWatchCategory ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}`}>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Color & Shade</label>
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">{v.colorHex || resolveColorHex(v.color) || '#------'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="relative shrink-0 group/color" title="Click swatch to pick custom shade">
                                  <input
                                    type="color"
                                    value={isValidHex(v.colorHex || resolveColorHex(v.color)) ? normalizeHex(v.colorHex || resolveColorHex(v.color)) : '#808080'}
                                    onChange={(e) => handleUpdateVariant(vIdx, { colorHex: e.target.value.toUpperCase() })}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                  />
                                  <div
                                    className="w-9 h-9 rounded-xl border border-zinc-300 shadow-xs flex items-center justify-center transition-transform group-hover/color:scale-105 cursor-pointer overflow-hidden"
                                    style={{ backgroundColor: resolveColorValue(v.colorHex || v.color) }}
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="e.g. Chalk Pink"
                                  value={v.color || ''}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    const autoHex = resolveColorHex(newName);
                                    handleUpdateVariant(vIdx, curr => {
                                      const wasAuto = !curr.colorHex || curr.colorHex === resolveColorHex(curr.color || '');
                                      return {
                                        color: newName,
                                        colorHex: wasAuto ? autoHex : curr.colorHex
                                      };
                                    });
                                    if (vIdx === 0) setSelectedPreviewColor(newName);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                />
                              </div>
                            </div>

                            {isWatchCategory ? (
                              <>
                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Case Size</label>
                                  <div className="flex gap-1.5 items-center">
                                    <select
                                      value={['40mm', '42mm', '44mm', '46mm', '41mm', '45mm', '49mm'].includes(v.size) ? v.size : ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { size: e.target.value })}
                                      className="px-2 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 shrink-0 cursor-pointer shadow-xs"
                                    >
                                      <option value="">Select Size</option>
                                      <option value="40mm">40mm</option>
                                      <option value="42mm">42mm</option>
                                      <option value="44mm">44mm</option>
                                      <option value="46mm">46mm</option>
                                      <option value="41mm">41mm</option>
                                      <option value="45mm">45mm</option>
                                      <option value="49mm">49mm</option>
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="e.g. 42mm"
                                      value={v.size || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { size: e.target.value })}
                                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Band Size</label>
                                  <div className="flex gap-1.5 items-center">
                                    <select
                                      value={v.bandSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { bandSize: e.target.value })}
                                      className="px-2 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 shrink-0 cursor-pointer shadow-xs"
                                    >
                                      <option value="">Select Band</option>
                                      {Array.from(new Set([...WATCH_BAND_SIZES, ...(productForm.bandSizes || [])])).map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="e.g. 40mm, S/M, Loop"
                                      value={v.bandSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { bandSize: e.target.value })}
                                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : isWatchBand ? (
                              <>
                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Band Size (mm)</label>
                                  <div className="flex gap-1.5 items-center">
                                    <select
                                      value={v.bandSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { bandSize: e.target.value, size: e.target.value })}
                                      className="px-2 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 shrink-0 cursor-pointer shadow-xs"
                                    >
                                      <option value="">Select Band</option>
                                      {Array.from(new Set([...WATCH_BAND_SIZES, ...(productForm.bandSizes || [])])).map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="e.g. 40mm, 42mm"
                                      value={v.bandSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { bandSize: e.target.value, size: e.target.value })}
                                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Strap Size</label>
                                  <div className="flex gap-1.5 items-center">
                                    <select
                                      value={v.strapSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { strapSize: e.target.value, accessoriesSize: e.target.value })}
                                      className="px-2 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 shrink-0 cursor-pointer shadow-xs"
                                    >
                                      <option value="">Select Strap</option>
                                      {Array.from(new Set([...WATCH_STRAP_SIZES, ...(productForm.strapSizes || [])])).map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="e.g. S/M, M/L, Loop"
                                      value={v.strapSize || ''}
                                      onChange={(e) => handleUpdateVariant(vIdx, { strapSize: e.target.value, accessoriesSize: e.target.value })}
                                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Storage</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 512GB SSD"
                                    value={v.storage || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, { storage: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">RAM</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 16GB"
                                    value={v.ram || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, { ram: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Glass Finish</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Standard glass / Nano-texture glass"
                                    value={v.glass || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, { glass: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Chip & Processor</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Apple M5 chip with 10-core CPU"
                                    value={v.processor || v.chip || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, { processor: e.target.value, chip: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium text-zinc-900 font-sans"
                                  />
                                </div>
                              </>
                            )}

                            {!isWatchBand && (
                              <div>
                                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Accessories Size</label>
                                <select
                                  value={v.accessoriesSize || ''}
                                  onChange={(e) => handleUpdateVariant(vIdx, { accessoriesSize: e.target.value })}
                                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 cursor-pointer shadow-xs"
                                >
                                  <option value="">None / Not Applicable</option>
                                  <option value="XXS">XXS</option>
                                  <option value="XS">XS</option>
                                  <option value="Small">Small</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Large">Large</option>
                                </select>
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Part No. / MPN</label>
                              <input
                                type="text"
                                placeholder="e.g. MDHE4HN/A"
                                value={v.partNumber || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, curr => ({ partNumber: e.target.value, sku: curr.sku || e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-mono font-bold text-black bg-amber-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">SKU</label>
                              <input
                                type="text"
                                placeholder="e.g. PRO-1234"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { sku: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-mono text-zinc-800 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Model No.</label>
                              <input
                                type="text"
                                placeholder="e.g. A3241"
                                value={v.modelNumber || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { modelNumber: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-mono text-zinc-800 bg-white"
                              />
                            </div>

                            {isWatchCategory ? (
                              <div className="col-span-2">
                                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Connectivity / Variant Title</label>
                                <div className="flex gap-2 items-center">
                                  <select
                                    value={v.connectivity || (v.displayTitle?.includes('Cellular') ? 'GPS + Cellular' : v.displayTitle?.includes('GPS') ? 'GPS' : '')}
                                    onChange={(e) => handleUpdateVariant(vIdx, { connectivity: e.target.value, displayTitle: e.target.value, title: e.target.value })}
                                    className="px-2.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-bold text-zinc-900 shrink-0 cursor-pointer shadow-xs"
                                  >
                                    <option value="">Select Connectivity</option>
                                    <option value="GPS">GPS</option>
                                    <option value="GPS + Cellular">GPS + Cellular</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="e.g. GPS or GPS + Cellular"
                                    value={v.connectivity || v.displayTitle || v.title || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, { connectivity: e.target.value, displayTitle: e.target.value, title: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="col-span-2">
                                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Variant Title (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 11-inch iPad Pro Wi‑Fi 1TB with nano-texture glass"
                                  value={v.displayTitle || v.title || ''}
                                  onChange={(e) => handleUpdateVariant(vIdx, { displayTitle: e.target.value, title: e.target.value })}
                                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Price / MRP (₹) *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                placeholder="79900"
                                value={v.price !== undefined && v.price !== null ? v.price : ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { price: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-bold text-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Discount (% OFF or ₹)</label>
                              <input
                                type="text"
                                placeholder="e.g. 10 (for 10% OFF) or 0"
                                value={v.discountInput !== undefined && v.discountInput !== null && v.discountInput !== '' ? v.discountInput : (v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== '' ? v.discountPercent : (v.discount !== undefined && v.discount !== null && v.discount !== '' ? v.discount : ''))}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateVariant(vIdx, { 
                                    discountInput: val,
                                    discountPercent: val !== '' ? Number(val) : 0,
                                    discount: val !== '' ? Number(val) : 0
                                  });
                                }}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-bold text-emerald-700 bg-emerald-50/50"
                              />
                              {(() => {
                                const vPrice = Number(v.price || productForm.price || 0);
                                const dRaw = v.discountInput !== undefined && v.discountInput !== null && v.discountInput !== '' 
                                  ? v.discountInput 
                                  : (v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== '' 
                                      ? v.discountPercent 
                                      : (v.discount !== undefined && v.discount !== null ? v.discount : 0));
                                const dVal = Number(dRaw || 0);
                                if (vPrice > 0) {
                                  let calcSelling = vPrice;
                                  let calcPct = 0;
                                  if (dVal > 0 && dVal <= 99) {
                                    calcPct = Math.round(dVal);
                                    calcSelling = Math.round(vPrice - (vPrice * dVal / 100));
                                  } else if (dVal > 99 && dVal < vPrice) {
                                    if (dVal < (vPrice / 2)) {
                                      calcSelling = vPrice - dVal;
                                      calcPct = Math.round((dVal / vPrice) * 100);
                                    } else {
                                      calcSelling = dVal;
                                      calcPct = Math.round(((vPrice - dVal) / vPrice) * 100);
                                    }
                                  }
                                  return (
                                    <span className={`text-[10px] font-extrabold mt-1 block ${calcPct > 0 ? 'text-emerald-600' : 'text-zinc-500'}`}>
                                      Selling Price: ₹{calcSelling.toLocaleString('en-IN')} {calcPct > 0 ? `(${calcPct}% OFF)` : '(0% OFF)'}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Stock *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                placeholder="10"
                                value={v.stock !== undefined && v.stock !== null ? v.stock : ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { stock: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs"
                              />
                            </div>
                          </div>

                          {/* Images Horizontal List */}
                          <div className="space-y-1.5 text-left pt-1">
                            <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                              Images (Max 8)
                            </span>

                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                id={`variant-upload-${vIdx}`}
                                onChange={(e) => handleVariantImageUpload(e, vIdx)}
                                className="hidden"
                              />

                              {v.images && v.images.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative h-16 w-16 rounded-xl border border-zinc-200 bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-sm">
                                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateVariant(vIdx, curr => ({
                                        images: (curr.images || []).filter((_, i) => i !== imgIdx)
                                      }));
                                    }}
                                    className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                disabled={uploadingColorIndex === vIdx}
                                onClick={() => document.getElementById(`variant-upload-${vIdx}`).click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent transition-all shadow-sm"
                              >
                                {uploadingColorIndex === vIdx ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                ) : (
                                  <Upload className="h-4 w-4 text-zinc-400" />
                                )}
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Upload</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                    >
                      <Plus className="h-4 w-4 text-zinc-400" />
                      <span>Add Another Variant</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SEO Information */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm text-left">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">
                  SEO Information
                </h3>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MacBook Air - Supercharged by M3..."
                    value={productForm.seoTitle || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Buy MacBook Air M3 at wholesale bulk rates..."
                    value={productForm.seoDescription || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all resize-none text-zinc-800"
                  />
                </div>
              </div>

            </div>

            {/* Right Column (Col Span 4) - Live Preview */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4.5 w-4.5 text-[#0071e3]" />
                  Live Preview
                </h3>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Dynamic Sandbox</span>
              </div>
              <p className="text-[11px] text-zinc-400 text-left -mt-2 leading-relaxed">
                This is a live, interactive preview showing how your product details and configurations will appear on the customer-facing storefront.
              </p>

              {/* Outer preview frame styled by toggle */}
              <div className={`bg-white border border-zinc-200 rounded-3xl shadow-md overflow-hidden transition-all duration-300 mx-auto ${previewMode === 'mobile' ? 'max-w-[370px] border-8 border-zinc-950 rounded-[40px]' : 'w-full'}`}>

                {/* Visual Header of Card */}
                <div className="h-48 bg-zinc-50 relative overflow-hidden flex items-center justify-center p-4 border-b border-zinc-100">
                  <img
                    src={activePreviewMainImage || getPreviewImages()[0] || '/iphone_category_v2.jpg'}
                    alt="Preview Visual"
                    className="max-h-full max-w-full w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Gallery Thumbnails inside Live Preview */}
                {getPreviewImages().length > 1 && (
                  <div className="flex gap-2 px-6 pt-3 justify-center overflow-x-auto">
                    {getPreviewImages().map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePreviewMainImage(imgUrl)}
                        className={`w-10 h-10 rounded border p-0.5 bg-white flex items-center justify-center overflow-hidden cursor-pointer shrink-0 ${activePreviewMainImage === imgUrl ? 'border-zinc-800 border-2' : 'border-zinc-200 hover:border-zinc-400'}`}
                      >
                        <img src={imgUrl} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Content area */}
                <div className="p-6 space-y-4 text-left">
                  {/* Title & Rating */}
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">
                      <span>{productForm.title || "MacBook Air (M3 Chip)"}</span>
                      {(productForm.partNumber || productForm.variants?.[0]?.partNumber) && (
                        <span className="font-mono font-extrabold text-zinc-900 ml-2 inline-block">
                          {productForm.partNumber || productForm.variants?.[0]?.partNumber}
                        </span>
                      )}
                    </h2>

                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold font-sans mt-0.5">4.8 (256 reviews)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-2xl font-black text-zinc-900 font-sans">
                      ₹{getPreviewPrice().toLocaleString()}
                    </span>
                    <p className="text-[9px] text-zinc-400 font-medium font-sans mt-0.5">(Incl. of all taxes)</p>
                  </div>

                  {/* Dynamic Color swatch circles */}
                  {productForm.colors && productForm.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Color: <span className="text-zinc-800 capitalize font-extrabold">{selectedPreviewColor || (productForm.colors[0]?.name || productForm.colors[0])}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {productForm.colors.map((c) => {
                          const cName = typeof c === 'object' ? c.name : c;
                          const isSelected = selectedPreviewColor === cName || (!selectedPreviewColor && productForm.colors[0]?.name === cName);
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => setSelectedPreviewColor(cName)}
                              style={{ backgroundColor: resolveColorValue(c) }}
                              className={`w-5 h-5 rounded-full cursor-pointer border transition-all ${isSelected ? 'scale-125 border-zinc-900 ring-2 ring-zinc-300' : 'border-zinc-300 hover:scale-110'}`}
                              title={cName}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Storage selections */}
                  {productForm.storage && productForm.storage.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storage</span>
                      <div className="flex flex-wrap gap-2">
                        {productForm.storage.map((st) => {
                          const isSelected = selectedPreviewStorage === st || (!selectedPreviewStorage && productForm.storage[0] === st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setSelectedPreviewStorage(st)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${isSelected ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic RAM selections */}
                  {productForm.ram && productForm.ram.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RAM</span>
                      <div className="flex flex-wrap gap-2">
                        {productForm.ram.map((rm) => {
                          const isSelected = selectedPreviewRam === rm || (!selectedPreviewRam && productForm.ram[0] === rm);
                          return (
                            <button
                              key={rm}
                              type="button"
                              onClick={() => setSelectedPreviewRam(rm)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${isSelected ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                            >
                              {rm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer border-0"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="w-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                    >
                      Add to Wishlist
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Stock History Logs Modal */}
      {showStockLogsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-250 text-left">
            <header className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Inventory Auditing</span>
                <h3 className="font-bold text-zinc-900 text-lg">Stock Update History</h3>
              </div>
              <button 
                onClick={() => setShowStockLogsModal(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-955 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingLogs ? (
                <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mb-3" />
                  <span>Loading audit logs...</span>
                </div>
              ) : stockLogs.length === 0 ? (
                <p className="text-zinc-550 text-center py-8">No stock updates recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {stockLogs.map((log) => (
                    <div key={log._id} className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{log.product?.title || 'Unknown Product'}</span>
                          <span className="text-[10px] text-zinc-450">({log.product?.brand})</span>
                        </div>
                        <p className="text-zinc-550 mt-1 text-xs">{log.changeReason}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Logged at {new Date(log.createdAt).toLocaleString()} by {log.updatedBy?.name || 'System/API'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-sans">
                        <span className="text-zinc-450 line-through text-xs font-medium">{log.oldStock}</span>
                        <span className="text-zinc-450 font-medium">→</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          log.newStock > log.oldStock 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.newStock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStockLogsModal(false)}
                className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Category Excel Manager Modal */}
      {showExcelManagerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-250 text-left">
            <header className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                  <h2 className="font-bold text-white text-xl font-sans">Category Product Excel Sheets Manager</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Download pre-filled Excel sheets for any product category, update pricing or details, and re-upload to instantly update live website products.
                </p>
              </div>
              <button 
                onClick={() => setShowExcelManagerModal(false)}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {CATEGORY_EXCEL_ITEMS.map((cat) => {
                const IconComp = cat.icon;
                const isExporting = exportingCategory === cat.key;

                return (
                  <div key={cat.key} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-xl ${cat.color} text-white shrink-0`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base font-sans">{cat.name} Sheet</h4>
                          <span className="text-[10px] font-mono text-zinc-400">key: {cat.key}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{cat.subtitle}</p>
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => handleDownloadCategoryExcel(cat.key, cat.name)}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-zinc-700 disabled:opacity-50"
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        ) : (
                          <Download className="h-4 w-4 text-emerald-400" />
                        )}
                        <span>Download Sheet</span>
                      </button>

                      <label className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0 text-center">
                        <Upload className="h-4 w-4" />
                        <span>Upload Sheet</span>
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          className="hidden"
                          onChange={(e) => handleFileSelectForCategory(e, cat.key, cat.name)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExcelManagerModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Sheet Import Preview & Confirmation Modal */}
      {showExcelPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-250 text-left">
            <header className="flex justify-between items-center border-b border-zinc-150 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Category: {selectedCategoryForImport?.name}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">{selectedExcelFile?.name}</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xl mt-1">Confirm Excel Products Import</h3>
              </div>
              <button 
                onClick={() => setShowExcelPreviewModal(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {loadingExcelPreview ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="h-9 w-9 animate-spin text-emerald-600 mb-3" />
                <span className="text-sm font-medium">Parsing Excel sheet rows...</span>
              </div>
            ) : excelPreviewData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Excel Rows</span>
                    <span className="text-lg font-bold text-zinc-900">{excelPreviewData.totalRows}</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Target Products</span>
                    <span className="text-lg font-bold text-emerald-900">{excelPreviewData.totalProducts}</span>
                  </div>
                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Target Category</span>
                    <span className="text-sm font-bold text-blue-900">{selectedCategoryForImport?.name}</span>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <div className="bg-zinc-100/80 px-4 py-2.5 border-b border-zinc-200 flex justify-between items-center text-xs font-bold text-zinc-600 uppercase tracking-wider">
                    <span>Parsed Product Titles</span>
                    <span>Variants & MPNs</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 text-xs">
                    {excelPreviewData.products.map((p, idx) => (
                      <div key={idx} className="p-3 hover:bg-zinc-50/80 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-zinc-900">{p.title}</p>
                          <p className="text-[10px] text-zinc-400">Brand: {p.brand} | Category: {p.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold rounded-md text-[10px]">
                            {p.variantCount} Variant{p.variantCount > 1 ? 's' : ''}
                          </span>
                          {p.samplePartNumber && (
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{p.samplePartNumber}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-rose-600 text-sm">Failed to load preview data.</p>
            )}

            <div className="pt-3 border-t border-zinc-150 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExcelPreviewModal(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-zinc-250"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelImport}
                disabled={importingExcel || !excelPreviewData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer border-0 shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {importingExcel ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Uploading & Syncing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirm & Live Sync Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

