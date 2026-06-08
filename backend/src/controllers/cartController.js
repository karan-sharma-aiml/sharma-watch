const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock salePrice"
    );

    if (!cart) {
      cart = { user: req.user._id, items: [] };
    }

    const totalAmount = cart.items
      ? cart.items.reduce((sum, item) => {
          const p = item.product || {};
          const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price || 0;
          return sum + price * item.quantity;
        }, 0)
      : 0;

    return sendSuccess(res, 200, "Cart fetched successfully.", {
      cart,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product ID is required.");
    }

    if (quantity < 1) {
      return sendError(res, 400, "Quantity must be at least 1.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    if (product.stock < quantity) {
      return sendError(res, 400, `Only ${product.stock} units available in stock.`);
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return sendError(res, 400, `Cannot add more. Only ${product.stock} units available.`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock salePrice");

    return sendSuccess(res, 200, "Product added to cart.", { cart });
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product ID is required.");
    }

    if (!quantity || quantity < 1) {
      return sendError(res, 400, "Quantity must be at least 1.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    if (quantity > product.stock) {
      return sendError(res, 400, `Only ${product.stock} units available in stock.`);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, 404, "Cart not found.");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return sendError(res, 404, "Product not found in cart.");
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name price images stock salePrice");

    return sendSuccess(res, 200, "Cart updated successfully.", { cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, 404, "Cart not found.");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return sendError(res, 404, "Product not found in cart.");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate("items.product", "name price images stock salePrice");

    return sendSuccess(res, 200, "Product removed from cart.", { cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };