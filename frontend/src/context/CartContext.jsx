import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart]           = useState({ items: [], totalAmount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading]     = useState(false);

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await cartAPI.get();
      const cartItems = data.data.cart?.items || [];
      if (cartItems.length > 0) {
        console.log('📦 CART ITEM (First):', {
          name: cartItems[0].product?.name,
          price: cartItems[0].product?.price,
          salePrice: cartItems[0].product?.salePrice,
          isSaleActive: cartItems[0].product?.isSaleActive,
          quantity: cartItems[0].quantity,
        });
      }
      setCart({
        items: cartItems,
        totalAmount: data.data.totalAmount || 0,
      });
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart({ items: [], totalAmount: 0 });
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) return { success: false, needAuth: true };
    setLoading(true);
    try {
      await cartAPI.add(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart.' };
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (productId, quantity) => {
    setLoading(true);
    try {
      await cartAPI.update(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Remove failed.' };
    } finally {
      setLoading(false);
    }
  };

  const toggleCart  = ()   => setIsCartOpen((p) => !p);
  const openCart    = ()   => setIsCartOpen(true);
  const closeCart   = ()   => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      cart, cartCount, isCartOpen, loading,
      fetchCart, addToCart, updateCart, removeFromCart,
      toggleCart, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};