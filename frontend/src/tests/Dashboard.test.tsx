import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/axios';

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

describe('Dashboard Component', () => {
  const mockSweets = [
    { id: 1, name: 'Choco Bar', category: 'Chocolate', price: 2.5, quantity: 10 },
    { id: 2, name: 'Lollipop', category: 'Candy', price: 1.0, quantity: 0 }
  ];

  it('renders sweets list and handles out of stock', async () => {
    (api.get as any).mockResolvedValue({ data: mockSweets });

    renderWithProviders(<Dashboard />);

    // Initial loading state might be shown
    expect(screen.getByRole('status') || screen.container.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Choco Bar')).toBeInTheDocument();
      expect(screen.getByText('Lollipop')).toBeInTheDocument();
    });

    // Check price formatting
    expect(screen.getByText('$2.50')).toBeInTheDocument();

    // Check buttons
    const buttons = screen.getAllByText('Purchase');
    expect(buttons[0]).not.toBeDisabled(); // Choco Bar (Stock 10)
    expect(buttons[1]).toBeDisabled(); // Lollipop (Stock 0)
    
    // Check out of stock label
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    (api.get as any).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load sweets/i)).toBeInTheDocument();
    });
  });
});
