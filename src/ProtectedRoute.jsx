import { Navigate } from "react-router-dom";
import { getRefreshToken } from "./auth/auth";

function ProtectedRoute({ children }) {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

