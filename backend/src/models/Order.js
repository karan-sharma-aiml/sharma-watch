const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true, min: 0 },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street:   { type: String, default: '' },
  city:     { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  country:  { type: String, default: 'Nepal' },
  pincode:  { type: String, default: '' },
  phone:    { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: { validator: (v) => v.length > 0, message: 'At least one item required.' },
    },

    // ── Pricing ───────────────────────────────────
    subtotal:       { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    expressCharge:  { type: Number, default: 0, min: 0 },
    totalAmount:    { type: Number, required: true, min: 0 },

    // ── Delivery ──────────────────────────────────
    deliveryType: {
      type:    String,
      enum:    ['standard', 'express'],
      default: 'standard',
    },

    // ── Status ────────────────────────────────────
    status: {
      type:    String,
      enum:    ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },

    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },

    // ── Delivery notification sent? ────────────────
    deliveryEmailSent: { type: Boolean, default: false },

    // ── Order number for display ──────────────────
    orderNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Auto-generate human-readable order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const year  = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const rand  = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `SWS-${year}${month}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);