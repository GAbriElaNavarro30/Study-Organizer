import { useState } from "react";

export function useRegistro() {
  // ================== UI ==================
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [errores, setErrores] = useState({});

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
    contrasena: "",
    confirmarContrasena: "",
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

  // ============= VER SI HAY DATOS INGRESADOS ==============
  const hayDatosIngresados = () => {
    return Object.values(formData).some(value => value !== "");
  };

  // ================== REGISTRO ==================
  const registrarUsuario = async () => {
    const erroresFrontend = {};

    // ============== FECHA FORMATEADA =============
    const fechaFormateada =
      `${fechaNacimiento.year}-${String(fechaNacimiento.month).padStart(2, "0")}-${String(fechaNacimiento.day).padStart(2, "0")}`;

    // ======= VALIDAR CONTRASEÑA COINCIDE =========
    if (formData.contrasena !== formData.confirmarContrasena) {
      erroresFrontend.confirmarContrasena = "Las contraseñas no coinciden";
    }

    // ================== MANDAR DATOS AL BACKEND ==================
    const usuario = {
      nombre_usuario: formData.nombre_usuario,
      telefono: formData.telefono,
      correo_electronico: formData.correo_electronico,
      contrasena: formData.contrasena,
      genero: formData.genero,
      fecha_nacimiento: fechaFormateada,
      id_rol: formData.id_rol,
    };

    // ================== FETCH ==================
    const response = await fetch(
      "http://localhost:3000/usuarios/crear-usuario",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      }
    );

    const data = await response.json();

    // ================== ERRORES BACKEND ==================
    if (!response.ok) {
      const erroresBackend = {};

      if (data.errors) {
        data.errors.forEach((err) => {
          erroresBackend[err.path] = err.message;
        });
      }

      setErrores({
        ...erroresFrontend,
        ...erroresBackend,
      });

      return;
      // { success: false, message: "Error al registrar la cuenta" };
    }

    // ================== SOLO FRONTEND ==================
    if (Object.keys(erroresFrontend).length > 0) {
      setErrores(erroresFrontend);
      return {
        success: false,
        message: "Errores de validación"
      };
    }

    setErrores({});
    return { success: true, data };

  };

  // ======= EXPORTAR DATOS DEL HOOK PARA LA PAGE REGISTRO.JSX ======
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
    errores,
    hayDatosIngresados,
  };
}