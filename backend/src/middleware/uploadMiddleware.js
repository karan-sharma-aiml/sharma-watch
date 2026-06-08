const multer = require('multer');

// Accept all common image MIME types
// Windows sometimes sends 'image/jpg' instead of 'image/jpeg'
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('[Multer fileFilter] Checking file:', {
    fieldname:    file.fieldname,
    originalname: file.originalname,
    mimetype:     file.mimetype,
    encoding:     file.encoding,
  });

  const mimeType = (file.mimetype || '').toLowerCase();

  if (ALLOWED_TYPES.includes(mimeType)) {
    console.log('[Multer fileFilter] ✅ Accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('[Multer fileFilter] ❌ Rejected MIME type:', mimeType);
    cb(new Error(`File type not allowed: ${mimeType}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
    files:    5,
  },
  fileFilter,
});

module.exports = upload;