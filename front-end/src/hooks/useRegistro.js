import { useState, useEffect } from "react";

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    // LIMPIAR ERROR DE FECHA AL CAMBIAR
    if (errores.fecha_nacimiento) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores.fecha_nacimiento;
        return nuevosErrores;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // LIMPIAR ERROR DEL CAMPO QUE ESTÁ ESCRIBIENDO
    if (errores[name]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }

    // LIMPIAR ERROR DE CONFIRMAR CONTRASEÑA SI ESTÁ ESCRIBIENDO EN CONTRASEÑA
    if (name === "contrasena" && errores.confirmarContrasena) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores.confirmarContrasena;
        return nuevosErrores;
      });
    }
  };

  // ============= VER SI HAY DATOS INGRESADOS ==============
  const hayDatosIngresados = () => {
    return Object.values(formData).some(value => value !== "");
  };

  // ============== VERIFICAR CORREO DISPONIBLE ==============
  const verificarCorreoDisponible = async (correo) => {
    try {
      const response = await fetch(
        "http://localhost:3000/usuarios/verificar-correo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo_electronico: correo }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al verificar correo:", error);
      return { disponible: true };
    }
  };

  // ============== VERIFICAR TELÉFONO DISPONIBLE ==============
  const verificarTelefonoDisponible = async (telefono) => {
    try {
      const response = await fetch(
        "http://localhost:3000/usuarios/verificar-telefono",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telefono: telefono }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al verificar teléfono:", error);
      return { disponible: true };
    }
  };

  // ================== VALIDACIONES FRONTEND CAMPO Y VACÍO ==================
  const validarFormulario = async () => {
    const erroresFrontend = {};

    // ============== NOMBRE ==============
    if (!formData.nombre_usuario || !formData.nombre_usuario.trim()) {
      erroresFrontend.nombre_usuario = "El nombre es obligatorio";
    } else {
      const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
      if (!nombreRegex.test(formData.nombre_usuario)) {
        erroresFrontend.nombre_usuario = "El nombre solo puede contener letras, espacios y acentos";
      }
    }

    // ============== CORREO ==============
    if (!formData.correo_electronico || !formData.correo_electronico.trim()) {
      erroresFrontend.correo_electronico = "El correo electrónico es obligatorio";
    } else {
      const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

      if (!correoRegex.test(formData.correo_electronico)) {
        erroresFrontend.correo_electronico = "El correo electrónico no cumple con un formato válido";
      } else {
        const parteUsuario = formData.correo_electronico.split("@")[0];
        if (parteUsuario.length > 64) {
          erroresFrontend.correo_electronico = "El correo no debe superar 64 caracteres antes del @";
        } else {
          // VERIFICAR SI EL CORREO YA EXISTE EN LA BD
          const resultadoCorreo = await verificarCorreoDisponible(formData.correo_electronico);
          if (!resultadoCorreo.disponible) {
            erroresFrontend.correo_electronico = resultadoCorreo.message;
          }
        }
      }
    }

    // ============== ROL ==============
    if (!formData.id_rol) {
      erroresFrontend.id_rol = "El rol es obligatorio";
    }

    // ============== TELÉFONO ==============
    if (!formData.telefono || !formData.telefono.trim()) {
      erroresFrontend.telefono = "El teléfono es obligatorio";
    } else {
      const telefonoRegex = /^[0-9]{10}$/;
      if (!telefonoRegex.test(formData.telefono)) {
        erroresFrontend.telefono = "El teléfono debe tener 10 dígitos numéricos";
      } else {
        // VERIFICAR SI EL TELÉFONO YA EXISTE EN LA BD
        const resultadoTelefono = await verificarTelefonoDisponible(formData.telefono);
        if (!resultadoTelefono.disponible) {
          erroresFrontend.telefono = resultadoTelefono.message;
        }
      }
    }

    // ============== GÉNERO ==============
    if (!formData.genero || !formData.genero.trim()) {
      erroresFrontend.genero = "El género es obligatorio";
    } else {
      const generosValidos = ["mujer", "hombre", "otro"];
      if (!generosValidos.includes(formData.genero)) {
        erroresFrontend.genero = "El género seleccionado no es válido";
      }
    }

    // ============== CONTRASEÑA ==============
    if (!formData.contrasena || !formData.contrasena.trim()) {
      erroresFrontend.contrasena = "La contraseña es obligatoria";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

      if (!passwordRegex.test(formData.contrasena)) {
        erroresFrontend.contrasena = "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
      }
    }

    // ============== CONFIRMAR CONTRASEÑA ==============
    if (!formData.confirmarContrasena) {
      erroresFrontend.confirmarContrasena = "Debes confirmar la contraseña";
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      erroresFrontend.confirmarContrasena = "Las contraseñas no coinciden";
    }

    // ============== FECHA DE NACIMIENTO ==============
    if (!fechaNacimiento.day || !fechaNacimiento.month || !fechaNacimiento.year) {
      erroresFrontend.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const fecha = new Date(fechaNacimiento.year, fechaNacimiento.month - 1, fechaNacimiento.day);
      const hoy = new Date();

      // Fecha inválida
      if (isNaN(fecha.getTime())) {
        erroresFrontend.fecha_nacimiento = "La fecha de nacimiento no es válida";
      } else {
        // No hoy ni futura
        if (fecha >= hoy) {
          erroresFrontend.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy ni una fecha futura";
        } else {
          // Edad mínima
          const edadMinima = 13;
          const fechaMinima = new Date(
            hoy.getFullYear() - edadMinima,
            hoy.getMonth(),
            hoy.getDate()
          );

          if (fecha > fechaMinima) {
            erroresFrontend.fecha_nacimiento = `Debes tener al menos ${edadMinima} años`;
          }

          // Edad máxima
          const edadMaxima = 120;
          const fechaMaxima = new Date(
            hoy.getFullYear() - edadMaxima,
            hoy.getMonth(),
            hoy.getDate()
          );

          if (fecha < fechaMaxima) {
            erroresFrontend.fecha_nacimiento = `La edad no puede ser mayor a ${edadMaxima} años`;
          }
        }
      }
    }

    return erroresFrontend;
  };

  // ================== REGISTRO ==================
  const registrarUsuario = async () => {
    // ============== VALIDAR FRONTEND PRIMERO (INCLUYE VERIFICACIÓN DE DUPLICADOS) ==============
    const erroresFrontend = await validarFormulario();

    if (Object.keys(erroresFrontend).length > 0) {
      setErrores(erroresFrontend);
      return;
    }

    // ============== FECHA FORMATEADA ==============
    const fechaFormateada =
      `${fechaNacimiento.year}-${String(fechaNacimiento.month).padStart(2, "0")}-${String(fechaNacimiento.day).padStart(2, "0")}`;

    // ============== PREPARAR DATOS ==============
    const usuario = {
      nombre_usuario: formData.nombre_usuario.trim(),
      telefono: formData.telefono.trim(),
      correo_electronico: formData.correo_electronico.trim().toLowerCase(),
      contrasena: formData.contrasena,
      genero: formData.genero,
      fecha_nacimiento: fechaFormateada,
      id_rol: formData.id_rol,
    };

    // ============== ENVIAR AL BACKEND ==============
    try {
      const response = await fetch(
        "http://localhost:3000/usuarios/crear-usuario",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuario),
        }
      );

      const data = await response.json();

      // ============== SI HAY ERROR EN BACKEND ==============
      if (!response.ok) {
        console.error("Error del backend:", data.errors);

        return {
          success: false,
          message: data.message || "Error al registrar la cuenta. Por favor intenta de nuevo."
        };
      }

      // ============== ÉXITO ==============
      setErrores({});
      return { success: true, data };

    } catch (error) {
      console.error("Error de red:", error);
      return {
        success: false,
        message: "Error de conexión. Por favor intenta de nuevo."
      };
    }
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