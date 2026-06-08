const helmet        = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss           = require('xss-clean');

const applySecurityMiddleware = (app) => {
  // Helmet HTTP security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));

  // Mongo injection protection
  app.use(mongoSanitize({ replaceWith: '_' }));

  // ── FIXED: xss-clean interferes with multipart/form-data ──
  // Skip xss() for multipart requests (file uploads)
  // xss-clean reads req.body which for multipart contains file data
  // This corrupts the file buffer before multer can read it
  app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      // Skip xss for file uploads — multer handles these
      console.log('[Security] Skipping xss-clean for multipart request');
      return next();
    }
    return xss()(req, res, next);
  });

  app.disable('x-powered-by');
};

module.exports = applySecurityMiddleware;