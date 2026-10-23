const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const faqRoutes = require('./routes/faqRoutes');
const { handleWebhook } = require('./controllers/paymentController');
const { apiLimiter, authLimiter, orderLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust reverse proxy (required for Render / Vercel rate-limiting)
app.set('trust proxy', 1);

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const cleanClientUrl = clientUrl.replace(/\/+$/, '');
const allowedOrigins = [
  cleanClientUrl,
  cleanClientUrl + '/',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true
}));

// Stripe webhook must use raw body parser BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Apply global rate limiting
app.use('/api', apiLimiter);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/faqs', faqRoutes);

// Apply specific limiters to specific routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/orders', orderLimiter); // Protects POST /api/orders

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      categories: '/api/categories',
      reports: '/api/reports',
      health: '/api/health'
    },
    documentation: 'This is the backend API server. The frontend runs on http://localhost:5173'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mask generic 500 errors in production to avoid leaking sensitive details
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Something went wrong on our end. Please try again later.';
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;