import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="page-loading" style={{ padding: '4rem', textAlign: 'center', color: '#334155' }}>
        Verifying your session...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}
