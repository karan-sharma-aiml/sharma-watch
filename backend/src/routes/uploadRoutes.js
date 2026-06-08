const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/uploadMiddleware');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// ── Multiple images ────────────────────────────────
router.post(
  '/images',
  protect,
  adminOnly,
  (req, res, next) => {
    // ── DEBUG: Before multer ─────────────────────
    console.log('\n=== UPLOAD ROUTE HIT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('User:', req.user?.email, '| Role:', req.user?.role);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Authorization present:', !!req.headers.authorization);
    next();
  },
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      // ── DEBUG: After multer ──────────────────────
      console.log('=== AFTER MULTER PARSE ===');
      console.log('req.files:', req.files);
      console.log('req.file:', req.file);
      console.log('req.body:', req.body);
      console.log('Files count:', req.files?.length);

      if (req.files && req.files.length > 0) {
        req.files.forEach((f, i) => {
          console.log(`  File[${i}]:`, {
            fieldname:    f.fieldname,
            originalname: f.originalname,
            mimetype:     f.mimetype,
            size:         f.size,
            buffer:       f.buffer ? `Buffer(${f.buffer.length} bytes)` : 'NULL',
          });
        });
      }

      if (!req.files || req.files.length === 0) {
        console.log('❌ req.files is empty/undefined');
        return sendError(res, 400, 'No images provided.');
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'sharma-watches/products')
      );

      const results = await Promise.all(uploadPromises);

      console.log('✅ Cloudinary upload complete:', results.length, 'images');

      return sendSuccess(res, 200, 'Images uploaded.', { images: results });
    } catch (error) {
      console.error('❌ Upload error:', error);
      next(error);
    }
  }
);

// ── Single image ───────────────────────────────────
router.post(
  '/image',
  protect,
  adminOnly,
  upload.single('image'),
  async (req, res, next) => {
    try {
      console.log('[Upload/single] file:', req.file?.originalname);

      if (!req.file) {
        return sendError(res, 400, 'No image provided.');
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'sharma-watches/products'
      );

      return sendSuccess(res, 200, 'Image uploaded.', { image: result });
    } catch (error) {
      next(error);
    }
  }
);

// ── Delete image ───────────────────────────────────
router.delete('/image', protect, adminOnly, async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return sendError(res, 400, 'Public ID is required.');
    await deleteFromCloudinary(publicId);
    return sendSuccess(res, 200, 'Image deleted.', {});
  } catch (error) {
    next(error);
  }
});

module.exports = router;