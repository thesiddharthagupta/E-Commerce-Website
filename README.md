# TechMart Electronic Shop ERP

Full-stack ERP system for an electronics shop built with **Node.js + Express + MongoDB** (backend) and **React** (frontend).

## Color Scheme
- Primary: `#1d8dac`
- Primary Dark: `#0f5f7a`
- Accent: `#f97316`

---

## Project Structure

```
techmart/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── seed.js          # Database seeder
│   ├── middleware/
│   │   ├── auth.js          # JWT auth middleware
│   │   └── upload.js        # Multer image upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── index.js         # Category, Review, Order, Offer, Newsletter, Notice, Message, Page, Settings
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── offers.js
│   │   ├── reviews.js
│   │   ├── newsletter.js
│   │   ├── notices.js
│   │   ├── messages.js
│   │   ├── pages.js
│   │   ├── settings.js
│   │   ├── orders.js
│   │   └── cart.js
│   ├── uploads/             # Created automatically
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/                # React app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Header.js
    │   │   │   ├── Footer.js
    │   │   │   └── CartDrawer.js
    │   │   └── shop/
    │   │       └── ProductCard.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── shop/
    │   │   │   ├── Home.js
    │   │   │   ├── Shop.js          # Product listing + filters
    │   │   │   ├── ProductDetail.js  # ⭐ Add/Remove/Features
    │   │   │   ├── Cart.js
    │   │   │   ├── Checkout.js
    │   │   │   ├── Login.js
    │   │   │   ├── Register.js
    │   │   │   ├── Profile.js
    │   │   │   ├── Orders.js
    │   │   │   ├── Contact.js
    │   │   │   └── StaticPage.js
    │   │   └── admin/
    │   │       ├── AdminLayout.js   # Sidebar + header
    │   │       ├── Dashboard.js
    │   │       ├── Products.js
    │   │       ├── ProductForm.js   # Add/Edit product
    │   │       ├── Categories.js
    │   │       ├── AdminOrders.js
    │   │       ├── AdminMessages.js
    │   │       ├── AdminReviews.js
    │   │       ├── AdminOffers.js
    │   │       ├── AdminNewsletter.js
    │   │       ├── AdminNotices.js
    │   │       ├── AdminPages.js
    │   │       └── AdminSettings.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Setup & Installation

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd techmart/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

**.env configuration:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/techmart
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Seed the database (creates admin + sample products):**
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev     # development (with nodemon)
npm start       # production
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd techmart/frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Default Admin Credentials

```
Email:    admin@techmart.com
Password: admin123
```

Access admin panel at: `http://localhost:3000/admin`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/wishlist/:productId` | Toggle wishlist |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (filter, sort, paginate) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:id` | Get by ID or slug |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Soft delete (admin) |
| PATCH | `/api/products/:id/feature` | Toggle featured (admin) |
| PATCH | `/api/products/:id/stock` | Update stock (admin) |

### Categories
| GET/POST | `/api/categories` | List / Create |
| PUT/DELETE | `/api/categories/:id` | Update / Delete |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/my` | My orders |
| GET | `/api/orders` | All orders (admin) |
| PATCH | `/api/orders/:id/status` | Update status (admin) |

### Reviews
| GET | `/api/reviews/product/:id` | Product reviews |
| POST | `/api/reviews` | Add review (auth) |
| PATCH | `/api/reviews/:id/approve` | Approve (admin) |
| DELETE | `/api/reviews/:id` | Delete (admin) |

### Offers
| POST | `/api/offers/validate` | Validate coupon |
| GET/POST | `/api/offers` | List / Create (admin) |
| PUT/DELETE | `/api/offers/:id` | Update / Delete (admin) |

### Other
| Endpoint | Description |
|----------|-------------|
| POST `/api/newsletter/subscribe` | Subscribe |
| GET `/api/newsletter` | All subscribers (admin) |
| POST `/api/messages` | Send contact message |
| GET `/api/messages` | All messages (admin) |
| GET/POST `/api/notices` | Notices |
| GET `/api/pages/:slug` | Get page by slug |
| GET/PUT `/api/settings` | Site settings |
| POST `/api/cart/validate` | Validate cart items |

---

## Key Features

### Customer-Facing
- ✅ Home page with hero, featured products, categories, new arrivals
- ✅ Shop page with sidebar filters (category, price, featured, new)
- ✅ **Product Detail page** with:
  - Image gallery with thumbnail selector
  - Add to Cart / Remove from Cart toggle
  - Quantity selector (respects stock)
  - Buy Now button
  - Feature badges (New, Featured, Sale %)
  - Key Features list
  - Specifications table
  - Reviews with rating breakdown + write review
  - Related products
- ✅ Slide-over Cart Drawer
- ✅ Full Cart page with coupon support
- ✅ Checkout with address + payment method
- ✅ Order history with expandable detail
- ✅ User profile + password change
- ✅ Contact form
- ✅ Newsletter subscription
- ✅ Static pages (About, Privacy, Terms, Returns)

### Admin Panel (`/admin`)
- ✅ Dashboard with stats + recent orders
- ✅ Products: list, add, edit, delete, toggle featured, soft delete
- ✅ Product Form: images upload, specs, features, status flags
- ✅ Categories: CRUD
- ✅ Orders: filter by status, expand detail, update status
- ✅ Messages: inbox with reply
- ✅ Reviews: approve / reject / delete
- ✅ Offers & Coupons: create percentage/fixed discounts
- ✅ Newsletter: subscriber list + copy emails
- ✅ Notices: create announcements
- ✅ Pages: manage static content pages
- ✅ Settings: site name, contact, shop config, social links

---

## Production Deployment

### Backend (e.g. Railway, Render, VPS)
```bash
npm start
```
Set environment variables in your hosting dashboard.

### Frontend (e.g. Netlify, Vercel)
```bash
npm run build
```
Set `REACT_APP_API_URL=https://your-backend-url.com/api` in environment variables.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer |
| Frontend | React 18, React Router v6 |
| HTTP Client | Axios |
| Notifications | React Toastify |
| Fonts | Sora + DM Sans (Google Fonts) |

---

*TechMart ERP — Built with ❤️ for Nepal's electronics retail*
