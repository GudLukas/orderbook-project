// Create: src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/api";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
