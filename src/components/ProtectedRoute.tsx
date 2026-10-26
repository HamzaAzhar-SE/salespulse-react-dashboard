import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Shows the child routes only for logged-in users. Everyone else goes to /login. */
export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
