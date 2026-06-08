import React, { useState, useEffect, useCallback } from 'react';
import { FiChevronRight, FiChevronDown, FiPackage, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { ordersAPI }     from '../../services/api';
import { useToast }      from '../../context/ToastContext';
import {
  formatPrice, formatDate, getStatusColor,
  getProductImageSmart, getWhatsAppOrderLink,
} from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination     from '../../components/Pagination';

const G      = '#d4af37';
const C1     = '#111111';
const C2     = '#1a1a1a';
const border = '#252525';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function StatusBadge({ status }) {
  const c = getStatusColor(status);
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 10, fontWeight: 700, padding: '3px 10px',
      borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const { addToast } = useToast();

  const [orders,     setOrders]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [expanded,   setExpanded]   = useState(null);
  const [updating,   setUpdating]   = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter !== 'all') params.status = filter;
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.data.orders || []);
      setPagination(data.data.pagination || {});
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await ordersAPI.updateStatus(orderId, status);
      const deliveredMsg = status === 'Delivered'
        ? ' Delivery confirmation email sent to customer.' : '';
      addToast(`Order status updated to ${status}.${deliveredMsg}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ color: '#fff' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Orders
        </h1>
        <p style={{ color: '#666', fontSize: 13 }}>{pagination.totalOrders || 0} total orders</p>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {['all', ...ORDER_STATUSES].map((s) => {
          const isActive = filter === s;
          const c = s !== 'all' ? getStatusColor(s) : null;
          return (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none',
                background: isActive
                  ? (c ? c.bg : 'rgba(212,175,55,0.15)')
                  : 'rgba(255,255,255,0.04)',
                color: isActive
                  ? (c ? c.color : G)
                  : '#666',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s === 'all' ? 'All Orders' : s}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#555', fontSize: 14 }}>
          No orders found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((order) => {
            const isOpen = expanded === order._id;

            return (
              <div key={order._id} style={{
                background: C1, border: `1px solid ${border}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                {/* Order Summary Row */}
                <div
                  style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    gap: 12, padding: '14px 16px', cursor: 'pointer',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Order Number */}
                    <div>
                      <p style={{ color: '#888', fontSize: 10, margin: '0 0 2px' }}>Order</p>
                      <p style={{ color: G, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                        {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                      </p>
                    </div>

                    {/* Customer */}
                    <div>
                      <p style={{ color: '#888', fontSize: 10, margin: '0 0 2px' }}>Customer</p>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>
                        {order.user?.name || '—'}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p style={{ color: '#888', fontSize: 10, margin: '0 0 2px' }}>Total</p>
                      <p style={{ color: G, fontSize: 13, fontWeight: 700, margin: 0 }}>
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <p style={{ color: '#888', fontSize: 10, margin: '0 0 2px' }}>Date</p>
                      <p style={{ color: '#ccc', fontSize: 12, margin: 0 }}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Status Updater */}
                    <select
                      value={order.status}
                      disabled={updating === order._id}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(order._id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: C2, border: `1px solid ${border}`,
                        borderRadius: 8, padding: '6px 10px',
                        color: '#ccc', fontSize: 12, outline: 'none',
                        cursor: updating === order._id ? 'not-allowed' : 'pointer',
                        opacity: updating === order._id ? 0.6 : 1,
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} style={{ background: C2 }}>{s}</option>
                      ))}
                    </select>

                    {isOpen
                      ? <FiChevronDown size={16} color="#888" />
                      : <FiChevronRight size={16} color="#888" />
                    }
                  </div>
                </div>

                {/* Expanded Detail */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${border}`, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                      {/* Customer Info */}
                      <div style={{ background: C2, borderRadius: 12, padding: 14 }}>
                        <p style={{ color: G, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
                          Customer Details
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiMail size={13} color="#666" />
                            <div>
                              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{order.user?.name || '—'}</p>
                              <p style={{ color: '#888', fontSize: 11, margin: 0 }}>{order.user?.email || '—'}</p>
                            </div>
                          </div>
                          {(order.user?.phone || order.shippingAddress?.phone) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FiPhone size={13} color="#666" />
                              <p style={{ color: '#ccc', fontSize: 12, margin: 0 }}>
                                {order.shippingAddress?.phone || order.user?.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div style={{ background: C2, borderRadius: 12, padding: 14 }}>
                        <p style={{ color: G, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
                          Delivery Address
                        </p>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <FiMapPin size={13} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            {order.shippingAddress?.city ? (
                              <p style={{ color: '#ccc', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                                {[
                                  order.shippingAddress.street,
                                  order.shippingAddress.city,
                                  order.shippingAddress.district,
                                  order.shippingAddress.province,
                                  order.shippingAddress.country,
                                ].filter(Boolean).join(', ')}
                              </p>
                            ) : (
                              <p style={{ color: '#555', fontSize: 12, margin: 0 }}>No address provided</p>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                              <div>
                                <span style={{ color: '#666', fontSize: 10 }}>Delivery: </span>
                                <span style={{ color: '#ccc', fontSize: 11, textTransform: 'capitalize' }}>
                                  {order.deliveryType === 'express' ? '⚡ Express' : '🚚 Standard'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ background: C2, borderRadius: 12, padding: 14, marginBottom: 14 }}>
                      <p style={{ color: G, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
                        Items ({order.items.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {order.items.map((item, idx) => {
                          const p = item.product;
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img
                                src={getProductImageSmart(p)}
                                alt={p?.name}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80'; }}
                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: `1px solid ${border}`, flexShrink: 0 }}
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

                    {/* Price Summary */}
                    <div style={{ background: C2, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {order.subtotal !== undefined && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888', fontSize: 12 }}>Subtotal</span>
                            <span style={{ color: '#ccc', fontSize: 12 }}>{formatPrice(order.subtotal)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888', fontSize: 12 }}>Shipping</span>
                          {order.shippingCharge > 0
                            ? <span style={{ color: '#ccc', fontSize: 12 }}>{formatPrice(order.shippingCharge)}</span>
                            : <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>FREE</span>
                          }
                        </div>
                        {order.expressCharge > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888', fontSize: 12 }}>Express Surcharge</span>
                            <span style={{ color: '#ccc', fontSize: 12 }}>{formatPrice(order.expressCharge)}</span>
                          </div>
                        )}
                        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Total</span>
                          <span style={{ color: G, fontWeight: 800, fontSize: 16 }}>{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Quick Contact */}
                    <a
                      href={getWhatsAppOrderLink(order.orderNumber || order._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
                        color: '#22c55e', textDecoration: 'none', padding: '9px 16px',
                        borderRadius: 10, fontSize: 12, fontWeight: 600,
                      }}
                    >
                      💬 Contact Customer on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages   || 1}
        onPageChange={(pg) => { setPage(pg); window.scrollTo({ top: 0 }); }}
      />
    </div>
  );
}