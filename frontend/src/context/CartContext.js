import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('techmart_cart')) || []; } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('techmart_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) {
        const updated = prev.map(i =>
          i.product === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
        toast.success(`Updated quantity in cart`);
        return updated;
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, {
        product: product._id, name: product.name,
        price: product.salePrice || product.price,
        originalPrice: product.price, salePrice: product.salePrice,
        image: product.images?.[0]?.url || '',
        stock: product.stock, quantity, slug: product.slug,
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product !== productId));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.product === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => { setCart([]); localStorage.removeItem('techmart_cart'); };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal > 5000 ? 0 : (cart.length > 0 ? 150 : 0);
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal, shippingFee, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};
