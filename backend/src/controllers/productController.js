const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { deleteMultipleFromCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// GET all products — public
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      search = '', category = '',
      brand = '', gender = '',
      minPrice, maxPrice,
      status = 'active',
      isFeatured, isBestSeller, isNewArrival, isTrending,
      sortBy = 'createdAt', order = 'desc',
      tags = '',
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    // Status filter — admin can see all, public only sees active
    if (req.user?.role === 'admin') {
      if (status && status !== 'all') filter.status = status;
    } else {
      filter.status = 'active';
    }

    if (search.trim()) {
      filter.$text = { $search: search.trim() };
    }
    if (category)   filter.category    = category;
    if (brand)      filter.brand       = { $regex: brand, $options: 'i' };
    if (gender)     filter.gender      = gender;
    if (tags)       filter.tags        = { $in: tags.split(',') };
    if (isFeatured  === 'true') filter.isFeatured  = true;
    if (isBestSeller=== 'true') filter.isBestSeller= true;
    if (isNewArrival=== 'true') filter.isNewArrival= true;
    if (isTrending  === 'true') filter.isTrending  = true;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('-customSpecs -seo -relatedProducts -__v')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Products fetched.', {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET single product
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('relatedProducts', 'name images price salePrice brand')
      .lean({ virtuals: true });

    if (!product) return sendError(res, 404, 'Product not found.');

    // Increment view count (non-blocking)
    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    return sendSuccess(res, 200, 'Product fetched.', { product });
  } catch (error) {
    next(error);
  }
};

// POST create product — admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name, brand, category, description, shortDescription,
      price, salePrice, isSaleActive,
      stock, lowStockThreshold, allowBackorder, sku,
      images,
      specifications, customSpecs,
      gender, ageGroup, tags,
      isBestSeller, isFeatured, isNewArrival, isTrending, isFlashSale,
      status, seo,
    } = req.body;

    if (!images || images.length === 0) {
      return sendError(res, 400, 'At least one product image is required.');
    }

    const product = await Product.create({
      name, brand, category, description, shortDescription,
      price, salePrice, isSaleActive,
      stock, lowStockThreshold, allowBackorder, sku,
      images,
      specifications, customSpecs,
      gender, ageGroup,
      tags: tags || [],
      isBestSeller: isBestSeller || false,
      isFeatured:   isFeatured   || false,
      isNewArrival: isNewArrival || false,
      isTrending:   isTrending   || false,
      isFlashSale:  isFlashSale  || false,
      status: status || 'draft',
      seo: seo || {},
    });

    const populated = await product.populate('category', 'name');
    return sendSuccess(res, 201, 'Product created.', { product: populated });
  } catch (error) {
    next(error);
  }
};

// PUT update product — admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const existing = await Product.findById(id);
    if (!existing) return sendError(res, 404, 'Product not found.');

    // Handle removed images — delete from Cloudinary
    if (updates.removedImageIds && updates.removedImageIds.length > 0) {
      await deleteMultipleFromCloudinary(updates.removedImageIds);
      delete updates.removedImageIds;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    })
      .populate('category', 'name')
      .lean({ virtuals: true });

    return sendSuccess(res, 200, 'Product updated.', { product });
  } catch (error) {
    next(error);
  }
};

// DELETE product — admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, 'Product not found.');

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((img) => img.publicId).filter(Boolean);
      await deleteMultipleFromCloudinary(publicIds);
    }

    await Product.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Product deleted.', {});
  } catch (error) {
    next(error);
  }
};

// DELETE bulk products — admin
const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) return sendError(res, 400, 'No product IDs provided.');

    const products = await Product.find({ _id: { $in: ids } });

    // Delete all images from Cloudinary
    const allPublicIds = products.flatMap(
      (p) => (p.images || []).map((img) => img.publicId).filter(Boolean)
    );
    if (allPublicIds.length > 0) {
      await deleteMultipleFromCloudinary(allPublicIds);
    }

    await Product.deleteMany({ _id: { $in: ids } });
    return sendSuccess(res, 200, `${ids.length} products deleted.`, {});
  } catch (error) {
    next(error);
  }
};

// PATCH bulk status change — admin
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const validStatuses = ['active', 'draft', 'hidden'];
    if (!validStatuses.includes(status)) return sendError(res, 400, 'Invalid status.');

    await Product.updateMany({ _id: { $in: ids } }, { $set: { status } });
    return sendSuccess(res, 200, 'Products updated.', {});
  } catch (error) {
    next(error);
  }
};

// GET dashboard stats — admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      featuredProducts,
      bestSellers,
      totalByCategory,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'draft' }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ isFeatured: true, status: 'active' }),
      Product.countDocuments({ isBestSeller: true, status: 'active' }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const lowStockList = await Product.find({ stock: { $gt: 0, $lte: 5 }, status: 'active' })
      .select('name stock images brand')
      .sort({ stock: 1 })
      .limit(10)
      .lean({ virtuals: true });

    return sendSuccess(res, 200, 'Stats fetched.', {
      stats: {
        totalProducts,
        activeProducts,
        draftProducts,
        outOfStockProducts,
        lowStockProducts,
        featuredProducts,
        bestSellers,
      },
      totalByCategory,
      lowStockList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  getDashboardStats,
};