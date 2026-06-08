const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true }, // Cloudinary public_id for deletion
  alt:       { type: String, default: '' },
  isMain:    { type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // ── Core Info ─────────────────────────────────
    name:        { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 150 },
    slug:        { type: String, unique: true, lowercase: true, trim: true },
    brand:       { type: String, required: [true, 'Brand is required'], trim: true, maxlength: 100 },
    sku:         { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },

    // ── Category ──────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Pricing ───────────────────────────────────
    price:          { type: Number, required: [true, 'Price is required'], min: 0 },
    salePrice:      { type: Number, default: null, min: 0 },
    discount:       { type: Number, default: 0, min: 0, max: 100 }, // auto-calculated
    isSaleActive:   { type: Boolean, default: false },
    saleStartDate:  { type: Date, default: null },
    saleEndDate:    { type: Date, default: null },
    currency:       { type: String, default: 'NPR' },

    // ── Inventory ─────────────────────────────────
    stock:           { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    allowBackorder:  { type: Boolean, default: false },

    // ── Images ────────────────────────────────────
    images: {
      type: [imageSchema],
      validate: {
        validator: (v) => v.length <= 5,
        message: 'Maximum 5 images allowed.',
      },
    },

    // ── Watch Specifications ───────────────────────
    specifications: {
      movementType:   { type: String, enum: ['Automatic', 'Manual', 'Quartz', 'Solar', 'Kinetic', 'Smart', ''], default: '' },
      caseDiameter:   { type: String, default: '' },   // e.g. "42mm"
      caseThickness:  { type: String, default: '' },   // e.g. "11mm"
      caseMaterial:   { type: String, default: '' },   // e.g. "Stainless Steel"
      dialColor:      { type: String, default: '' },
      crystalType:    { type: String, enum: ['Sapphire', 'Mineral', 'Acrylic', ''], default: '' },
      strapMaterial:  { type: String, default: '' },   // e.g. "Leather, Mesh, Rubber"
      strapWidth:     { type: String, default: '' },   // e.g. "20mm"
      waterResistance:{ type: String, default: '' },   // e.g. "100m / 10ATM"
      powerReserve:   { type: String, default: '' },   // e.g. "42 hours"
      weight:         { type: String, default: '' },   // e.g. "150g"
      functions:      [{ type: String, trim: true }],  // e.g. ["Date", "Chronograph"]
      warranty:       { type: String, default: '1 Year' },
      madeIn:         { type: String, default: '' },
    },

    // ── Additional Specs (flexible key-value) ─────
    customSpecs: [specificationSchema],

    // ── Classification ────────────────────────────
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids'],
      default: 'Unisex',
    },
    ageGroup: {
      type: String,
      enum: ['Adult', 'Youth', 'Kids'],
      default: 'Adult',
    },

    // ── Product Flags ─────────────────────────────
    isBestSeller:  { type: Boolean, default: false },
    isFeatured:    { type: Boolean, default: false },
    isNewArrival:  { type: Boolean, default: false },
    isTrending:    { type: Boolean, default: false },
    isFlashSale:   { type: Boolean, default: false },

    // ── Status ────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'draft', 'hidden', 'out_of_stock'],
      default: 'draft',
    },

    // ── SEO ───────────────────────────────────────
    seo: {
      metaTitle:       { type: String, maxlength: 70,  default: '' },
      metaDescription: { type: String, maxlength: 160, default: '' },
      metaKeywords:    [{ type: String }],
    },

    // ── Analytics ─────────────────────────────────
    viewCount:        { type: Number, default: 0 },
    purchaseCount:    { type: Number, default: 0 },
    wishlistCount:    { type: Number, default: 0 },
    averageRating:    { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:     { type: Number, default: 0 },

    // ── Relations ─────────────────────────────────
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────
productSchema.virtual('mainImage').get(function () {
  if (!this.images || this.images.length === 0) return null;
  const main = this.images.find((img) => img.isMain);
  return main ? main.url : this.images[0].url;
});

productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

productSchema.virtual('effectivePrice').get(function () {
  if (this.isSaleActive && this.salePrice) return this.salePrice;
  return this.price;
});

// ── Pre-save hooks ────────────────────────────────
productSchema.pre('save', function (next) {
  // Auto-calculate discount
  if (this.salePrice && this.price > 0) {
    this.discount = Math.round(((this.price - this.salePrice) / this.price) * 100);
  } else {
    this.discount = 0;
  }

  // Auto-generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Auto-generate SKU if missing
  if (!this.sku) {
    const prefix = (this.brand || 'SW').substring(0, 3).toUpperCase();
    const suffix = Date.now().toString(36).toUpperCase().slice(-5);
    this.sku = `${prefix}-${suffix}`;
  }

  // Ensure first image is main if none set
  if (this.images && this.images.length > 0) {
    const hasMain = this.images.some((img) => img.isMain);
    if (!hasMain) this.images[0].isMain = true;
  }

  // Auto out_of_stock status
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  }

  next();
});

// ── Indexes ───────────────────────────────────────
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ status: 1, isBestSeller: 1 });
productSchema.index({ status: 1, isNewArrival: 1 });
productSchema.index({ status: 1, isTrending: 1 });
productSchema.index({ price: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);