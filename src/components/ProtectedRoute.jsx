import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // if no user in localStorage, send them to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
