const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name price images stock category salePrice"
    );

    if (!wishlist) {
      wishlist = { user: req.user._id, products: [] };
    }

    return sendSuccess(res, 200, "Wishlist fetched successfully.", { wishlist });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product ID is required.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const alreadyAdded = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (alreadyAdded) {
      return sendError(res, 409, "Product is already in wishlist.");
    }

    wishlist.products.push(productId);
    await wishlist.save();
    await wishlist.populate("products", "name price images stock category salePrice");

    return sendSuccess(res, 200, "Product added to wishlist.", { wishlist });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return sendError(res, 404, "Wishlist not found.");
    }

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return sendError(res, 404, "Product not found in wishlist.");
    }

    wishlist.products.splice(index, 1);
    await wishlist.save();
    await wishlist.populate("products", "name price images stock category salePrice");

    return sendSuccess(res, 200, "Product removed from wishlist.", { wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };