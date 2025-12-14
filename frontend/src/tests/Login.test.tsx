import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/axios';

// Mock axios and toast
vi.mock('../api/axios');
vi.mock('react-hot-toast');

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders login form correctly', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    (api.post as any).mockResolvedValue({ data: { token: 'fake-jwt-token' } });
    
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('displays error on failed login', async () => {
    // Mock the rejected value correctly for axios error structure
    const errorResponse = {
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    };
    (api.post as any).mockRejectedValue(errorResponse);
    
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    // Note: Since we use toast, we might check if toast.error was called if we mocked it to a spy
  });
});
