import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { useWishlist }           from '../context/WishlistContext';
import { useCart }               from '../context/CartContext';
import { useToast }              from '../context/ToastContext';
import { useAuth }               from '../context/AuthContext';
import { formatPrice, getProductImageSmart, isOnSale } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { addToast }            = useToast();
  const { isAuthenticated }     = useAuth();

  // Safe access
  const products = Array.isArray(wishlist?.products) ? wishlist.products : [];

  const handleMoveToCart = async (productId) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const res = await addToCart(productId, 1);
    if (res.success) {
      addToast('Moved to cart!', 'success');
      openCart();
    } else if (!res.needAuth) {
      addToast(res.message || 'Error.', 'error');
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromWishlist(productId);
    if (res?.success) addToast('Removed from wishlist.', 'info');
    else if (res) addToast(res.message || 'Error.', 'error');
  };

  if (wishlistLoading) return <LoadingSpinner />;

  const G      = '#d4af37';
  const C1     = '#111111';
  const C2     = '#1a1a1a';
  const border = '#252525';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', paddingTop: 96, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: G, fontSize: 11, letterSpacing: 3, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
            Saved Items
          </p>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif' }}>
            My Wishlist
            {products.length > 0 && (
              <span style={{ color: '#555', fontSize: 18, fontWeight: 400, marginLeft: 10 }}>
                ({products.length})
              </span>
            )}
          </h1>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={FiHeart}
            title="Your wishlist is empty"
            description="Save watches you love and come back for them anytime."
            actionLabel="Discover Watches"
            actionTo="/products"
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {products.map((product) => {
              // Guard against null/undefined products
              if (!product || !product._id) return null;

              const onSale    = isOnSale(product);
              const imgSrc    = getProductImageSmart(product);
              const inStock   = product.stock > 0;

              return (
                <div
                  key={product._id}
                  style={{
                    background:    C1,
                    border:        `1px solid ${border}`,
                    borderRadius:  16,
                    overflow:      'hidden',
                    transition:    'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = border;
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: C2 }}>
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={imgSrc}
                        alt={product.name || 'Product'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                      />
                    </Link>

                    {/* Heart (remove) button */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <AiFillHeart size={14} color={G} />
                    </button>

                    {/* Discount badge */}
                    {onSale && product.discount > 0 && (
                      <div style={{
                        position: 'absolute', top: 8, left: 8,
                        background: '#ef4444', color: '#fff',
                        fontSize: 9, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 20,
                      }}>
                        -{product.discount}%
                      </div>
                    )}

                    {!inStock && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          background: 'rgba(239,68,68,0.8)', color: '#fff',
                          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8,
                        }}>
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '12px 14px' }}>
                    {product.category?.name && (
                      <p style={{ color: G, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                        {product.category.name}
                      </p>
                    )}

                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>
                        {product.name || 'Unknown Product'}
                      </p>
                    </Link>

                    {/* Price */}
                    <div style={{ marginBottom: 10 }}>
                      {(() => {
                        const finalPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
                        const showDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
                        return showDiscount ? (
                          <>
                            <span style={{ color: G, fontSize: 14, fontWeight: 700 }}>
                              {formatPrice(finalPrice)}
                            </span>
                            <span style={{ color: '#555', fontSize: 11, textDecoration: 'line-through', marginLeft: 6 }}>
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: G, fontSize: 14, fontWeight: 700 }}>
                            {formatPrice(finalPrice)}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleMoveToCart(product._id)}
                        disabled={!inStock}
                        style={{
                          flex: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          background: inStock ? G : '#2a2a2a',
                          color: inStock ? '#000' : '#555',
                          border: 'none', borderRadius: 8,
                          padding: '8px 0', fontSize: 11, fontWeight: 700,
                          cursor: inStock ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <FiShoppingCart size={12} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        style={{
                          width: 34, height: 34,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 8, cursor: 'pointer',
                          color: '#ef4444', flexShrink: 0,
                        }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}