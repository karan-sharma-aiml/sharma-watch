import React from "react";
import { Link } from "react-router-dom";
import { FiX, FiShoppingBag, FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  formatPrice,
  getProductImage,
  getMainProductImage,
} from "../utils/helpers";
import EmptyState from "./EmptyState";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateCart, removeFromCart } = useCart();
  const { addToast } = useToast();
  const items = cart.items || [];

  const handleUpdate = async (productId, qty) => {
    if (qty < 1) return;
    const res = await updateCart(productId, qty);
    if (!res.success) addToast(res.message, "error");
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (res.success) addToast("Item removed from cart.", "info");
    else addToast(res.message, "error");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-dark-400 border-l border-white/5
          z-50 flex flex-col shadow-2xl
          transition-transform duration-350 ease-out
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-gold-400" size={20} />
            <h2 className="font-serif text-lg font-semibold text-white">
              Your Cart
            </h2>
            {items.length > 0 && (
              <span className="bg-gold-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {items.length === 0 ? (
            <EmptyState
              icon={FiShoppingBag}
              title="Cart is empty"
              description="Add some watches to your cart."
              actionLabel="Shop Now"
              actionTo="/products"
              onAction={closeCart}
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const p = item.product;

                console.log("CART PRODUCT =", p);

                if (!p) return null;

                const finalPrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;

                return (
                  <div
                    key={p._id}
                    className="flex gap-3 p-3 bg-dark-300 rounded-xl border border-white/5"
                  >
                    <Link to={`/products/${p._id}`} onClick={closeCart}>
                      <img
                        src={getMainProductImage(p.images)}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                        onError={(e) => {
                          e.target.src = getProductImage("");
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${p._id}`}
                        onClick={closeCart}
                        className="text-white text-sm font-medium leading-snug hover:text-gold-300 transition-colors line-clamp-2 block"
                      >
                        {p.name}
                      </Link>
                      <p className="text-gold-400 text-sm font-bold mt-1">
                        {formatPrice(finalPrice)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleUpdate(p._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-7 text-center text-white text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdate(p._id, item.quantity + 1)
                            }
                            disabled={item.quantity >= (p.stock || 99)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(p._id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Subtotal</span>
              <span className="text-gradient-gold font-bold text-lg">
                {formatPrice(cart.totalAmount || 0)}
              </span>
            </div>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block w-full bg-gold-400 hover:bg-gold-300 text-black text-sm font-bold text-center py-3 rounded-xl transition-colors"
            >
              View Cart & Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-gray-400 hover:text-white text-sm text-center transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
