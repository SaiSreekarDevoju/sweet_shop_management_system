import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const Admin: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sweets');
      setSweets(res.data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    if (editingSweet) {
      setFormData({
        name: editingSweet.name,
        category: editingSweet.category,
        price: editingSweet.price.toString(),
        quantity: editingSweet.quantity.toString()
      });
      setItemImage(null); // Reset image input on edit mode enter
    } else {
      setFormData({ name: '', category: '', price: '', quantity: '' });
      setItemImage(null);
    }
  }, [editingSweet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemImage(e.target.files[0]);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverImage) {
      toast.error('Please select a cover image first');
      return;
    }
    
    const data = new FormData();
    data.append('image', coverImage);

    try {
      await api.post('/sweets/cover', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Shop cover image updated successfully');
      setCoverImage(null);
      // Optional: Trigger a refresh of the Navbar or Dashboard if they use this image
      window.location.reload(); 
    } catch (error) {
      toast.error('Failed to upload cover image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    if (itemImage) {
      data.append('image', itemImage);
    }

    try {
      if (editingSweet) {
        await api.put(`/sweets/${editingSweet.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Item updated successfully');
        setEditingSweet(null);
      } else {
        await api.post('/sweets', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Item added successfully');
      }
      fetchSweets();
      setFormData({ name: '', category: '', price: '', quantity: '' });
      setItemImage(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || (editingSweet ? 'Failed to update item' : 'Failed to add item'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/sweets/${id}`);
      toast.success('Item deleted successfully');
      fetchSweets();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>
      
      {/* Cover Image Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Shop Cover Image</h2>
        <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Upload a banner image for the shop (Recommended size: 851 × 315 px)</p>
        <div className="flex gap-4 items-center">
            <input 
                type="file" 
                accept="image/*"
                onChange={handleCoverFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-purple-700
                "
            />
            <button 
                onClick={handleCoverUpload}
                disabled={!coverImage}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Upload Cover
            </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">{editingSweet ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input
                id="category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 mb-1">Price</label>
              <input
                id="price"
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="image" className="block text-gray-700 dark:text-gray-300 mb-1">Item Image</label>
                <input 
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 dark:file:bg-gray-700 file:text-indigo-700 dark:file:text-gray-300
                      hover:file:bg-indigo-100 dark:hover:file:bg-gray-600
                    "
                />
                {editingSweet && editingSweet.imageUrl && !itemImage && (
                    <p className="text-xs text-gray-500 mt-1">Current image: {editingSweet.imageUrl}</p>
                )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white p-2 rounded hover:bg-purple-700 transition-colors font-medium"
            >
              {editingSweet ? 'Update Item' : 'Add Item'}
            </button>
            {editingSweet && (
              <button 
                type="button" 
                onClick={() => setEditingSweet(null)} 
                className="px-6 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700">
        <h2 className="text-xl font-semibold p-6 border-b dark:border-gray-700 dark:text-white">Inventory Management</h2>
        
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div role="status" aria-label="loading" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Name</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Category</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Price</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">Stock</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sweets.map((sweet) => (
                  <tr key={sweet.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 dark:text-white font-medium">
                        <div className="flex items-center gap-3">
                            {sweet.imageUrl && (
                                <img src={`${api.defaults.baseURL?.replace('/api', '')}${sweet.imageUrl}`} alt={sweet.name} className="w-10 h-10 rounded object-cover" />
                            )}
                            {sweet.name}
                        </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{sweet.category}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">₹{sweet.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        sweet.quantity === 0 ? 'bg-red-100 text-red-800' : 
                        sweet.quantity < 5 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {sweet.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(sweet)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit Item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(sweet.id)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Item"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {sweets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No items found. Add some above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
