import { Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

