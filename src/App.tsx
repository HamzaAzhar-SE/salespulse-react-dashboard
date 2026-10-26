import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<PlaceholderPage title="Dashboard" note="KPI cards and charts arrive in Step 3." />} />
          <Route path="orders" element={<PlaceholderPage title="Orders" note="The orders table arrives in Step 4." />} />
          <Route path="customers" element={<PlaceholderPage title="Customers" note="Customer pages arrive in Step 5." />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
