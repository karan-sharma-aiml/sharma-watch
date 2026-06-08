import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard    from '../components/ProductCard';
import Pagination     from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState     from '../components/EmptyState';
import { FiClock } from 'react-icons/fi';

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First'   },
  { value: 'createdAt-asc',  label: 'Oldest First'   },
  { value: 'price-asc',      label: 'Price: Low → High' },
  { value: 'price-desc',     label: 'Price: High → Low' },
  { value: 'name-asc',       label: 'Name: A → Z'    },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [pagination,  setPagination]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort,     setSort]     = useState('createdAt-desc');
  const [page,     setPage]     = useState(1);
  const [inputVal, setInputVal] = useState(search);

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.data.categories || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, order] = sort.split('-');
      const { data } = await productsAPI.getAll({
        search, category, sortBy, order, page, limit: 12,
      });
      setProducts(data.data.products || []);
      setPagination(data.data.pagination || {});
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal.trim());
    setPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setInputVal(''); setCategory(''); setSort('createdAt-desc'); setPage(1);
  };

  const hasFilters = search || category || sort !== 'createdAt-desc';

  return (
    <div className="min-h-screen bg-dark-500 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
            Our Collection
          </p>
          <h1 className="font-serif text-4xl font-bold text-white">All Watches</h1>
          {pagination.totalProducts !== undefined && (
            <p className="text-gray-500 text-sm mt-1">
              {pagination.totalProducts} timepieces found
            </p>
          )}
        </div>

        {/* Search + Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-dark-400 border border-white/8 rounded-xl overflow-hidden focus-within:border-gold-400/40 transition-colors">
            <FiSearch className="text-gray-500 ml-4 shrink-0" size={16} />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search watches…"
              className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-gray-500 outline-none"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => { setInputVal(''); setSearch(''); setPage(1); }}
                className="px-3 text-gray-500 hover:text-white"
              >
                <FiX size={14} />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-3 bg-gold-400/10 text-gold-400 text-sm font-medium hover:bg-gold-400/20 transition-colors border-l border-white/5"
            >
              Search
            </button>
          </form>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-dark-400 border border-white/8 text-gray-300 text-sm rounded-xl px-4 py-3 pr-8 outline-none focus:border-gold-400/40 transition-colors cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-dark-400">{o.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>

          {/* Filter Toggle (mobile) */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 px-4 py-3 bg-dark-400 border border-white/8 text-gray-300 text-sm rounded-xl hover:border-gold-400/30 hover:text-white transition-colors sm:hidden"
          >
            <FiFilter size={15} />
            Filters
          </button>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 bg-red-400/10 border border-red-400/20 text-red-400 text-sm rounded-xl hover:bg-red-400/20 transition-colors"
            >
              <FiX size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-52 shrink-0`}>
            <div className="bg-dark-400 border border-white/5 rounded-2xl p-5 sticky top-24">
              <h3 className="text-white text-sm font-semibold mb-4">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryChange(cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat._id ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No watches found"
                description="Try adjusting your search or filters."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                <Pagination
                  currentPage={pagination.currentPage || 1}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={(pg) => { setPage(pg); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}