# Fluxmart - Backend Server API

Backend REST API service for the Fluxmart eCommerce platform, built with Node.js, Express, and MongoDB.

## Features

- **Product & Inventory Management**: CRUD operations for products, categories, stock tracking, and action logs.
- **Order Processing & Stripe Integration**: Customer order lifecycle management, Stripe Payment Intents, and webhooks.
- **Authentication & RBAC**: JWT-based authentication supporting Customer and Administrator roles.
- **File & Media Uploads**: Multer and Cloudinary integration for product images/videos and avatars.
- **Security & Reliability**: Express rate limiting, input validation, CORS protection, and secure cookies.
- **Admin Dashboard Controls**: Analytics reports, banner promotions, store settings, and FAQs.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **Payments**: Stripe SDK
- **File Storage**: Cloudinary & Local fallback

## Project Structure

```
server/
├── src/
│   ├── config/           # Database, Cloudinary, and setup configurations
│   ├── controllers/      # Route controllers (auth, product, cart, order, etc.)
│   ├── middleware/       # JWT Auth, rate limiting, and error handling
│   ├── models/           # Mongoose models (User, Product, Order, Banner, etc.)
│   ├── routes/           # API routes definitions
│   ├── scripts/          # Database seeding scripts (seedAdmin.js)
│   ├── app.js            # Express app configuration & middleware
│   └── server.js         # Entry point and DB connection
├── uploads/              # Local uploads fallback
├── .env.example          # Version-controlled environment template
└── package.json
```

## Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure you provide:
- `PORT` (e.g. 5000)
- `MONGODB_URI` (local or MongoDB Atlas connection string)
- `JWT_SECRET` (secure random string)
- `CLIENT_URL` (e.g. `http://localhost:5173` or your production Vercel frontend URL)
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 3. Seed Admin Account
To populate your MongoDB database with the initial Administrator account:
```bash
npm run seed:admin
```
Default credentials:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### 4. Start Development Server
```bash
npm run dev
```
For production:
```bash
npm start
```

## API Overview

- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - User/Admin login
- `GET /api/auth/me` - Current user profile
- `GET /api/products` - Browse catalog (with filtering & pagination)
- `POST /api/products` - Admin product creation
- `PUT /api/products/:id` - Admin product update
- `DELETE /api/products/:id` - Admin product removal
- `GET /api/cart` - User shopping cart
- `POST /api/cart` - Add/update items in cart
- `POST /api/orders` - Place order & create Stripe payment intent
- `GET /api/orders/my-orders` - Customer orders
- `GET /api/orders/all` - Admin order oversight
- `PUT /api/orders/:id/status` - Update order fulfillment
- `GET /api/categories` - Fetch active product categories
- `GET /api/banners` - Fetch homepage promotional banners
- `GET /api/health` - Server health check