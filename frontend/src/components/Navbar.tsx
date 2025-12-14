import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 dark:bg-gray-950 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sreekar's Sweets & Desserts
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hidden md:block hover:text-primary transition-colors">Shop</Link>
              <Link to="/cart" className="relative hover:text-primary transition-colors">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
              {user?.isAdmin && <Link to="/admin" className="hover:text-secondary transition-colors">Admin</Link>}
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-colors text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-primary hover:bg-purple-700 rounded transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
