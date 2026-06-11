import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, deniedMessage, children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ accessDeniedMessage: deniedMessage || "Accès refusé" }}
      />
    );
  }

  return children;
}
