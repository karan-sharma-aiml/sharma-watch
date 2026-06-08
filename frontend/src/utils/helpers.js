const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80';

export const WHATSAPP_NUMBER = '9779827286613';
export const WHATSAPP_BASE   = `https://wa.me/${WHATSAPP_NUMBER}`;

// ── Image Helpers ──────────────────────────────────

// Primary helper — for new schema (images array)
export const getMainProductImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return PLACEHOLDER;
  }
  const main = images.find((img) => img?.isMain) || images[0];
  if (main?.url && typeof main.url === 'string' && main.url.startsWith('http')) {
    return main.url;
  }
  return PLACEHOLDER;
};

// Legacy helper — kept for any old 'image: string' fields
export const getProductImage = (image) => {
  if (image && typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  return PLACEHOLDER;
};

// Smart helper — handles BOTH old string and new array format
export const getProductImageSmart = (product) => {
  if (!product) return PLACEHOLDER;
  // New schema: images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return getMainProductImage(product.images);
  }
  // Old schema: image string
  if (product.image && typeof product.image === 'string') {
    return getProductImage(product.image);
  }
  return PLACEHOLDER;
};

// ── Price Helpers ──────────────────────────────────

export const formatPrice = (amount) =>
  `NPR ${(amount || 0).toLocaleString('en-IN')}`;

export const isOnSale = (product) =>
  !!(
    product?.isSaleActive &&
    product?.salePrice     &&
    product.salePrice > 0  &&
    product.salePrice < product.price
  );

export const getEffectivePrice = (product) => {
  if (isOnSale(product)) return product.salePrice;
  return product?.price || 0;
};

export const calculateDiscount = (original, sale) => {
  if (!original || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// ── Shipping Helpers ───────────────────────────────

export const FREE_SHIPPING_ABOVE = 500;
export const STANDARD_SHIPPING   = 50;
export const EXPRESS_SURCHARGE   = 50;

export const calculateShipping = (subtotal) =>
  subtotal >= FREE_SHIPPING_ABOVE ? 0 : STANDARD_SHIPPING;

export const calculateOrderTotal = (subtotal, isExpress = false) => {
  const shipping = calculateShipping(subtotal);
  const express  = isExpress ? EXPRESS_SURCHARGE : 0;
  return { subtotal, shipping, express, total: subtotal + shipping + express };
};

// ── WhatsApp Helpers ───────────────────────────────

export const getWhatsAppOrderLink = (orderNumber) => {
  const msg = encodeURIComponent(
    `Hello Sharma Watch Store,\n\nI need assistance regarding my order.\n\nOrder ID: ${orderNumber}\n\nPlease help me.`
  );
  return `${WHATSAPP_BASE}?text=${msg}`;
};

export const getWhatsAppGeneralLink = () => {
  const msg = encodeURIComponent(
    `Hello Sharma Watch Store,\n\nI have a question about your products.\n\nPlease help me.`
  );
  return `${WHATSAPP_BASE}?text=${msg}`;
};

// ── Date & Status Helpers ──────────────────────────

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

export const getStatusColor = (status) => {
  const map = {
    Pending:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
    Confirmed:  { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
    Processing: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
    Shipped:    { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.25)'  },
    Delivered:  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)'  },
    Cancelled:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)'   },
  };
  return map[status] || { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' };
};

export const truncate = (str, n = 80) =>
  str && str.length > n ? `${str.slice(0, n)}…` : str;

export const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });