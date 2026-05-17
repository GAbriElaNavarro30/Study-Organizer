import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  // Busca el token en las cookies de la petición
  const token = req.cookies.token;

  // Si no existe token, rechaza la petición antes de llegar al controlador
  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  // Si existe, verifica que sea válido y no haya expirado
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.usuario = decoded; // Guarda los datos del usuario para usarse en el controlador
    next(); // Token válido, pasa la petición 
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
}; 
