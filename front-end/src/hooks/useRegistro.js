import { useState } from "react";
import bcrypt from "bcryptjs";

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

  // ================== REGISTRO ==================
  const registrarUsuario = async () => {
    const nuevosErrores = {};

    // ================== VALIDAR VACÍOS ==================
    if (!formData.nombre_usuario.trim()) {
      nuevosErrores.nombre_usuario = "El nombre es obligatorio";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    }

    if (!formData.correo_electronico.trim()) {
      nuevosErrores.correo_electronico = "El correo electrónico es obligatorio";
    }

    if (!formData.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria";
    }

    if (!formData.confirmarContrasena) {
      nuevosErrores.confirmarContrasena =
        "Confirma tu contraseña";
    }

    if (!formData.genero) {
      nuevosErrores.genero = "El género es obligatorio";
    }

    if (!formData.id_rol) {
      nuevosErrores.id_rol = "El rol es obligatorio";
    }

    if (
      !fechaNacimiento.day ||
      !fechaNacimiento.month ||
      !fechaNacimiento.year
    ) {
      nuevosErrores.fecha_nacimiento =
        "Completa la fecha de nacimiento";
    }

    // Si hay vacíos, detener aquí
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // ================== VALIDAR FORMATOS ==================

    // Nombre
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
    if (!nombreRegex.test(formData.nombre_usuario)) {
      nuevosErrores.nombre_usuario =
        "El nombre solo puede contener letras, espacios, puntos y acentos";
    }

    // Teléfono
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(formData.telefono)) {
      nuevosErrores.telefono =
        "El teléfono debe tener 10 dígitos numéricos";
    }

    // Correo electrónico
    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!correoRegex.test(formData.correo_electronico)) {
      nuevosErrores.correo_electronico =
        "El correo electrónico no cumple con un formato válido y profesional";
    }

    const parteUsuario = formData.correo_electronico.split("@")[0];
    if (parteUsuario.length > 64) {
      nuevosErrores.correo_electronico =
        "El correo no debe superar 64 caracteres antes del @";
    }

    // Contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

    if (!passwordRegex.test(formData.contrasena)) {
      nuevosErrores.contrasena =
        "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      nuevosErrores.confirmarContrasena =
        "Las contraseñas no coinciden";
    }

    // Fecha de Nacimiento
    const pad = (n) => String(n).padStart(2, "0");
    const fecha = `${fechaNacimiento.year}-${pad(fechaNacimiento.month)}-${pad(fechaNacimiento.day)}`;
    const fechaNacimientoDate = new Date(fecha);
    const hoy = new Date();

    // Validar que no sea hoy ni futuro
    if (fechaNacimientoDate >= hoy) {
      nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy ni una fecha futura";
    }

    // Validar edad mínima (ejemplo: 13 años)
    const edadMinima = 13;
    const fechaMinima = new Date(
      hoy.getFullYear() - edadMinima,
      hoy.getMonth(),
      hoy.getDate()
    );

    if (fechaNacimientoDate > fechaMinima) {
      nuevosErrores.fecha_nacimiento = `Debes tener al menos ${edadMinima} años`;
    }

    // Validar edad máxima (ejemplo: no más de 120 años)
    const edadMaxima = 120;
    const fechaMaxima = new Date(
      hoy.getFullYear() - edadMaxima,
      hoy.getMonth(),
      hoy.getDate()
    );

    if (fechaNacimientoDate < fechaMaxima) {
      nuevosErrores.fecha_nacimiento = `La edad no puede ser mayor a ${edadMaxima} años`;
    }



    // Si hay errores de formato
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    

    // ================== HASH PASSWORD ==================
    const salt = bcrypt.genSaltSync(10); // factor de costo
    const hashedPassword = bcrypt.hashSync(formData.contrasena, salt);

    const usuario = {
      nombre_usuario: formData.nombre_usuario,
      telefono: formData.telefono,
      correo_electronico: formData.correo_electronico,
      contrasena: hashedPassword, // ahora mandas el hash
      genero: formData.genero,
      fecha_nacimiento: fecha,
      id_rol: formData.id_rol,
      foto_perfil: "/avatars/perfil-usuario.png",
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

      setErrores(erroresBackend);
      return;
    }

    setErrores({});
    return { success: true, data };

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
    errores,
  };
}