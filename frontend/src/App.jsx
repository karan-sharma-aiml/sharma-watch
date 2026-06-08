import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider }    from './context/ToastContext';
import { AuthProvider }     from './context/AuthContext';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import MainLayout  from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute     from './routes/AdminRoute';

import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Wishlist      from './pages/Wishlist';
import Login         from './pages/Login';
import Register      from './pages/Register';
import VerifyEmail    from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Contact       from './pages/Contact';
import Profile       from './pages/Profile';
import PolicyPage    from './pages/PolicyPage';
import NotFound      from './pages/NotFound';

import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders     from './pages/admin/AdminOrders';
import AdminContacts   from './pages/admin/AdminContacts';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Public + Customer Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/"            element={<Home />} />
                  <Route path="/products"    element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart"        element={<Cart />} />
                  <Route path="/wishlist"    element={<Wishlist />} />
                  <Route path="/login"       element={<Login />} />
                  <Route path="/register"    element={<Register />} />
                  <Route path="/verify-email"    element={<VerifyEmail />}    />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password"  element={<ResetPassword />}  />
                  <Route path="/contact"     element={<Contact />} />
                  <Route path="/privacy-policy" element={<PolicyPage title="Privacy Policy" />} />
                  <Route path="/terms-conditions" element={<PolicyPage title="Terms & Conditions" />} />
                  <Route path="/return-policy" element={<PolicyPage title="Return Policy" />} />
                  <Route path="/shipping-policy" element={<PolicyPage title="Shipping Policy" />} />
                  <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="*"            element={<NotFound />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route path="/admin"            element={<AdminDashboard />} />
                  <Route path="/admin/products"   element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/orders"     element={<AdminOrders />} />
                  <Route path="/admin/contacts"   element={<AdminContacts />} />
                </Route>
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}