import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  lowStock?: boolean;
}

interface SweetCardProps {
  sweet: Sweet;
  onUpdate: () => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onUpdate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const handleIncrement = () => {
    if (qty < sweet.quantity) {
      setQty(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(sweet, qty);
    setQty(1); // Reset to 1 after adding
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/sweets/${sweet.id}`);
      toast.success('Sweet deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete sweet');
    }
  };

  const handleEdit = () => {
    navigate('/admin', { state: { sweet } });
  };

  const isOutOfStock = sweet.quantity === 0;

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://via.placeholder.com/150';
    return `${api.defaults.baseURL?.replace('/api', '')}${path}`;
  };

  return (
    <div className="group relative border dark:border-gray-700 p-4 rounded-card shadow-card bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {isOutOfStock && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
          <span className="text-white text-xl font-bold border-4 border-white p-2 rotate-12 uppercase">Out of Stock</span>
        </div>
      )}
      
      <div className="relative h-48 mb-4 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
        <img 
          src={getImageUrl(sweet.imageUrl)} 
          alt={sweet.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold dark:text-white">{sweet.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">{sweet.category}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-full font-bold">
          ₹{sweet.price.toFixed(2)}
        </div>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between">
        <p className="text-sm dark:text-gray-300">
          Stock: <span className="font-semibold">{sweet.quantity}</span>
        </p>
        {sweet.quantity > 0 && sweet.quantity < 5 && (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded animate-pulse">
            Low Stock
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2 flex-wrap relative z-20">
        {!isOutOfStock && (
          <div className="flex items-center border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={handleDecrement}
              className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l transition-colors dark:text-white"
              disabled={qty <= 1}
            >
              -
            </button>
            <span className="px-3 py-2 font-medium w-10 text-center dark:text-white">{qty}</span>
            <button
              onClick={handleIncrement}
              className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r transition-colors dark:text-white"
              disabled={qty >= sweet.quantity}
            >
              +
            </button>
          </div>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
            isOutOfStock 
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-primary hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
          }`}
        >
          Add to Cart
        </button>

        {user?.isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              aria-label="Edit sweet"
              title="Edit Item"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              aria-label="Delete sweet"
              title="Delete Item"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SweetCard;
