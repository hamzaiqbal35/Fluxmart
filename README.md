<div align="center">
<img src="client/public/images/logo.png" alt="Fluxmart Logo" width="120" />
<h1>Fluxmart</h1>
<h2>Modern Full-Stack eCommerce Platform</h2>

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A comprehensive, scalable, and modern eCommerce solution.</b><br />
  Featuring a high-performance customer storefront and a feature-rich administrative management dashboard.
</p>

[Report Bug](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform/issues) • [Request Feature](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables Setup](#environment-variables-setup)
  - [Database and Admin Seeding](#database-and-admin-seeding)
  - [Development Servers](#development-servers)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)

---

## Overview

Fluxmart is a production-grade full-stack eCommerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS. It provides an intuitive, high-converting shopping experience for customers and a complete management suite for store administrators.

The system is architected around two core roles:
- **Customers**: Browse catalog, filter products, manage cart, complete secure Stripe checkouts, track orders, and leave verified reviews.
- **Administrators**: Manage store inventory, organize categories, fulfill customer orders, configure promotional banners, adjust tax/shipping settings, and inspect store analytics.

---

## Key Features

### Customer Experience
- **Catalog Navigation**: Interactive catalog with real-time search, category filters, and sorting.
- **Rich Media**: Product showcases with multi-image galleries and embedded `.mp4/.webm` product videos.
- **Persistent Cart**: Client-synchronized cart state with dynamic shipping and tax calculations.
- **Stripe Payments**: Integrated with Stripe Elements for PCI-compliant, secure card transactions.
- **Order Lifecycle**: Order status updates (Pending, Processing, Shipped, Delivered) with full customer order history.
- **Reviews & Ratings**: Verified customer reviews with 5-star scoring.
- **Profile Management**: Shipping addresses, contact information, and account settings.

### Store Administration
- **Analytics Dashboard**: Visual performance metrics (revenue, orders, customer trends) powered by Recharts.
- **Catalog & Inventory Control**: Create, update, deactivate, or delete products with stock change auditing.
- **Dynamic Categories**: Admin-controlled taxonomy that updates storefront navigation instantly.
- **Order Fulfillment**: Review, filter, inspect, and transition order fulfillment states.
- **Promotional Banners**: Configure homepage hero banners and slider assets directly from the dashboard.
- **Store Settings & FAQ Management**: Configure shipping thresholds, taxes, contact details, and customer FAQs.

### Security and Architecture
- **JWT Authentication**: Token-based authentication with HTTP-only cookies and bcrypt password hashing.
- **Rate Limiting**: Brute-force and DoS prevention powered by `express-rate-limit`.
- **Cloudinary Integration**: Cloud asset pipeline and CDN delivery for product and promotional media.
- **SPA Routing**: Production rewrite configuration to ensure client-side routes resolve cleanly on reload.

---

## Tech Stack

### Frontend Client
| Technology | Role |
| --- | --- |
| **React 19** | Component-driven user interface architecture |
| **Vite** | Modern frontend tooling and production bundling |
| **Tailwind CSS** | Utility-first responsive styling framework |
| **Recharts** | Composable charting library for admin analytics |
| **Stripe React** | Secure payment input elements |
| **Lucide React** | Lightweight SVG icon library |
| **Axios** | Promise-based HTTP client with request interceptors |
| **SweetAlert2 & Toastify** | Interactive dialogs and contextual notifications |

### Backend API
| Technology | Role |
| --- | --- |
| **Node.js** | Server-side JavaScript runtime |
| **Express.js** | Modular REST API routing framework |
| **MongoDB & Mongoose** | Document database with schema validation and indexing |
| **Stripe Node SDK** | Payment intent creation and webhook verification |
| **Multer & Cloudinary** | File upload pipeline and cloud media hosting |
| **Nodemailer** | Transactional email delivery service |
| **BcryptJS & JWT** | Password hashing and authentication tokens |

---

## Project Structure

```bash
root/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Header, Footer, ProductCard, etc.)
│   │   ├── context/        # Context Providers (AuthContext, CartContext)
│   │   ├── pages/          # App Routes (Home, Products, Checkout, AdminDashboard)
│   │   └── utils/          # API instances, formatters, and helpers
│   ├── .env.example        # Version-controlled environment template
│   └── vercel.json         # Vercel SPA rewrite configuration
│
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── config/         # Database and Cloudinary configuration
│   │   ├── controllers/    # API request logic (auth, product, cart, order, etc.)
│   │   ├── middleware/     # JWT Auth, error handlers, and rate limiters
│   │   ├── models/         # Mongoose Schemas (User, Product, Order, Banner, etc.)
│   │   ├── routes/         # Express route declarations
│   │   └── scripts/        # Database seeders (seedAdmin.js)
│   └── .env.example        # Version-controlled environment template
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance (local server or MongoDB Atlas cluster)
- Stripe Account (for development API keys)

---

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform.git
   cd "Fluxmart_Multi-Vendor eCommerce Platform"
   ```

2. **Install Dependencies**
   ```bash
   # Install Backend Dependencies
   cd server
   npm install

   # Install Frontend Dependencies
   cd ../client
   npm install
   ```

---

### Environment Variables Setup

Both `client/` and `server/` include an `.env.example` template.

#### 1. Backend Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cd server
cp .env.example .env
```
Populate the necessary variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

#### 2. Frontend Environment (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cd ../client
cp .env.example .env
```
Configure your client keys:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### Database and Admin Seeding

Seed the initial administrator account into your database:
```bash
cd server
npm run seed:admin
```
Default credentials:
- **Email:** `admin@example.com`
- **Password:** `admin123`

*(Update the administrative credentials from your profile after the initial login).*

---

### Development Servers

Launch the backend and frontend in separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Frontend running on http://localhost:5173
```

---

## API Reference

### Authentication
- `POST /api/auth/register` - Register a customer account
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/auth/me` - Fetch authenticated user profile

### Products
- `GET /api/products` - List products (supports pagination, filtering, search)
- `GET /api/products/:id` - Fetch single product details
- `POST /api/products` - (Admin) Create a new product (supports media uploads)
- `PUT /api/products/:id` - (Admin) Update product details and stock
- `DELETE /api/products/:id` - (Admin) Soft delete product

### Categories & Banners
- `GET /api/categories` - Fetch active categories
- `POST /api/categories` - (Admin) Create category
- `GET /api/banners` - Fetch active promotional banners
- `POST /api/banners` - (Admin) Upload and manage banners

### Cart & Orders
- `GET /api/cart` - Retrieve current user cart
- `POST /api/cart` - Add or update cart items
- `POST /api/orders` - Place order with Stripe payment intent
- `GET /api/orders/my-orders` - Customer order history
- `GET /api/orders/all` - (Admin) View and filter all customer orders
- `PUT /api/orders/:id/status` - (Admin) Update order fulfillment status

---

## Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add all environment variables from `server/.env` (using your MongoDB Atlas connection string for `MONGODB_URI`).

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client` and framework preset to `Vite`.
3. Add environment variables:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
   - `VITE_SERVER_URL`: `https://<your-render-service>.onrender.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_test_...`
4. The included `client/vercel.json` ensures SPA client-side routes resolve properly on reload.
5. In Render, set `CLIENT_URL` to your Vercel production domain to allow CORS requests.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

<div align="center">

### Hamza Iqbal

[![Email](https://img.shields.io/badge/Gmail-hamzaiqbalrajpoot35%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hamzaiqbalrajpoot35@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-hamzaiqbal35-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamzaiqbal35)

**Project Repository:**  
[Fluxmart eCommerce Platform](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform)

<br />

<sub>Fluxmart eCommerce Platform • Maintained by Hamza Iqbal</sub>

</div>
