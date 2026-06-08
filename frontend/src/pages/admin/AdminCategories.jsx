import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { categoriesAPI } from '../../services/api';
import { useToast }      from '../../context/ToastContext';
import LoadingSpinner    from '../../components/LoadingSpinner';
import EmptyState        from '../../components/EmptyState';
import { BiCategory }    from 'react-icons/bi';

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const fetch = () => {
    setLoading(true);
    categoriesAPI.getAll()
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (c)  => { setEditing(c._id); setForm({ name: c.name, description: c.description || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast('Category name is required.', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoriesAPI.update(editing, form);
        addToast('Category updated.', 'success');
      } else {
        await categoriesAPI.create(form);
        addToast('Category created.', 'success');
      }
      setModal(false);
      fetch();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      await categoriesAPI.remove(id);
      addToast('Category deleted.', 'info');
      fetch();
    } catch { addToast('Delete failed.', 'error'); }
    finally { setDeleting(null); }
  };

  const inputCls = 'w-full bg-dark-400 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-500 outline-none focus:border-gold-400/50 transition-colors';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-colors"
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={BiCategory}
          title="No categories yet"
          description="Create your first product category."
          actionLabel="Add Category"
          onAction={openCreate}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-dark-300 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                    <BiCategory className="text-gold-400" size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    disabled={deleting === cat._id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors disabled:opacity-40"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-dark-300 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-white">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Men's Watches"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 text-sm rounded-xl hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}