import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/payment');
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://via.placeholder.com/150';
    return `${api.defaults.baseURL?.replace('/api', '')}${path}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center mt-20">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Browse Sweets
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 items-center">
              <img 
                src={getImageUrl(item.imageUrl)} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded"
              />
              
              <div className="flex-1">
                <h3 className="text-xl font-bold dark:text-white">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="font-bold dark:text-white w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                >
                  +
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Remove Item"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h2>
          
          <div className="flex justify-between mb-2 dark:text-gray-300">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 dark:text-gray-300">
            <span>Tax (5%)</span>
            <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
          </div>
          <div className="border-t dark:border-gray-600 pt-4 flex justify-between font-bold text-lg dark:text-white mb-6">
            <span>Total</span>
            <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
