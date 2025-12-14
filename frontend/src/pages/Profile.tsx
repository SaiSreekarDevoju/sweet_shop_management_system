import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Purchase {
  id: number;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  sweet: {
    name: string;
    price: number;
    category: string;
  };
}

interface UserProfile {
  username: string;
  isAdmin: boolean;
  purchases: Purchase[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 mb-8">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400">Username</label>
            <p className="text-lg font-medium dark:text-white">{profile.username}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400">Role</label>
            <p className="text-lg font-medium dark:text-white">{profile.isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b dark:border-gray-700 dark:text-white">Order History</h2>
        
        {profile.purchases.length === 0 ? (
          <p className="p-6 text-gray-500 dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Date</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Item</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Category</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Qty</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Unit Price</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {profile.purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 dark:text-gray-300">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium dark:text-white">{purchase.sweet.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{purchase.sweet.category}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{purchase.quantity}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">₹{purchase.sweet.price.toFixed(2)}</td>
                    <td className="p-4 font-bold text-gray-800 dark:text-white">₹{purchase.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
