import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Blocks an admin area when the signed-in role has no permission for it. */
export function AreaRoute({ area }: { area: string }) {
  const { can } = useAuth();
  if (!can(area)) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
