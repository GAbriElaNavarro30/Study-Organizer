import { useState } from "react";

export function useRegistro() {
  // ================== UI ==================
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // ================== FECHA ==================
  const [fechaNacimiento, setFechaNacimiento] = useState({
    day: "",
    month: "",
    year: "",
  });

  // ================== FORM DATA ==================
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    telefono: "",
    correo_electronico: "",
    contraseña: "",
    confirmarContraseña: "",
    genero: "",
    id_rol: "",
  });

  // ================== OPCIONES ==================
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  );

  // ================== HANDLERS ==================
  const handleFechaChange = (d, m, y) => {
    setFechaNacimiento({ day: d, month: m, year: y });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================== REGISTRO ==================
  const registrarUsuario = async () => {
    // Construir fecha en formato YYYY-MM-DD
    const fecha = `${fechaNacimiento.year}-${fechaNacimiento.month}-${fechaNacimiento.day}`;

    // Validación básica
    if (formData.contraseña !== formData.confirmarContraseña) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const usuario = {
      nombre_usuario: formData.nombre_usuario,
      telefono: formData.telefono,
      correo_electronico: formData.correo_electronico,
      contraseña: formData.contraseña,
      genero: formData.genero,
      fecha_nacimiento: fecha,
      id_rol: formData.id_rol,
    };

    const response = await fetch("http://localhost:5000/usuarios/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    const data = await response.json();
    return data;
  };

  // ================== EXPORT ==================
  return {
    mostrarPassword,
    setMostrarPassword,
    mostrarConfirmPassword,
    setMostrarConfirmPassword,
    fechaNacimiento,
    days,
    months,
    years,
    handleFechaChange,
    formData,
    handleChange,
    registrarUsuario,
  };
}
