import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import SweetCard from '../components/SweetCard';
import SearchFilter from '../components/SearchFilter';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchSweets = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const endpoint = Object.keys(searchParams).length ? '/sweets/search' : '/sweets';
      const res = await api.get(endpoint, { params: searchParams });
      setSweets(res.data);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      setError('Failed to load sweets. Please try again later.');
      toast.error('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  // Pagination Logic
  const indexOfLastSweet = currentPage * itemsPerPage;
  const indexOfFirstSweet = indexOfLastSweet - itemsPerPage;
  const currentSweets = sweets.slice(indexOfFirstSweet, indexOfLastSweet);
  const totalPages = Math.ceil(sweets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">Sweet Shop Inventory</h1>
      <SearchFilter onSearch={fetchSweets} />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div role="status" aria-label="loading" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSweets.map((sweet: any) => (
              <SweetCard key={sweet.id} sweet={sweet} onUpdate={fetchSweets} />
            ))}
          </div>
          
          {sweets.length === 0 && (
            <p className="text-center text-gray-500 mt-10 text-lg dark:text-gray-400">No sweets found matching your criteria.</p>
          )}

          {/* Pagination Controls */}
          {sweets.length > itemsPerPage && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 dark:text-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 dark:text-white"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
