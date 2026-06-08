import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading]   = useState(false);

  const wishlistIds = wishlist.products?.map((p) =>
    typeof p === 'string' ? p : p._id
  ) || [];

  const isInWishlist = (productId) => wishlistIds.includes(productId);
  const wishlistCount = wishlist.products?.length || 0;

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await wishlistAPI.get();
      const wishlistData = data.data.wishlist || { products: [] };
      if (wishlistData.products && wishlistData.products.length > 0) {
        const firstProduct = wishlistData.products[0];
        console.log('❤️ WISHLIST ITEM (First):', {
          name: firstProduct.name,
          price: firstProduct.price,
          salePrice: firstProduct.salePrice,
          isSaleActive: firstProduct.isSaleActive,
        });
      }
      setWishlist(wishlistData);
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setWishlist({ products: [] });
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return { success: false, needAuth: true };
    setLoading(true);
    try {
      await wishlistAPI.add(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setLoading(true);
    try {
      await wishlistAPI.remove(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed.' };
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) return removeFromWishlist(productId);
    return addToWishlist(productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist, wishlistCount, loading,
      isInWishlist, fetchWishlist,
      addToWishlist, removeFromWishlist, toggleWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};