import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export function renderApp(route = '/') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
