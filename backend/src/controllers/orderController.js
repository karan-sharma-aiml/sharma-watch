const Order   = require('../models/Order');
const Product = require('../models/Product');
const Cart    = require('../models/Cart');
const User    = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendDeliveryEmail }      = require('../services/emailService');

// ── Shipping config ────────────────────────────────
const FREE_SHIPPING_ABOVE  = 500;   // NPR
const STANDARD_SHIPPING    = 50;    // NPR
const EXPRESS_SURCHARGE    = 50;    // NPR

// ── CREATE ORDER ──────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, deliveryType = 'standard' } = req.body;

    const orderItems   = [];
    let   subtotal     = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return sendError(res, 404, `Product not found: ${item.product}`);
      if (product.stock < item.quantity) {
        return sendError(res, 400, `Insufficient stock for "${product.name}"`);
      }

      const itemPrice = (product.isSaleActive && product.salePrice)
        ? product.salePrice
        : product.price;

      orderItems.push({
        product:  product._id,
        quantity: item.quantity,
        price:    itemPrice,
      });

      subtotal += itemPrice * item.quantity;
    }

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, purchaseCount: item.quantity } });
    }

    // Calculate shipping
    const shippingCharge = subtotal >= FREE_SHIPPING_ABOVE ? 0 : STANDARD_SHIPPING;
    const expressCharge  = deliveryType === 'express'       ? EXPRESS_SURCHARGE : 0;
    const totalAmount    = subtotal + shippingCharge + expressCharge;

    // Build full shipping address — use profile if not provided
    const user  = await User.findById(req.user._id);
    const addr  = shippingAddress || user?.address || {};
    const phone = addr.phone || user?.phone || '';

    const order = await Order.create({
      user:    req.user._id,
      items:   orderItems,
      subtotal,
      shippingCharge,
      expressCharge,
      totalAmount:    parseFloat(totalAmount.toFixed(2)),
      deliveryType,
      shippingAddress: { ...addr, phone },
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    const populated = await order.populate('items.product', 'name images price salePrice brand');

    return sendSuccess(res, 201, 'Order placed successfully!', { order: populated });
  } catch (error) {
    next(error);
  }
};

// ── GET MY ORDERS ─────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('items.product', 'name images price salePrice brand category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return sendSuccess(res, 200, 'Orders fetched.', {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages:  Math.ceil(total / limitNum),
        totalOrders: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL ORDERS (Admin) ─────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone address')
        .populate('items.product', 'name images price salePrice brand')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Orders fetched.', {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages:  Math.ceil(total / limitNum),
        totalOrders: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE ORDER STATUS (Admin) ───────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid status.`);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) return sendError(res, 404, 'Order not found.');

    // ── Send delivery confirmation email ───────────
    if (status === 'Delivered' && !order.deliveryEmailSent) {
      try {
        await sendDeliveryEmail(order.user, order);
        await Order.findByIdAndUpdate(id, { deliveryEmailSent: true });
        console.log('[Order] Delivery email sent for order:', order.orderNumber);
      } catch (emailErr) {
        console.error('[Order] Delivery email failed:', emailErr.message);
        // Don't fail the status update if email fails
      }
    }

    return sendSuccess(res, 200, 'Order status updated.', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};