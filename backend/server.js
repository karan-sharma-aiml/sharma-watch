require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const connectDB = require('./src/config/database');
const { notFound, globalErrorHandler } =
  require('./src/middleware/errorMiddleware');
const { verifyEmailConnection } =
  require('./src/services/emailService');

// Routes
const authRoutes     = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes  = require('./src/routes/productRoutes');
const cartRoutes     = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const orderRoutes    = require('./src/routes/orderRoutes');
const contactRoutes  = require('./src/routes/contactRoutes');
const uploadRoutes   = require('./src/routes/uploadRoutes');

const app = express();

connectDB();

// ← Test email connection on startup
verifyEmailConnection();

app.use(cors({
  origin:  process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sharma Watch Store API running.',
    version: '2.0.0',
  });
});

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/contact',    contactRoutes);
app.use('/api/upload',     uploadRoutes);

app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL:  http://localhost:${PORT}\n`);
});