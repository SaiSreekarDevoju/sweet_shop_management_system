import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Payment: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const totalAmount = (cartTotal * 1.05).toFixed(2);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process purchases sequentially or in parallel
      // Ideally this should be a single 'create order' endpoint
      const promises = cartItems.map(item => 
        api.post(`/sweets/${item.id}/purchase`, { quantity: item.quantity })
      );
      
      await Promise.all(promises);
      
      toast.success('Payment successful! Order placed.');
      clearCart();
      navigate('/profile');
    } catch (error: any) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Checkout</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Payment Information</h2>
        
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Total Amount to Pay:</p>
          <p className="text-4xl font-bold text-primary">₹{totalAmount}</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              {['Card', 'UPI', 'NetBanking', 'COD'].map((method) => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method.toLowerCase())}
                  className={`p-4 border rounded cursor-pointer text-center transition-colors ${
                    paymentMethod === method.toLowerCase()
                      ? 'border-primary bg-purple-50 dark:bg-purple-900/20 text-primary'
                      : 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-primary'
                  }`}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4 animate-fadeIn">
              <input 
                type="text" 
                placeholder="Card Number" 
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <input 
                  type="text" 
                  placeholder="CVV" 
                  className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <input 
              type="text" 
              placeholder="Enter UPI ID (e.g. user@upi)" 
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Make Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
