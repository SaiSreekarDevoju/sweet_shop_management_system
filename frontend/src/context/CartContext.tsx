import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: any, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (sweet: any, qty: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === sweet.id);
      if (existing) {
        if (existing.quantity + qty > sweet.quantity) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        toast.success('Quantity updated in cart');
        return prev.map(item => 
          item.id === sweet.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      if (qty > sweet.quantity) {
        toast.error('Cannot add more than available stock');
        return prev;
      }
      toast.success('Added to cart');
      return [...prev, { 
        id: sweet.id, 
        name: sweet.name, 
        price: sweet.price, 
        quantity: qty, 
        maxStock: sweet.quantity,
        imageUrl: sweet.imageUrl 
      }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from cart');
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (quantity > item.maxStock) {
          toast.error(`Only ${item.maxStock} available`);
          return item;
        }
        if (quantity < 1) return item;
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
