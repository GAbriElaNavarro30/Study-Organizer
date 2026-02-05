import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al recargar
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await api.get("/usuarios/me");
        setUsuario(res.data.usuario);
      } catch (error) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  // ✅ LOGOUT REAL
  const logout = async () => {
    try {
      await api.post("/usuarios/logout"); // borra cookie
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      setUsuario(null);   // 🔥 ESTO ES CLAVE
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        loading,
        setLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
