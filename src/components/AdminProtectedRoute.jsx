import { Navigate, useLocation } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('admin_token');
  let user = null;
  try {
    const stored = localStorage.getItem('admin_user');
    user = stored ? JSON.parse(stored) : null;
  } catch {
    user = null;
  }

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
