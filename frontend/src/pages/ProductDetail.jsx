import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiMinus, FiPlus,
  FiArrowLeft, FiCheck, FiPackage, FiShield,
  FiTruck, FiAward,
} from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { productsAPI }  from '../services/api';
import ProductCard      from '../components/ProductCard';
import LoadingSpinner   from '../components/LoadingSpinner';
import {
  formatPrice,
  getMainProductImage,  // ← FIXED
  isOnSale,
} from '../utils/helpers';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast }    from '../context/ToastContext';
import { useAuth }     from '../context/AuthContext';

export default function ProductDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuthenticated }             = useAuth();
  const { addToCart, openCart }         = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast }                    = useToast();

  const [product,      setProduct]      = useState(null);
  const [related,      setRelated]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [qty,          setQty]          = useState(1);
  const [addingCart,   setAddingCart]   = useState(false);
  const [togglingWish, setTogglingWish] = useState(false);

  // For gallery: which image is currently displayed
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    productsAPI.getById(id)
      .then(async ({ data }) => {
        const p = data.data.product;
        setProduct(p);
        setQty(1);
        setActiveImage(0);

        if (p.category?._id) {
          productsAPI.getAll({ category: p.category._id, limit: 4 })
            .then(({ data: d }) =>
              setRelated((d.data.products || []).filter((r) => r._id !== id))
            )
            .catch(() => {});
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingCart(true);
    const res = await addToCart(product._id, qty);
    if (res.success) { addToast('Added to cart!', 'success'); openCart(); }
    else if (res.needAuth) { navigate('/login'); }
    else { addToast(res.message || 'Error.', 'error'); }
    setAddingCart(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setTogglingWish(true);
    const inW = isInWishlist(product._id);
    const res = await toggleWishlist(product._id);
    if (res.success) {
      addToast(
        inW ? 'Removed from wishlist.' : 'Added to wishlist!',
        inW ? 'info' : 'success'
      );
    }
    setTogglingWish(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const inStock    = product.stock > 0;
  const onSale     = isOnSale(product);

  // ── FIXED: Read from images[] array ─────────────
  const images = product.images && product.images.length > 0
    ? product.images
    : null;

  // Currently displayed image
  const currentImageSrc = images
    ? (images[activeImage]?.url || getMainProductImage(images))
    : getMainProductImage([]);

  // Watch specs to display
  const specs = product.specifications;
  const hasSpecs = specs && Object.values(specs).some((v) =>
    v && v !== '' && !Array.isArray(v)
  );

  return (
    <div className="min-h-screen bg-dark-500 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gold-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <FiArrowLeft size={15} /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">

          {/* ── Image Section ──────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-dark-300 border border-white/5">
              <img
                src={currentImageSrc}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />

              {/* Wishlist btn */}
              <button
                onClick={handleWishlist}
                disabled={togglingWish}
                className="absolute top-5 right-5 w-11 h-11 rounded-full bg-dark-500/80 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:border-gold-400/40 transition-all"
              >
                {inWishlist
                  ? <AiFillHeart className="text-gold-400" size={20} />
                  : <FiHeart     className="text-gray-300" size={18} />
                }
              </button>

              {/* Discount badge on image */}
              {onSale && product.discount > 0 && (
                <div className="absolute top-5 left-5 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                  -{product.discount}% OFF
                </div>
              )}

              {!inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-500/90 text-white text-sm font-bold px-5 py-2 rounded-xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* ── FIXED: Gallery thumbnails from images[] ── */}
            {images && images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`
                      w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all
                      ${activeImage === idx
                        ? 'border-gold-400'
                        : 'border-white/10 hover:border-gold-400/40'}
                    `}
                  >
                    <img
                      src={img.url}
                      alt={`View ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Section ───────────────────────── */}
          <div className="flex flex-col">

            {/* Brand + Category */}
            <div className="flex items-center gap-3 mb-3">
              {product.brand && (
                <span className="text-gold-400 text-xs font-semibold tracking-wider uppercase">
                  {product.brand}
                </span>
              )}
              {product.category?.name && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-400 text-xs">{product.category.name}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {['🔥 Best Seller', '⚡ Limited Stock', '🚚 Free Delivery'].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-200 text-xs font-semibold transition-all duration-200 hover:border-gold-400/40 hover:bg-gold-400/10"
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-snug mb-4">
              {product.name}
            </h1>

            {/* ── FIXED: Price display with sale price ── */}
            <div className="flex items-baseline gap-4 mb-2">
              {onSale ? (
                <>
                  {/* Sale price — large and prominent */}
                  <span className="text-gradient-gold font-bold text-4xl">
                    {formatPrice(product.salePrice)}
                  </span>
                  {/* Original price — crossed out */}
                  <span className="text-gray-500 text-xl line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-gradient-gold font-bold text-4xl">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Discount info row */}
            {onSale && product.discount > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {product.discount}% OFF
                </span>
                <span className="text-green-400 text-sm font-medium">
                  You save {formatPrice(product.price - product.salePrice)}
                </span>
              </div>
            )}

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border mb-6 w-fit
              ${inStock
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {inStock ? (
                <><FiCheck size={12} /> In Stock ({product.stock} available)</>
              ) : (
                <><FiPackage size={12} /> Out of Stock</>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Qty Selector */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-12 text-center text-white font-medium text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || addingCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gold-400 text-black font-bold text-sm rounded-xl hover:bg-gold-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold-400/20"
              >
                <FiShoppingCart size={16} />
                {addingCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={handleWishlist}
                disabled={togglingWish}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gold-400/30 text-gold-400 text-sm font-medium rounded-xl hover:bg-gold-400/10 transition-all"
              >
                {inWishlist ? <AiFillHeart size={16} /> : <FiHeart size={16} />}
                {inWishlist ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
              {[
                { icon: FiTruck,   text: 'Free delivery above ₹999' },
                { icon: FiShield,  text: '100% authentic product'   },
                { icon: FiPackage, text: '15-day easy returns'      },
                { icon: FiAward,   text: specs?.warranty || '1 year warranty' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="text-gold-400 shrink-0" size={13} />
                  <span className="text-gray-400 text-xs">{text}</span>
                </div>
              ))}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-gray-600 text-xs mt-4">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>

        {/* ── Watch Specifications ─────────────────── */}
        {hasSpecs && (
          <div className="mb-16">
            <div className="mb-6">
              <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
                Specifications
              </p>
              <h2 className="font-serif text-2xl font-bold text-white">
                Technical Details
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Movement',        value: specs.movementType   },
                { label: 'Case Diameter',   value: specs.caseDiameter   },
                { label: 'Case Thickness',  value: specs.caseThickness  },
                { label: 'Case Material',   value: specs.caseMaterial   },
                { label: 'Dial Color',      value: specs.dialColor      },
                { label: 'Crystal',         value: specs.crystalType    },
                { label: 'Strap Material',  value: specs.strapMaterial  },
                { label: 'Strap Width',     value: specs.strapWidth     },
                { label: 'Water Resistance', value: specs.waterResistance },
                { label: 'Power Reserve',   value: specs.powerReserve   },
                { label: 'Weight',          value: specs.weight         },
                { label: 'Made In',         value: specs.madeIn         },
              ].filter((s) => s.value && s.value !== '').map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3 bg-dark-400 border border-white/5 rounded-xl p-4"
                >
                  <span className="text-gray-500 text-xs">{label}</span>
                  <span className="text-white text-xs font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
                More Like This
              </p>
              <h2 className="font-serif text-2xl font-bold text-white">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}