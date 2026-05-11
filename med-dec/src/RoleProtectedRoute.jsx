import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, initialized, user } = useAuth();

  if (!initialized) {
    return (
      <div className="page-loading" style={{ padding: '4rem', textAlign: 'center', color: '#334155' }}>
        Verifying your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
