import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX,
  FiFilter, FiChevronDown, FiEye, FiEyeOff,
  FiPackage, FiAlertTriangle, FiCheckSquare, FiSquare,
} from 'react-icons/fi';
import { MdStar, MdNewReleases, MdTrendingUp, MdLocalOffer } from 'react-icons/md';
import { productsAPI, categoriesAPI } from '../../services/api';
import { formatPrice }   from '../../utils/helpers';
import { useToast }      from '../../context/ToastContext';
import LoadingSpinner    from '../../components/LoadingSpinner';
import Pagination        from '../../components/Pagination';
import ImageUploader     from '../../components/ImageUploader';

// ── Color helpers ─────────────────────────────────
const G = '#d4af37';
const GA = 'rgba(212,175,55,0.12)';
const C1 = '#111111';
const C2 = '#1a1a1a';
const C3 = '#252525';

const statusColors = {
  active:       { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  draft:        { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  hidden:       { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af', border: 'rgba(156,163,175,0.25)' },
  out_of_stock: { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
};

const stockColors = (stock) => {
  if (stock === 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  if (stock <= 5)  return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
  return                  { color: '#34d399', bg: 'rgba(52,211,153,0.1)' };
};

// ── Empty product form ─────────────────────────────
const emptyForm = () => ({
  name: '', brand: '', category: '', sku: '',
  description: '', shortDescription: '',
  price: '', salePrice: '', isSaleActive: false,
  stock: '', lowStockThreshold: 5, allowBackorder: false,
  images: [],
  specifications: {
    movementType: '', caseDiameter: '', caseThickness: '',
    caseMaterial: '', dialColor: '', crystalType: '',
    strapMaterial: '', strapWidth: '', waterResistance: '',
    powerReserve: '', weight: '', warranty: '1 Year',
    madeIn: '', functions: [],
  },
  gender: 'Unisex', tags: '',
  isBestSeller: false, isFeatured: false,
  isNewArrival: false, isTrending: false, isFlashSale: false,
  status: 'draft',
  seo: { metaTitle: '', metaDescription: '' },
});

// ── Toggle Switch ──────────────────────────────────
function Toggle({ checked, onChange, label, color = G }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, position: 'relative',
          background: checked ? color : '#333',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: 3, left: checked ? 21 : 3,
          width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
      {label && <span style={{ color: '#ccc', fontSize: 12 }}>{label}</span>}
    </label>
  );
}

// ── Section Header ─────────────────────────────────
function SectionTitle({ title, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingBottom: 12, marginBottom: 16,
      borderBottom: `1px solid ${C3}`,
    }}>
      {Icon && <Icon size={16} color={G} />}
      <h3 style={{ color: G, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </h3>
    </div>
  );
}

// ── Input ──────────────────────────────────────────
function Input({ label, required, ...props }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%', background: C2, border: `1px solid ${C3}`,
          borderRadius: 10, padding: '10px 12px', color: '#fff',
          fontSize: 13, outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={(e)  => e.target.style.borderColor = G}
        onBlur={(e)   => e.target.style.borderColor = C3}
      />
    </div>
  );
}

function Select({ label, children, required, ...props }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%', background: C2, border: `1px solid ${C3}`,
          borderRadius: 10, padding: '10px 12px', color: '#fff',
          fontSize: 13, outline: 'none', cursor: 'pointer',
          boxSizing: 'border-box',
        }}
        onFocus={(e)  => e.target.style.borderColor = G}
        onBlur={(e)   => e.target.style.borderColor = C3}
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, rows = 3, ...props }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        style={{
          width: '100%', background: C2, border: `1px solid ${C3}`,
          borderRadius: 10, padding: '10px 12px', color: '#fff',
          fontSize: 13, outline: 'none', resize: 'vertical',
          boxSizing: 'border-box',
        }}
        onFocus={(e)  => e.target.style.borderColor = G}
        onBlur={(e)   => e.target.style.borderColor = C3}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────
export default function AdminProducts() {
  const { addToast } = useToast();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  // Filters
  const [search,   setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,     setPage]     = useState(1);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Modal
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [activeTab, setActiveTab] = useState('basic');

  // Deleting
  const [deleting, setDeleting] = useState(null);

  // Load categories once
  useEffect(() => {
    categoriesAPI.getAll()
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search };
      if (catFilter)    params.category = catFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await productsAPI.getAll(params);
      setProducts(data.data.products || []);
      setPagination(data.data.pagination || {});
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Form helpers ──────────────────────────────
  const setField = (path, value) => {
    setForm((prev) => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setActiveTab('basic');
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name:  p.name  || '',
      brand: p.brand || '',
      category: p.category?._id || '',
      sku:  p.sku || '',
      description:      p.description      || '',
      shortDescription: p.shortDescription || '',
      price:     p.price     || '',
      salePrice: p.salePrice || '',
      isSaleActive: p.isSaleActive || false,
      stock:             p.stock             || '',
      lowStockThreshold: p.lowStockThreshold || 5,
      allowBackorder:    p.allowBackorder    || false,
      images: p.images || [],
      specifications: p.specifications || emptyForm().specifications,
      gender: p.gender || 'Unisex',
      tags:   Array.isArray(p.tags) ? p.tags.join(', ') : '',
      isBestSeller: p.isBestSeller || false,
      isFeatured:   p.isFeatured   || false,
      isNewArrival: p.isNewArrival || false,
      isTrending:   p.isTrending   || false,
      isFlashSale:  p.isFlashSale  || false,
      status: p.status || 'draft',
      seo:    p.seo    || { metaTitle: '', metaDescription: '' },
    });
    setActiveTab('basic');
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    { addToast('Product name is required.', 'error');    return; }
    if (!form.brand.trim())   { addToast('Brand is required.', 'error');           return; }
    if (!form.category)       { addToast('Category is required.', 'error');        return; }
    if (!form.price)          { addToast('Price is required.', 'error');           return; }
    if (!form.stock && form.stock !== 0) { addToast('Stock is required.', 'error'); return; }
    if (form.images.length === 0) { addToast('At least 1 image is required.', 'error'); setActiveTab('images'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price:     parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock:     parseInt(form.stock),
        tags:      form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editing) {
        await productsAPI.update(editing, payload);
        addToast('Product updated successfully.', 'success');
      } else {
        await productsAPI.create(payload);
        addToast('Product created successfully.', 'success');
      }
      setModal(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product and all its images?')) return;
    setDeleting(id);
    try {
      await productsAPI.remove(id);
      addToast('Product deleted.', 'info');
      fetchProducts();
    } catch { addToast('Delete failed.', 'error'); }
    finally { setDeleting(null); }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected products?`)) return;
    try {
      await productsAPI.bulkDelete({ ids: Array.from(selected) });
      addToast(`${selected.size} products deleted.`, 'info');
      setSelected(new Set());
      fetchProducts();
    } catch { addToast('Bulk delete failed.', 'error'); }
  };

  const handleBulkStatus = async (status) => {
    if (selected.size === 0) return;
    try {
      await productsAPI.bulkStatus({ ids: Array.from(selected), status });
      addToast(`${selected.size} products updated to "${status}".`, 'success');
      setSelected(new Set());
      fetchProducts();
    } catch { addToast('Update failed.', 'error'); }
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p._id)));
  };

  // ── Modal Tabs ────────────────────────────────
  const tabs = [
    { id: 'basic',   label: 'Basic Info'  },
    { id: 'pricing', label: 'Pricing'     },
    { id: 'images',  label: 'Images'      },
    { id: 'specs',   label: 'Watch Specs' },
    { id: 'flags',   label: 'Visibility'  },
    { id: 'seo',     label: 'SEO'         },
  ];

  const mainImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const main = product.images.find((i) => i.isMain);
    return main ? main.url : product.images[0].url;
  };

  // ─────────────────────────────────────────────────
  return (
    <div style={{ color: '#fff' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Products
          </h1>
          <p style={{ color: '#666', fontSize: 13 }}>
            {pagination.totalProducts || 0} products total
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: G, color: '#000', border: 'none',
            padding: '10px 20px', borderRadius: 12,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
          }}
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 200,
          display: 'flex', alignItems: 'center',
          background: C1, border: `1px solid ${C3}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          <FiSearch size={15} color="#555" style={{ marginLeft: 14, flexShrink: 0 }} />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products, brands, SKU…"
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '11px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', padding: '0 12px', cursor: 'pointer' }}>
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          style={{ background: C1, border: `1px solid ${C3}`, borderRadius: 12, padding: '11px 14px', color: '#ccc', fontSize: 13, outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: C1, border: `1px solid ${C3}`, borderRadius: 12, padding: '11px 14px', color: '#ccc', fontSize: 13, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* ── Bulk Actions ── */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: GA, border: `1px solid rgba(212,175,55,0.3)`,
          borderRadius: 12, padding: '10px 16px', marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: G, fontSize: 13, fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <button onClick={() => handleBulkStatus('active')}
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            → Active
          </button>
          <button onClick={() => handleBulkStatus('draft')}
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            → Draft
          </button>
          <button onClick={() => handleBulkStatus('hidden')}
            style={{ background: 'rgba(156,163,175,0.15)', border: '1px solid rgba(156,163,175,0.3)', color: '#9ca3af', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            → Hidden
          </button>
          <button onClick={handleBulkDelete}
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            Delete All
          </button>
          <button onClick={() => setSelected(new Set())}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginLeft: 'auto' }}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? <LoadingSpinner /> : (
        <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: 16, overflow: 'hidden' }}>
          <div className="lg:hidden" style={{ padding: 18 }}>
            {products.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 14 }}>No products found</div>
            ) : products.map((p) => {
              const sc = stockColors(p.stock);
              const stc = statusColors[p.status] || statusColors.draft;
              const img = mainImage(p);
              return (
                <div key={p._id} style={{ marginBottom: 16, background: '#111111', border: `1px solid ${C3}`, borderRadius: 22, padding: 16, boxShadow: '0 15px 35px rgba(0,0,0,0.35)' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                    <div style={{ width: 62, height: 62, borderRadius: 20, overflow: 'hidden', background: C2, border: `1px solid ${C3}`, flexShrink: 0 }}>
                      {img
                        ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage size={20} color="#444" /></div>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                      <p style={{ color: '#777', fontSize: 12 }}>{p.brand} {p.sku && `· ${p.sku}`}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: '#121212', borderRadius: 16 }}>
                      <span style={{ color: '#888', fontSize: 11 }}>Category</span>
                      <span style={{ color: '#fff', fontSize: 13 }}>{p.category?.name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: '#121212', borderRadius: 16 }}>
                      <span style={{ color: '#888', fontSize: 11 }}>Price</span>
                      <span style={{ color: G, fontSize: 13, fontWeight: 700 }}>{p.salePrice && p.isSaleActive ? formatPrice(p.salePrice) : formatPrice(p.price)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: '#121212', borderRadius: 16 }}>
                      <span style={{ color: '#888', fontSize: 11 }}>Stock</span>
                      <span style={{ background: sc.bg, color: sc.color, padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{p.stock}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: '#121212', borderRadius: 16 }}>
                      <span style={{ color: '#888', fontSize: 11 }}>Status</span>
                      <span style={{ background: stc.bg, color: stc.color, border: `1px solid ${stc.border}`, padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>{p.status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                      {p.isBestSeller && <span style={{ color: '#d4af37', fontSize: 11, background: 'rgba(212,175,55,0.12)', padding: '6px 10px', borderRadius: 999 }}>Best Seller</span>}
                      {p.isFeatured && <span style={{ color: '#60a5fa', fontSize: 11, background: 'rgba(96,165,250,0.12)', padding: '6px 10px', borderRadius: 999 }}>Featured</span>}
                      {p.isNewArrival && <span style={{ color: '#34d399', fontSize: 11, background: 'rgba(52,211,153,0.12)', padding: '6px 10px', borderRadius: 999 }}>New</span>}
                      {p.isTrending && <span style={{ color: '#f472b6', fontSize: 11, background: 'rgba(244,114,182,0.12)', padding: '6px 10px', borderRadius: 999 }}>Trending</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: deleting === p._id ? 0.5 : 1 }}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden lg:block" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C3}` }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>
                    <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
                      {selected.size === products.length && products.length > 0
                        ? <FiCheckSquare size={15} color={G} />
                        : <FiSquare size={15} />
                      }
                    </button>
                  </th>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Flags', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#555', fontSize: 14 }}>
                      No products found
                    </td>
                  </tr>
                ) : products.map((p) => {
                  const sc = stockColors(p.stock);
                  const stc = statusColors[p.status] || statusColors.draft;
                  const img = mainImage(p);

                  return (
                    <tr key={p._id}
                      style={{ borderBottom: `1px solid ${C3}`, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C2}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleSelect(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                          {selected.has(p._id)
                            ? <FiCheckSquare size={15} color={G} />
                            : <FiSquare size={15} color="#444" />
                          }
                        </button>
                      </td>

                      {/* Product */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: C2, border: `1px solid ${C3}`, flexShrink: 0 }}>
                            {img
                              ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage size={18} color="#444" /></div>
                            }
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                              {p.name}
                            </p>
                            <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                              {p.brand} {p.sku && `· ${p.sku}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: '#aaa', fontSize: 12 }}>{p.category?.name || '—'}</span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {p.salePrice && p.isSaleActive ? (
                          <div>
                            <p style={{ color: G, fontSize: 13, fontWeight: 700 }}>{formatPrice(p.salePrice)}</p>
                            <p style={{ color: '#555', fontSize: 11, textDecoration: 'line-through' }}>{formatPrice(p.price)}</p>
                          </div>
                        ) : (
                          <p style={{ color: G, fontSize: 13, fontWeight: 700 }}>{formatPrice(p.price)}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {p.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: stc.bg, color: stc.color, border: `1px solid ${stc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {p.status?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Flags */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {p.isBestSeller  && <MdStar     size={14} color={G}       title="Best Seller"  />}
                          {p.isFeatured    && <MdLocalOffer size={14} color="#60a5fa" title="Featured"    />}
                          {p.isNewArrival  && <MdNewReleases size={14} color="#34d399" title="New Arrival" />}
                          {p.isTrending    && <MdTrendingUp  size={14} color="#f472b6" title="Trending"   />}
                          {!p.isBestSeller && !p.isFeatured && !p.isNewArrival && !p.isTrending && (
                            <span style={{ color: '#444', fontSize: 11 }}>—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)}
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deleting === p._id}
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deleting === p._id ? 0.5 : 1 }}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages   || 1}
        onPageChange={(pg) => { setPage(pg); window.scrollTo({ top: 0 }); }}
      />

      {/* ══════════════════════════════════════════
          PRODUCT MODAL
      ══════════════════════════════════════════ */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, paddingTop: 40 }}>
          {/* Backdrop */}
          <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />

          {/* Modal Box */}
          <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 720,
            background: '#0d0d0d',
            border: `1px solid ${C3}`,
            borderRadius: 24,
            boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '88vh',
            overflow: 'hidden',
          }}>

            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: `1px solid ${C3}`, flexShrink: 0,
            }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
                  {editing ? 'Update product information' : 'Fill in the product details below'}
                </p>
              </div>
              <button onClick={() => setModal(false)} style={{ width: 36, height: 36, borderRadius: 10, background: C2, border: `1px solid ${C3}`, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={16} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 2, padding: '12px 24px', borderBottom: `1px solid ${C3}`, overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                    background: activeTab === t.id ? G : 'transparent',
                    color: activeTab === t.id ? '#000' : '#666',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content — scrollable */}
            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

              {/* ─── BASIC INFO ─── */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <SectionTitle title="Basic Information" icon={FiPackage} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Input label="Product Name" required placeholder="e.g. Royal GMT Prestige"
                      value={form.name} onChange={(e) => setField('name', e.target.value)} />
                    <Input label="Brand" required placeholder="e.g. Sharma Elite"
                      value={form.brand} onChange={(e) => setField('brand', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Select label="Category" required value={form.category} onChange={(e) => setField('category', e.target.value)}>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </Select>
                    <Select label="Gender" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                      {['Men', 'Women', 'Unisex', 'Kids'].map((g) => <option key={g} value={g}>{g}</option>)}
                    </Select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Input label="SKU / Product Code" placeholder="Auto-generated if empty"
                      value={form.sku} onChange={(e) => setField('sku', e.target.value)} />
                    <Select label="Status" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </Select>
                  </div>
                  <Textarea label="Short Description (shown on product cards)" rows={2}
                    placeholder="Brief 1-2 line description…"
                    value={form.shortDescription} onChange={(e) => setField('shortDescription', e.target.value)} />
                  <Textarea label="Full Description" rows={4}
                    placeholder="Detailed product description…"
                    value={form.description} onChange={(e) => setField('description', e.target.value)} />
                  <Input label="Tags (comma separated)" placeholder="luxury, automatic, swiss, gift"
                    value={form.tags} onChange={(e) => setField('tags', e.target.value)} />
                </div>
              )}

              {/* ─── PRICING ─── */}
              {activeTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <SectionTitle title="Pricing & Inventory" icon={FiPackage} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Input label="Original Price (NPR)" required type="number" min="0" placeholder="485000"
                      value={form.price} onChange={(e) => setField('price', e.target.value)} />
                    <Input label="Sale Price (NPR)" type="number" min="0" placeholder="Optional"
                      value={form.salePrice} onChange={(e) => setField('salePrice', e.target.value)} />
                  </div>

                  {/* Sale active toggle */}
                  <div style={{ background: C2, borderRadius: 12, padding: 16, border: `1px solid ${C3}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Sale Active</p>
                      <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>Show sale price on website</p>
                    </div>
                    <Toggle checked={form.isSaleActive} onChange={(v) => setField('isSaleActive', v)} />
                  </div>

                  {form.price && form.salePrice && (
                    <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 16 }}>
                      <div>
                        <p style={{ color: '#666', fontSize: 11 }}>Discount</p>
                        <p style={{ color: '#34d399', fontWeight: 700, fontSize: 18 }}>
                          {Math.round(((form.price - form.salePrice) / form.price) * 100)}% OFF
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: 11 }}>Savings</p>
                        <p style={{ color: '#34d399', fontWeight: 700, fontSize: 18 }}>
                          {formatPrice(form.price - form.salePrice)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <Input label="Stock Quantity" required type="number" min="0" placeholder="50"
                      value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
                    <Input label="Low Stock Alert" type="number" min="0" placeholder="5"
                      value={form.lowStockThreshold} onChange={(e) => setField('lowStockThreshold', e.target.value)} />
                  </div>

                  <div style={{ background: C2, borderRadius: 12, padding: 16, border: `1px solid ${C3}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Allow Backorder</p>
                      <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>Accept orders when out of stock</p>
                    </div>
                    <Toggle checked={form.allowBackorder} onChange={(v) => setField('allowBackorder', v)} />
                  </div>
                </div>
              )}

              {/* ─── IMAGES ─── */}
              {activeTab === 'images' && (
                <div>
                  <SectionTitle title="Product Images" icon={FiPackage} />
                  <div style={{ background: C2, borderRadius: 12, padding: 14, border: `1px solid ${C3}`, marginBottom: 16 }}>
                    <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6 }}>
                      • Max <strong style={{ color: '#fff' }}>5 images</strong> — JPG, PNG, WebP — Max 5MB each<br />
                      • <strong style={{ color: G }}>First image / star marked</strong> = main product image<br />
                      • <strong style={{ color: '#fff' }}>Drag</strong> to reorder images<br />
                      • Images stored on <strong style={{ color: '#60a5fa' }}>Cloudinary</strong> — NOT in MongoDB
                    </p>
                  </div>
                  <ImageUploader
                    images={form.images}
                    onChange={(imgs) => setField('images', imgs)}
                    maxImages={5}
                  />
                </div>
              )}

              {/* ─── WATCH SPECS ─── */}
              {activeTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SectionTitle title="Watch Specifications" icon={FiPackage} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Select label="Movement Type"
                      value={form.specifications.movementType}
                      onChange={(e) => setField('specifications.movementType', e.target.value)}>
                      <option value="">Select</option>
                      {['Automatic', 'Manual', 'Quartz', 'Solar', 'Kinetic', 'Smart'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                    <Select label="Crystal Type"
                      value={form.specifications.crystalType}
                      onChange={(e) => setField('specifications.crystalType', e.target.value)}>
                      <option value="">Select</option>
                      {['Sapphire', 'Mineral', 'Acrylic'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                    <Input label="Case Diameter" placeholder="e.g. 42mm"
                      value={form.specifications.caseDiameter}
                      onChange={(e) => setField('specifications.caseDiameter', e.target.value)} />
                    <Input label="Case Thickness" placeholder="e.g. 11mm"
                      value={form.specifications.caseThickness}
                      onChange={(e) => setField('specifications.caseThickness', e.target.value)} />
                    <Input label="Case Material" placeholder="e.g. Stainless Steel"
                      value={form.specifications.caseMaterial}
                      onChange={(e) => setField('specifications.caseMaterial', e.target.value)} />
                    <Input label="Dial Color" placeholder="e.g. Black Sunray"
                      value={form.specifications.dialColor}
                      onChange={(e) => setField('specifications.dialColor', e.target.value)} />
                    <Input label="Strap Material" placeholder="e.g. Leather, Mesh"
                      value={form.specifications.strapMaterial}
                      onChange={(e) => setField('specifications.strapMaterial', e.target.value)} />
                    <Input label="Strap Width" placeholder="e.g. 20mm"
                      value={form.specifications.strapWidth}
                      onChange={(e) => setField('specifications.strapWidth', e.target.value)} />
                    <Input label="Water Resistance" placeholder="e.g. 100m / 10ATM"
                      value={form.specifications.waterResistance}
                      onChange={(e) => setField('specifications.waterResistance', e.target.value)} />
                    <Input label="Power Reserve" placeholder="e.g. 42 hours"
                      value={form.specifications.powerReserve}
                      onChange={(e) => setField('specifications.powerReserve', e.target.value)} />
                    <Input label="Weight" placeholder="e.g. 150g"
                      value={form.specifications.weight}
                      onChange={(e) => setField('specifications.weight', e.target.value)} />
                    <Input label="Made In" placeholder="e.g. Switzerland, Japan"
                      value={form.specifications.madeIn}
                      onChange={(e) => setField('specifications.madeIn', e.target.value)} />
                    <Input label="Warranty" placeholder="e.g. 1 Year"
                      value={form.specifications.warranty}
                      onChange={(e) => setField('specifications.warranty', e.target.value)} />
                  </div>
                </div>
              )}

              {/* ─── VISIBILITY ─── */}
              {activeTab === 'flags' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle title="Product Visibility & Flags" icon={FiEye} />
                  {[
                    { key: 'isBestSeller', label: 'Best Seller',  desc: 'Show in Best Sellers section',      color: G       },
                    { key: 'isFeatured',   label: 'Featured',     desc: 'Show in Featured Products section',  color: '#60a5fa' },
                    { key: 'isNewArrival', label: 'New Arrival',  desc: 'Show in New Arrivals section',       color: '#34d399' },
                    { key: 'isTrending',   label: 'Trending',     desc: 'Show in Trending section',           color: '#f472b6' },
                    { key: 'isFlashSale',  label: 'Flash Sale',   desc: 'Show in Flash Sale section',         color: '#fb923c' },
                  ].map(({ key, label, desc, color }) => (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: C2, borderRadius: 12, padding: '14px 16px',
                      border: form[key] ? `1px solid ${color}40` : `1px solid ${C3}`,
                    }}>
                      <div>
                        <p style={{ color: form[key] ? color : '#fff', fontSize: 13, fontWeight: 600 }}>{label}</p>
                        <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{desc}</p>
                      </div>
                      <Toggle checked={form[key]} onChange={(v) => setField(key, v)} color={color} />
                    </div>
                  ))}
                </div>
              )}

              {/* ─── SEO ─── */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SectionTitle title="SEO & Meta" icon={FiPackage} />
                  <Input label="Meta Title (max 70 chars)"
                    placeholder={form.name || 'Product meta title'}
                    maxLength={70}
                    value={form.seo.metaTitle}
                    onChange={(e) => setField('seo.metaTitle', e.target.value)} />
                  <p style={{ color: '#555', fontSize: 11, marginTop: -8 }}>
                    {form.seo.metaTitle.length}/70 characters
                  </p>
                  <Textarea label="Meta Description (max 160 chars)" rows={3}
                    placeholder="Brief SEO description for search engines…"
                    maxLength={160}
                    value={form.seo.metaDescription}
                    onChange={(e) => setField('seo.metaDescription', e.target.value)} />
                  <p style={{ color: '#555', fontSize: 11, marginTop: -8 }}>
                    {form.seo.metaDescription.length}/160 characters
                  </p>
                  <div style={{ background: C2, borderRadius: 12, padding: 16, border: `1px solid ${C3}` }}>
                    <p style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>Search Preview</p>
                    <p style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600 }}>
                      {form.seo.metaTitle || form.name || 'Product Name'} — Sharma Watch Store
                    </p>
                    <p style={{ color: '#34d399', fontSize: 11, marginTop: 2 }}>
                      sharmawatch.com/products/{form.name?.toLowerCase().replace(/\s+/g, '-') || 'product-name'}
                    </p>
                    <p style={{ color: '#aaa', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                      {form.seo.metaDescription || form.shortDescription || 'Product description will appear here in search results.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── Footer Buttons ─── */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 20, marginTop: 20, borderTop: `1px solid ${C3}` }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ flex: 1, padding: '12px', border: `1px solid ${C3}`, background: 'transparent', color: '#888', borderRadius: 12, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="button"
                  onClick={() => { setField('status', 'draft'); handleSave({ preventDefault: () => {} }); }}
                  disabled={saving}
                  style={{ flex: 1, padding: '12px', border: `1px solid ${C3}`, background: C2, color: '#ccc', borderRadius: 12, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Save as Draft
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, padding: '12px', background: G, color: '#000', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}>
                  {saving ? 'Saving…' : editing ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}