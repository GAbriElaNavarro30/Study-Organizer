import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import perfilPredeterminado from "../assets/imagenes/perfil-usuario.png";

export const AuthContext = createContext();

const esFotoValida = (foto) => {
  if (!foto) return false;

  const invalidas = [
    "null",
    "undefined",
    "/uploads/null",
    "/uploads/undefined",
  ];

  return !invalidas.some(v => foto.includes(v));
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const ROLES_MAP = {
    1: "Administrador",
    2: "Usuario",
    3: "Tutor",
  };


  // NORMALIZADOR CENTRAL
  const normalizarUsuario = (user) => {
    if (!user) return null;

    return {
      ...user,

      rol: user.rol, // id_rol (number)
      rol_texto: ROLES_MAP[user.rol] || "Sin rol",

      foto_perfil: esFotoValida(user.foto_perfil)
        ? user.foto_perfil
        : perfilPredeterminado,
      foto_portada: esFotoValida(user.foto_portada)
        ? user.foto_portada
        : "/portada.jpg",
    };
  };


  // Verificar sesión
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await api.get("/usuarios/me");
        setUsuario(normalizarUsuario(res.data.usuario));
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
      await api.post("/usuarios/logout");
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      setUsuario(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario: (user) => setUsuario(normalizarUsuario(user)),
        loading,
        logout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
