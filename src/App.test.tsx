import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the SalesPulse heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /salespulse/i })).toBeInTheDocument();
  });
});
