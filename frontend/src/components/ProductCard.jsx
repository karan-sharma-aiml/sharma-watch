import React, { useState } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { FiShoppingCart, FiEye }       from 'react-icons/fi';
import {
  formatPrice,
  getMainProductImage,
  isOnSale,
} from '../utils/helpers';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast }    from '../context/ToastContext';
import { useAuth }     from '../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate            = useNavigate();
  const { addToCart, openCart }          = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast }        = useToast();
  const { isAuthenticated } = useAuth();

  const [addingCart,   setAddingCart]   = useState(false);
  const [togglingWish, setTogglingWish] = useState(false);
  const [imgHovered,   setImgHovered]   = useState(false);
  const [hovered,     setHovered]     = useState(false);

  const inWishlist   = isInWishlist(product._id);
  const inStock      = product.stock > 0;
  const onSale       = isOnSale(product);
  const imgSrc       = getMainProductImage(product.images);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!inStock) return;
    setAddingCart(true);
    const res = await addToCart(product._id, 1);
    if (res.success)        { addToast('Added to cart!', 'success'); openCart(); }
    else if (res.needAuth)  { navigate('/login'); }
    else                    { addToast(res.message || 'Error adding to cart.', 'error'); }
    setAddingCart(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setTogglingWish(true);
    const res = await toggleWishlist(product._id);
    if (res.success) {
      addToast(
        inWishlist ? 'Removed from wishlist.' : 'Added to wishlist!',
        inWishlist ? 'info' : 'success'
      );
    }
    setTogglingWish(false);
  };

  const containerStyle = {
    background: '#111',
    border: hovered ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(255,255,255,0.05)',
    boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1)' : '0 4px 24px rgba(0,0,0,0.3)',
    transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* ── Image container ─────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '1', background: '#0d0d0d' }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80';
            }}
            className="w-full h-full object-cover"
            style={{
              transform:  imgHovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        </Link>

        {/* Dark gradient — bottom of image for badge readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
        />

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={togglingWish}
          className="absolute top-3 right-3 z-10 transition-all duration-200"
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background:   inWishlist ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.55)',
            border:       inWishlist ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.12)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = inWishlist ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.55)'; }}
        >
          {inWishlist
            ? <AiFillHeart  color="#d4af37" size={15} />
            : <AiOutlineHeart color="#999" size={15} />
          }
        </button>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {onSale && product.discount > 0 && (
            <span
              className="text-white font-bold leading-none"
              style={{ background: '#dc2626', fontSize: 10, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.03em' }}
            >
              -{product.discount}%
            </span>
          )}
          {!onSale && product.isBestSeller && (
            <span
              className="text-black font-bold leading-none"
              style={{ background: '#d4af37', fontSize: 10, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.03em' }}
            >
              BESTSELLER
            </span>
          )}
          {!onSale && !product.isBestSeller && product.isNewArrival && (
            <span
              className="text-white font-bold leading-none"
              style={{ background: '#16a34a', fontSize: 10, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.03em' }}
            >
              NEW
            </span>
          )}
        </div>

        {/* Quick actions overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300"
          style={{ opacity: imgHovered ? 1 : 0, background: 'rgba(0,0,0,0.25)' }}
        >
          <Link
            to={`/products/${product._id}`}
            className="flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border:     '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
            }}
          >
            <FiEye size={15} />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingCart}
            className="flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: inStock ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)',
              border:     inStock ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: inStock ? '#d4af37' : '#666',
              cursor: !inStock || addingCart ? 'not-allowed' : 'pointer',
            }}
          >
            <FiShoppingCart size={15} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {!inStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <span
              className="text-white font-bold text-xs"
              style={{ background: 'rgba(220,38,38,0.85)', padding: '5px 14px', borderRadius: 8, letterSpacing: '0.05em' }}
            >
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Low stock */}
        {inStock && product.stock <= 5 && (
          <div
            className="absolute bottom-3 left-3 text-white font-medium"
            style={{ background: 'rgba(234,88,12,0.85)', fontSize: 10, padding: '3px 8px', borderRadius: 20 }}
          >
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* ── Info ────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Category */}
        {product.category?.name && (
          <p
            className="text-gold-500 font-semibold uppercase tracking-wider mb-1.5"
            style={{ fontSize: 9, letterSpacing: '0.15em' }}
          >
            {product.category.name}
          </p>
        )}

        {/* Product name */}
        <Link to={`/products/${product._id}`} className="flex-1 mb-4">
          <h3
            className="text-white font-medium leading-snug line-clamp-2 hover:text-gold-300 transition-colors duration-200"
            style={{ fontSize: 13 }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price + Add to cart */}
        <div className="flex items-end justify-between gap-2 mt-auto">

          {/* Price block */}
          <div>
            {onSale ? (
              <>
                <p
                  className="text-gradient-gold font-bold leading-none"
                  style={{ fontSize: 15 }}
                >
                  {formatPrice(product.salePrice)}
                </p>
                <p
                  className="text-gray-600 line-through mt-1"
                  style={{ fontSize: 11 }}
                >
                  {formatPrice(product.price)}
                </p>
              </>
            ) : (
              <p
                className="text-gradient-gold font-bold leading-none"
                style={{ fontSize: 15 }}
              >
                {formatPrice(product.price)}
              </p>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingCart}
            className="flex items-center gap-1.5 font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:   inStock ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)',
              border:       inStock ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.08)',
              color:        inStock ? '#d4af37' : '#555',
              padding:      '7px 12px',
              borderRadius: 10,
              fontSize:     11,
              cursor:       !inStock || addingCart ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (inStock && !addingCart) {
                e.currentTarget.style.background = '#d4af37';
                e.currentTarget.style.color      = '#000';
                e.currentTarget.style.border     = '1px solid #d4af37';
              }
            }}
            onMouseLeave={(e) => {
              if (inStock) {
                e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
                e.currentTarget.style.color      = '#d4af37';
                e.currentTarget.style.border     = '1px solid rgba(212,175,55,0.25)';
              }
            }}
          >
            <FiShoppingCart size={11} />
            {addingCart ? 'Adding…' : 'Add'}
          </button>
        </div>

        {/* Delivery badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span
            className="text-gray-500"
            style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            🚚 Free Delivery
          </span>
          <span
            className="text-gray-500"
            style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            ✔ 100% Original
          </span>
        </div>
      </div>
    </div>
  );
}