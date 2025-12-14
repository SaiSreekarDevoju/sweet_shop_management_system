import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Admin from '../pages/Admin';
import { AuthProvider } from '../context/AuthContext';
import api from '../api/axios';

vi.mock('../api/axios');
vi.mock('react-hot-toast');

// Mock useAuth to simulate admin user
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 1, username: 'admin', isAdmin: true },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    })
  };
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Admin Component', () => {
  it('renders add sweet form', () => {
    renderWithProviders(<Admin />);
    expect(screen.getByText('Add New Sweet')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('submits new sweet', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 1, name: 'New Sweet' } });

    renderWithProviders(<Admin />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Sweet' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Candy' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Sweet' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/sweets', {
        name: 'New Sweet',
        category: 'Candy',
        price: '5',
        quantity: '100'
      });
    });
  });
});
