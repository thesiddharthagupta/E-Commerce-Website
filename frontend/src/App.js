import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Shop pages
import Home from './pages/shop/Home';
import Shop from './pages/shop/Shop';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import Login from './pages/shop/Login';
import Register from './pages/shop/Register';
import VerifyEmail from './pages/shop/VerifyEmail';
import ForgotPassword from './pages/shop/ForgotPassword';
import ResetPassword from './pages/shop/ResetPassword';
import Profile from './pages/shop/Profile';
import Orders from './pages/shop/Orders';
import Contact from './pages/shop/Contact';
import StaticPage from './pages/shop/StaticPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMessages from './pages/admin/AdminMessages';
import AdminReviews from './pages/admin/AdminReviews';
import AdminOffers from './pages/admin/AdminOffers';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminNotices from './pages/admin/AdminNotices';
import AdminPages from './pages/admin/AdminPages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import Verify2FA from './pages/shop/Verify2FA';

// Route guards
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  // FIX B01: redirect to /admin/login instead of generic /login
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Redirect already-logged-in users away from auth pages
const GuestRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  if (user) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Shop / Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/page/:slug" element={<StaticPage />} />

            {/* ── Auth Routes (guest only) ── */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login/verify-2fa" element={<Verify2FA />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── Protected Shop Routes ── */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            {/* ── Admin Auth ── FIX B01: dedicated admin login page */}
            <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

            {/* ── Admin Routes ── */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="offers" element={<AdminOffers />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar={false} theme="colored" />
      </CartProvider>
    </AuthProvider>
  );
}
