import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUser, FiPackage, FiLogOut, FiMail, FiPhone,
  FiMapPin, FiEdit, FiCheck, FiChevronRight, FiArrowLeft,
} from 'react-icons/fi';
import { ordersAPI, authAPI } from '../services/api';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  formatPrice, formatDate, getStatusColor,
  getProductImageSmart, getWhatsAppOrderLink,
} from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState     from '../components/EmptyState';
import SupportCard    from '../components/SupportCard';

const G      = '#d4af37';
const bg     = '#080808';
const C1     = '#111111';
const C2     = '#1a1a1a';
const border = '#252525';

// ── Status Badge ───────────────────────────────────
function StatusBadge({ status }) {
  const colors = getStatusColor(status);
  return (
    <span style={{
      background: colors.bg, color: colors.color,
      border: `1px solid ${colors.border}`,
      fontSize: 10, fontWeight: 700, padding: '3px 10px',
      borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      {status}
    </span>
  );
}

// ── Order Detail View ──────────────────────────────
function OrderDetail({ order, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none',
          color: '#888', fontSize: 13, cursor: 'pointer',
          marginBottom: 20, padding: 0,
        }}
      >
        <FiArrowLeft size={14} /> Back to Orders
      </button>

      {/* Order Header */}
      <div style={{
        background: C1, border: `1px solid ${border}`,
        borderRadius: 16, padding: 20, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <p style={{ color: '#888', fontSize: 11, margin: '0 0 4px' }}>Order Number</p>
            <p style={{ color: G, fontWeight: 700, fontSize: 16, margin: 0 }}>
              {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Placed On',       value: formatDate(order.createdAt) },
            { label: 'Delivery Type',   value: order.deliveryType === 'express' ? '⚡ Express' : '🚚 Standard' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: '#666', fontSize: 11, margin: '0 0 2px' }}>{label}</p>
              <p style={{ color: '#ccc', fontSize: 13, fontWeight: 500, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{
        background: C1, border: `1px solid ${border}`,
        borderRadius: 16, padding: 16, marginBottom: 16,
      }}>
        <p style={{ color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Items Ordered
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.items.map((item, idx) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img
                  src={getProductImageSmart(p)}
                  alt={p?.name}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80'; }}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: `1px solid ${border}`, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p?.name || 'Product'}
                  </p>
                  <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p style={{ color: G, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div style={{
        background: C1, border: `1px solid ${border}`,
        borderRadius: 16, padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.subtotal !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Subtotal</span>
              <span style={{ color: '#ccc', fontSize: 13 }}>{formatPrice(order.subtotal || order.totalAmount)}</span>
            </div>
          )}
          {order.shippingCharge > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Shipping</span>
              <span style={{ color: '#ccc', fontSize: 13 }}>{formatPrice(order.shippingCharge)}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Shipping</span>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>FREE</span>
            </div>
          )}
          {order.expressCharge > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Express Delivery</span>
              <span style={{ color: '#ccc', fontSize: 13 }}>{formatPrice(order.expressCharge)}</span>
            </div>
          )}
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Total</span>
            <span style={{ color: G, fontWeight: 800, fontSize: 18 }}>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress?.city && (
        <div style={{
          background: C1, border: `1px solid ${border}`,
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <p style={{ color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            Delivery Address
          </p>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {[
              order.shippingAddress.street,
              order.shippingAddress.city,
              order.shippingAddress.district,
              order.shippingAddress.province,
              order.shippingAddress.country,
              order.shippingAddress.pincode,
            ].filter(Boolean).join(', ')}
          </p>
          {order.shippingAddress.phone && (
            <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              📞 {order.shippingAddress.phone}
            </p>
          )}
        </div>
      )}

      {/* WhatsApp Support */}
      <SupportCard orderId={order.orderNumber || order._id} />
    </div>
  );
}

// ── Main Profile Component ─────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, saveAuth } = useAuth();
  const { addToast }  = useToast();

  const [activeTab,    setActiveTab]    = useState('orders');
  const [orders,       setOrders]       = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPage,    setOrderPage]    = useState(1);
  const [orderPagination, setOrderPagination] = useState({});

  // Profile editing
  const [editMode,    setEditMode]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [profileForm, setProfileForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    street:   user?.address?.street   || '',
    city:     user?.address?.city     || '',
    district: user?.address?.district || '',
    province: user?.address?.province || '',
    country:  user?.address?.country  || 'Nepal',
    pincode:  user?.address?.pincode  || '',
  });

  // Load orders
  useEffect(() => {
    setLoadingOrders(true);
    ordersAPI.getMyOrders({ page: orderPage, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data.orders || []);
        setOrderPagination(data.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [orderPage]);

  const handleLogout = () => {
    logout();
    addToast('Signed out.', 'info');
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      saveAuth(data.data.user, localStorage.getItem('token'));
      addToast('Profile updated!', 'success');
      setEditMode(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', background: C2, border: `1px solid ${border}`,
    borderRadius: 10, padding: '10px 12px', color: '#fff',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingTop: 96, paddingBottom: 64 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(212,175,55,0.12)', border: `2px solid rgba(212,175,55,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: G, fontWeight: 800, fontSize: 20, fontFamily: 'Georgia, serif',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.name}</h1>
              <p style={{ color: '#666', fontSize: 12, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiMail size={11} /> {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', padding: '9px 16px', borderRadius: 10,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FiLogOut size={13} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C1, border: `1px solid ${border}`, borderRadius: 14, padding: 4, width: 'fit-content' }}>
          {[
            { id: 'orders',  label: 'My Orders',  icon: FiPackage },
            { id: 'profile', label: 'Profile',     icon: FiUser    },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSelectedOrder(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: activeTab === id ? G : 'transparent',
                color: activeTab === id ? '#000' : '#666',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ──────────────────────────── */}
        {activeTab === 'orders' && (
          <>
            {selectedOrder ? (
              <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
            ) : loadingOrders ? (
              <LoadingSpinner />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={FiPackage}
                title="No orders yet"
                description="Your order history will appear here after your first purchase."
                actionLabel="Start Shopping"
                actionTo="/products"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map((order) => {
                  const firstItem = order.items?.[0];
                  const firstProduct = firstItem?.product;
                  const imgSrc = getProductImageSmart(firstProduct);
                  const statusColors = getStatusColor(order.status);

                  return (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: C1, border: `1px solid ${border}`,
                        borderRadius: 14, padding: 14, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        textAlign: 'left', width: '100%',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; }}
                    >
                      {/* Product thumbnail */}
                      <img
                        src={imgSrc}
                        alt="Order"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80'; }}
                        style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', border: `1px solid ${border}`, flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <p style={{ color: G, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                            {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {firstProduct?.name || 'Product'}
                          {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ color: '#666', fontSize: 11 }}>{formatDate(order.createdAt)}</span>
                          <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                      <FiChevronRight size={16} color="#555" style={{ flexShrink: 0 }} />
                    </button>
                  );
                })}

                {/* Pagination */}
                {orderPagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    {orderPage > 1 && (
                      <button onClick={() => setOrderPage(orderPage - 1)}
                        style={{ background: C1, border: `1px solid ${border}`, color: '#888', padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                        Previous
                      </button>
                    )}
                    <span style={{ color: '#555', fontSize: 12, display: 'flex', alignItems: 'center' }}>
                      {orderPage} / {orderPagination.totalPages}
                    </span>
                    {orderPage < orderPagination.totalPages && (
                      <button onClick={() => setOrderPage(orderPage + 1)}
                        style={{ background: C1, border: `1px solid ${border}`, color: '#888', padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── PROFILE TAB ─────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{
              background: C1, border: `1px solid ${border}`,
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <p style={{ color: G, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                  Personal Information
                </p>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: editMode ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)',
                    border: `1px solid ${editMode ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.2)'}`,
                    color: editMode ? '#ef4444' : G,
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {editMode ? <><FiArrowLeft size={12} /> Cancel</> : <><FiEdit size={12} /> Edit</>}
                </button>
              </div>

              {!editMode ? (
                /* View Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { icon: FiUser,   label: 'Full Name',  value: user?.name || '—' },
                    { icon: FiMail,   label: 'Email',      value: user?.email || '—' },
                    { icon: FiPhone,  label: 'Phone',      value: user?.phone || 'Not set' },
                  ].map(({ icon: Icon, label, value }, i, arr) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={15} color={G} />
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: 11, margin: '0 0 2px' }}>{label}</p>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Address */}
                  <div style={{ padding: '14px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <FiMapPin size={15} color={G} />
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: 11, margin: '0 0 4px' }}>Delivery Address</p>
                        {user?.address?.city ? (
                          <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                            {[
                              user.address.street,
                              user.address.city,
                              user.address.district,
                              user.address.province,
                              user.address.country,
                              user.address.pincode,
                            ].filter(Boolean).join(', ')}
                          </p>
                        ) : (
                          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Not set</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'name',     label: 'Full Name',     type: 'text', placeholder: 'Your name' },
                    { key: 'phone',    label: 'Phone Number',  type: 'tel',  placeholder: '+977-98XXXXXXXX' },
                    { key: 'street',   label: 'Street / Area', type: 'text', placeholder: 'Street address' },
                    { key: 'city',     label: 'City',          type: 'text', placeholder: 'City' },
                    { key: 'district', label: 'District',      type: 'text', placeholder: 'District' },
                    { key: 'province', label: 'Province',      type: 'text', placeholder: 'Province (1–7)' },
                    { key: 'country',  label: 'Country',       type: 'text', placeholder: 'Nepal' },
                    { key: 'pincode',  label: 'Postal Code',   type: 'text', placeholder: 'Postal code' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 5, letterSpacing: 0.5 }}>
                        {label.toUpperCase()}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={profileForm[key]}
                        onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = G; }}
                        onBlur={(e) => { e.target.style.borderColor = border; }}
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      background: G, color: '#000', border: 'none',
                      padding: '12px', borderRadius: 12, fontWeight: 700,
                      fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1, marginTop: 4,
                    }}
                  >
                    {saving ? 'Saving…' : <><FiCheck size={14} /> Save Changes</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}