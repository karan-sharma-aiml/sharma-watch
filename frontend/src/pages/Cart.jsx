import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag, FiTrash2, FiPlus, FiMinus,
  FiArrowLeft, FiTruck, FiZap,
} from 'react-icons/fi';
import { useCart }   from '../context/CartContext';
import { useToast }  from '../context/ToastContext';
import { useAuth }   from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  formatPrice, getProductImageSmart,
  calculateOrderTotal, FREE_SHIPPING_ABOVE, STANDARD_SHIPPING, EXPRESS_SURCHARGE,
} from '../utils/helpers';
import EmptyState     from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SupportCard    from '../components/SupportCard';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateCart, removeFromCart, fetchCart, loading } = useCart();
  const { addToast }        = useToast();
  const { isAuthenticated, user } = useAuth();

  const [placingOrder,  setPlacingOrder]  = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [isExpress,     setIsExpress]     = useState(false);
  const [lastOrderNum,  setLastOrderNum]  = useState(null);
  const [orderSuccess,  setOrderSuccess]  = useState(false);

  const [address, setAddress] = useState({
    street:   user?.address?.street   || '',
    city:     user?.address?.city     || '',
    district: user?.address?.district || '',
    province: user?.address?.province || '',
    country:  user?.address?.country  || 'Nepal',
    pincode:  user?.address?.pincode  || '',
    phone:    user?.phone             || '',
  });

  const items = cart.items || [];

  // ── Calculate totals ────────────────────────────
  const subtotal = items.reduce((sum, item) => {
    const p = item.product;
    if (!p) return sum;
    const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
    return sum + (price * item.quantity);
  }, 0);

  const { shipping, express, total } = calculateOrderTotal(subtotal, isExpress);
  const isFreeShipping = shipping === 0;

  const handleUpdate = async (productId, qty) => {
    if (qty < 1) return;
    const res = await updateCart(productId, qty);
    if (!res.success) addToast(res.message, 'error');
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (res.success) addToast('Item removed.', 'info');
    else addToast(res.message, 'error');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }

    setPlacingOrder(true);
    try {
      const orderItems = items.map((i) => ({
        product:  i.product._id,
        quantity: i.quantity,
      }));

      const { data } = await ordersAPI.create({
        items:           orderItems,
        shippingAddress: address,
        deliveryType:    isExpress ? 'express' : 'standard',
      });

      await fetchCart();
      setLastOrderNum(data.data.order.orderNumber);
      setOrderSuccess(true);
      setShowForm(false);
      addToast('Order placed successfully! 🎉', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Order failed.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const G      = '#d4af37';
  const bg     = '#080808';
  const C1     = '#111111';
  const C2     = '#1a1a1a';
  const border = '#252525';

  const inputStyle = {
    width: '100%', background: C2, border: `1px solid ${border}`,
    borderRadius: 10, padding: '10px 12px', color: '#fff',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', color: '#888', fontSize: 11,
    fontWeight: 600, marginBottom: 5, letterSpacing: 0.5,
  };

  // ── Order Success Screen ──────────────────────────
  if (orderSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: bg, paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 32,
          }}>
            ✅
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
            Order Placed!
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
            Your order has been received and is being processed.
          </p>
          {lastOrderNum && (
            <div style={{
              background: C2, border: `1px solid ${border}`,
              borderRadius: 10, padding: '10px 16px', marginBottom: 24, display: 'inline-block',
            }}>
              <p style={{ color: '#888', fontSize: 11, margin: '0 0 2px' }}>Order Number</p>
              <p style={{ color: G, fontWeight: 700, fontSize: 16, margin: 0 }}>{lastOrderNum}</p>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <SupportCard orderId={lastOrderNum} compact />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link
              to="/profile"
              style={{
                background: G, color: '#000', textDecoration: 'none',
                padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 13,
              }}
            >
              Track Order
            </Link>
            <Link
              to="/products"
              style={{
                background: C2, color: '#ccc', textDecoration: 'none',
                padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 13,
                border: `1px solid ${border}`,
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingTop: 96, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Link to="/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#666', fontSize: 13, textDecoration: 'none', marginBottom: 16,
          }}>
            <FiArrowLeft size={14} /> Continue Shopping
          </Link>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif' }}>
            Shopping Cart
            {items.length > 0 && (
              <span style={{ color: '#555', fontSize: 18, fontWeight: 400, marginLeft: 10 }}>
                ({items.length})
              </span>
            )}
          </h1>
        </div>

        {loading && items.length === 0 ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            description="Add some watches to your cart."
            actionLabel="Browse Collection"
            actionTo="/products"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => {
                const p = item.product;
                if (!p) return null;
                const imgSrc    = getProductImageSmart(p);
                const itemPrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;

                return (
                  <div key={p._id} style={{
                    display:      'flex',
                    gap:          16,
                    padding:      16,
                    background:   C1,
                    border:       `1px solid ${border}`,
                    borderRadius: 16,
                  }}>
                    <Link to={`/products/${p._id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80'; }}
                        style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                      />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <Link to={`/products/${p._id}`} style={{ textDecoration: 'none' }}>
                          <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 3 }}>
                            {p.name}
                          </p>
                        </Link>
                        {p.brand && (
                          <p style={{ color: '#666', fontSize: 11, marginBottom: 0 }}>{p.brand}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        {/* Qty Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
                          <button
                            onClick={() => handleUpdate(p._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#888', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.4 : 1 }}
                          >
                            <FiMinus size={12} />
                          </button>
                          <span style={{ width: 32, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdate(p._id, item.quantity + 1)}
                            disabled={item.quantity >= (p.stock || 99)}
                            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#888', cursor: item.quantity >= p.stock ? 'not-allowed' : 'pointer', opacity: item.quantity >= p.stock ? 0.4 : 1 }}
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: G, fontSize: 15, fontWeight: 700 }}>
                            {formatPrice(itemPrice * item.quantity)}
                          </span>
                          <button
                            onClick={() => handleRemove(p._id)}
                            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Delivery Type */}
              <div style={{ background: C1, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}>
                <p style={{ color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  Delivery Type
                </p>

                {/* Standard */}
                <button
                  onClick={() => setIsExpress(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', background: !isExpress ? 'rgba(212,175,55,0.08)' : 'transparent',
                    border: `1px solid ${!isExpress ? 'rgba(212,175,55,0.3)' : border}`,
                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer', marginBottom: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <FiTruck size={16} color={!isExpress ? G : '#555'} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ color: !isExpress ? '#fff' : '#888', fontSize: 13, fontWeight: 600, margin: 0 }}>
                      Standard Delivery
                    </p>
                    <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
                      {subtotal >= FREE_SHIPPING_ABOVE ? 'FREE' : `NPR ${STANDARD_SHIPPING}`} · 3–5 days
                    </p>
                  </div>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${!isExpress ? G : border}`,
                    background: !isExpress ? G : 'transparent',
                    flexShrink: 0,
                  }} />
                </button>

                {/* Express */}
                <button
                  onClick={() => setIsExpress(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', background: isExpress ? 'rgba(212,175,55,0.08)' : 'transparent',
                    border: `1px solid ${isExpress ? 'rgba(212,175,55,0.3)' : border}`,
                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <FiZap size={16} color={isExpress ? G : '#555'} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ color: isExpress ? '#fff' : '#888', fontSize: 13, fontWeight: 600, margin: 0 }}>
                      Express Delivery
                    </p>
                    <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
                      +NPR {EXPRESS_SURCHARGE} · 1–2 days
                    </p>
                  </div>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${isExpress ? G : border}`,
                    background: isExpress ? G : 'transparent',
                    flexShrink: 0,
                  }} />
                </button>
              </div>

              {/* Price Summary */}
              <div style={{ background: C1, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}>
                <p style={{ color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                  Order Summary
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888', fontSize: 13 }}>Subtotal</span>
                    <span style={{ color: '#fff', fontSize: 13 }}>{formatPrice(subtotal)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888', fontSize: 13 }}>Shipping</span>
                    {isFreeShipping
                      ? <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>FREE</span>
                      : <span style={{ color: '#fff', fontSize: 13 }}>{formatPrice(shipping)}</span>
                    }
                  </div>

                  {isExpress && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888', fontSize: 13 }}>Express ⚡</span>
                      <span style={{ color: '#fff', fontSize: 13 }}>{formatPrice(express)}</span>
                    </div>
                  )}

                  {!isFreeShipping && (
                    <div style={{
                      background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.1)',
                      borderRadius: 8, padding: '6px 10px',
                    }}>
                      <p style={{ color: '#888', fontSize: 10, margin: 0 }}>
                        Add {formatPrice(FREE_SHIPPING_ABOVE - subtotal)} more for FREE shipping
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Total</span>
                  <span style={{ color: G, fontWeight: 800, fontSize: 18 }}>{formatPrice(total)}</span>
                </div>

                {/* Checkout */}
                {!showForm ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { navigate('/login'); return; }
                      setShowForm(true);
                    }}
                    style={{
                      width: '100%', background: G, color: '#000', border: 'none',
                      padding: '13px', borderRadius: 12, fontWeight: 700,
                      fontSize: 14, cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                ) : (
                  <form onSubmit={handlePlaceOrder}>
                    <p style={{ color: G, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                      Delivery Details
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {[
                        { key: 'phone',    label: 'Phone',    placeholder: '+977-98XXXXXXXX' },
                        { key: 'street',   label: 'Street',   placeholder: 'Street / Area' },
                        { key: 'city',     label: 'City',     placeholder: 'City' },
                        { key: 'district', label: 'District', placeholder: 'District' },
                        { key: 'province', label: 'Province', placeholder: 'Province (1–7)' },
                        { key: 'pincode',  label: 'Postal',   placeholder: 'Postal Code' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label style={labelStyle}>{label}</label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={address[key]}
                            onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                            style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = G; }}
                            onBlur={(e) => { e.target.style.borderColor = border; }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={placingOrder}
                      style={{
                        width: '100%', background: G, color: '#000', border: 'none',
                        padding: '13px', borderRadius: 12, fontWeight: 700,
                        fontSize: 14, cursor: placingOrder ? 'not-allowed' : 'pointer',
                        opacity: placingOrder ? 0.7 : 1, marginBottom: 8,
                      }}
                    >
                      {placingOrder ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      style={{ width: '100%', background: 'none', border: 'none', color: '#666', fontSize: 12, cursor: 'pointer', padding: 4 }}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {/* Support Card */}
              <SupportCard compact />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}