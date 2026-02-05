import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function PrivateRoute({ children, roles }) {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) {
  return <div>Cargando sesión...</div>;
}


  if (!usuario) {
    return <Navigate to="/login" />;
  }

  return children;
}
