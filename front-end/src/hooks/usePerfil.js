import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import fotoPredeterminada from "../assets/imagenes/perfil-usuario.png";

export function usePerfil() {
  const { usuario, setUsuario } = useContext(AuthContext);

  // ================== UI ==================
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarAlert, setMostrarAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success",
    title: "",
    message: ""
  });
  const [errores, setErrores] = useState({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [editarFecha, setEditarFecha] = useState(false);

  // ================== REFERENCIAS ==================
  const fileInputRef = useRef(null);

  // ================== CONSTANTES ==================
  const FOTO_PREDETERMINADA = fotoPredeterminada;
  const PORTADA_PREDETERMINADA = "/portada.jpg";
  const FECHA_VACIA = { day: "", month: "", year: "" };

  const esFotoValida = (foto) => 
    foto && foto !== "null" && foto !== "undefined" && foto !== "" && foto !== "/perfil-usuario.png";

  // ================== ESTADOS DE DATOS ==================
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [descripcion, setDescripcion] = useState(usuario?.descripcion || "");
  const [genero, setGenero] = useState(usuario?.genero || "otro");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(FECHA_VACIA);

  // ================== ESTADOS DE FOTOS ==================
  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const [fotoPortadaFile, setFotoPortadaFile] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(
    esFotoValida(usuario?.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA
  );
  const [fotoPortada, setFotoPortada] = useState(
    esFotoValida(usuario?.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA
  );

  // ================== OPCIONES ==================
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // ================== USEEFFECT PARA CARGAR DATOS ==================
  useEffect(() => {
    if (!usuario) return;

    setNombre(usuario.nombre || "");
    setCorreo(usuario.correo || "");
    setTelefono(usuario.telefono || "");
    setGenero(usuario.genero || "otro");
    setDescripcion(usuario.descripcion || "");
    setFechaNacimiento(usuario.fecha_nacimiento || FECHA_VACIA);
    setFotoPerfil(esFotoValida(usuario.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA);
    setFotoPortada(esFotoValida(usuario.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA);
  }, [usuario]);

  // ================== FUNCIONES DE UTILIDAD ==================
  const limpiarErrores = () => setErrores({});

  const obtenerFotoPerfil = () => {
    if (fotoPerfilFile) {
      return URL.createObjectURL(fotoPerfilFile);
    }

    const foto = usuario?.foto_perfil;
    if (esFotoValida(foto)) {
      return foto;
    }

    return fotoPredeterminada;
  };

  const bloquearInputs = () => {
    const inputs = document.querySelectorAll(
      ".input-editable input, .input-editable select"
    );
    inputs.forEach(input => {
      input.disabled = true;
    });
  };

  const resetearEdicion = () => {
    setEditarFecha(false);
    setPassword("");
    setConfirmarPassword("");
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);
  };

  // ================== HANDLERS DE FOTOS ==================
  const handleCambiarFoto = () => fileInputRef.current.click();

  const handleFotoSeleccionada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoPerfilFile(file);
    setFotoPerfil(URL.createObjectURL(file));
  };

  const handleFotoPortadaSeleccionada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoPortadaFile(file);
    setFotoPortada(URL.createObjectURL(file));
  };

  // ================== HANDLER DE CANCELAR ==================
  const handleCancelar = () => {
    setNombre(usuario?.nombre || "");
    setCorreo(usuario?.correo || "");
    setTelefono(usuario?.telefono || "");
    setDescripcion(usuario?.descripcion || "");
    setGenero(usuario?.genero || "otro");
    setFechaNacimiento(usuario?.fecha_nacimiento || FECHA_VACIA);
    setFotoPerfil(esFotoValida(usuario?.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA);
    setFotoPortada(esFotoValida(usuario?.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA);
    setFotoPerfilFile(null);
    setFotoPortadaFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

    setPassword("");
    setConfirmarPassword("");
    setErrores({});
    bloquearInputs();
    resetearEdicion();
  };

  // ================== HANDLER DE EDICIÓN ==================
  const habilitarEdicion = (e) => {
    const container = e.currentTarget.closest(".input-editable");
    const input = container?.querySelector("input");
    if (input) {
      input.disabled = !input.disabled;
      if (!input.disabled) input.focus();
    }
  };

  // ================== HANDLERS DE CAMBIOS ==================
  const handleNombreChange = (e) => {
    setNombre(e.target.value);
    if (errores.nombre) {
      setErrores(prev => ({ ...prev, nombre: undefined }));
    }
  };

  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
    if (errores.correo) {
      setErrores(prev => ({ ...prev, correo: undefined }));
    }
  };

  const handleTelefonoChange = (e) => {
    setTelefono(e.target.value);
    if (errores.telefono) {
      setErrores(prev => ({ ...prev, telefono: undefined }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errores.password) {
      setErrores(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmarPasswordChange = (e) => {
    setConfirmarPassword(e.target.value);
    if (errores.confirmarPassword) {
      setErrores(prev => ({ ...prev, confirmarPassword: undefined }));
    }
  };

  const handleGeneroChange = (e) => {
    setGenero(e.target.value);
    if (errores.genero) {
      setErrores(prev => ({ ...prev, genero: undefined }));
    }
  };

  const handleFechaChange = (field, value) => {
    setFechaNacimiento(prev => ({ ...prev, [field]: Number(value) }));
    if (errores.fecha_nacimiento) {
      setErrores(prev => ({ ...prev, fecha_nacimiento: undefined }));
    }
  };

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const handleEmojiClick = (emoji) => {
    setDescripcion(prev => prev + emoji.emoji);
  };

  // ================== VERIFICAR CORREO DISPONIBLE ==================
  const verificarCorreoDisponible = async (correo) => {
    try {
      const response = await fetch(
        "http://localhost:3000/usuarios/verificar-correo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo_electronico: correo,
            id_usuario: usuario?.id_usuario
          }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al verificar correo:", error);
      return { disponible: true };
    }
  };

  // ================== VERIFICAR TELÉFONO DISPONIBLE ==================
  const verificarTelefonoDisponible = async (telefono) => {
    try {
      const response = await fetch(
        "http://localhost:3000/usuarios/verificar-telefono",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefono: telefono,
            id_usuario: usuario?.id_usuario
          }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al verificar teléfono:", error);
      return { disponible: true };
    }
  };

  // ================== VALIDACIONES ==================
  const validarFormulario = async () => {
    const nuevosErrores = {};

    // ============== NOMBRE ==============
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else {
      const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
      if (!nombreRegex.test(nombreLimpio)) {
        nuevosErrores.nombre = "El nombre solo puede contener letras, espacios, puntos y acentos";
      }
    }

    // ============== CORREO ==============
    const correoLimpio = correo.trim();

    if (!correoLimpio) {
      nuevosErrores.correo = "El correo electrónico es obligatorio";
    } else {
      const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

      if (!correoRegex.test(correoLimpio)) {
        nuevosErrores.correo = "El correo electrónico no cumple con un formato válido y profesional";
      } else {
        const parteUsuario = correoLimpio.split("@")[0];
        if (parteUsuario.length > 64) {
          nuevosErrores.correo = "El correo no debe superar 64 caracteres antes del @";
        } else {
          // VERIFICAR SI EL CORREO YA EXISTE EN LA BD (solo si cambió)
          if (correoLimpio.toLowerCase() !== usuario?.correo?.toLowerCase()) {
            const resultadoCorreo = await verificarCorreoDisponible(correoLimpio);
            if (!resultadoCorreo.disponible) {
              nuevosErrores.correo = resultadoCorreo.message;
            }
          }
        }
      }
    }

    // ============== TELÉFONO ==============
    const telefonoLimpio = telefono.trim();

    if (!telefonoLimpio) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else {
      const telefonoRegex = /^[0-9]{10}$/;
      if (!telefonoRegex.test(telefonoLimpio)) {
        nuevosErrores.telefono = "El teléfono debe tener 10 dígitos numéricos";
      } else {
        // VERIFICAR SI EL TELÉFONO YA EXISTE EN LA BD (solo si cambió)
        if (telefonoLimpio !== usuario?.telefono) {
          const resultadoTelefono = await verificarTelefonoDisponible(telefonoLimpio);
          if (!resultadoTelefono.disponible) {
            nuevosErrores.telefono = resultadoTelefono.message;
          }
        }
      }
    }

    // ============== CONTRASEÑA ==============
    if (password || confirmarPassword) {
      if (password.trim() === "") {
        nuevosErrores.password = "La contraseña no puede estar vacía";
      } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

        if (!passwordRegex.test(password)) {
          nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
        }

        if (password.length > 128) {
          nuevosErrores.password = "La contraseña no puede superar 128 caracteres";
        }
      }

      if (password !== confirmarPassword) {
        nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
      }
    }

    // ============== FECHA DE NACIMIENTO ==============
    if (!fechaNacimiento.day || !fechaNacimiento.month || !fechaNacimiento.year) {
      nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const pad = (n) => String(n).padStart(2, "0");
      const fecha = `${fechaNacimiento.year}-${pad(fechaNacimiento.month)}-${pad(fechaNacimiento.day)}`;
      const fechaNacimientoDate = new Date(fecha);
      const hoy = new Date();

      if (isNaN(fechaNacimientoDate.getTime())) {
        nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no es válida";
      } else {
        if (fechaNacimientoDate >= hoy) {
          nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy ni una fecha futura";
        }

        const edadMinima = 13;
        const fechaMinima = new Date(
          hoy.getFullYear() - edadMinima,
          hoy.getMonth(),
          hoy.getDate()
        );

        if (fechaNacimientoDate > fechaMinima) {
          nuevosErrores.fecha_nacimiento = `Debes tener al menos ${edadMinima} años`;
        }

        const edadMaxima = 120;
        const fechaMaxima = new Date(
          hoy.getFullYear() - edadMaxima,
          hoy.getMonth(),
          hoy.getDate()
        );

        if (fechaNacimientoDate < fechaMaxima) {
          nuevosErrores.fecha_nacimiento = `La edad no puede ser mayor a ${edadMaxima} años`;
        }
      }
    }

    // ============== GÉNERO ==============
    const generosValidos = ["mujer", "hombre", "otro"];
    if (!genero || !generosValidos.includes(genero)) {
      nuevosErrores.genero = "Debes seleccionar un género válido";
    }

    return nuevosErrores;
  };

  // ================== GUARDAR PERFIL ==================
  const handleGuardar = async () => {
    limpiarErrores();

    // VALIDAR FORMULARIO (INCLUYE VERIFICACIÓN DE DUPLICADOS)
    const erroresValidacion = await validarFormulario();

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      formData.append("correo", correo.trim().toLowerCase());
      formData.append("telefono", telefono.trim());
      formData.append("descripcion", descripcion);
      formData.append("genero", genero);

      if (password && password.trim() !== "") {
        formData.append("password", password);
      }

      if (fechaNacimiento.day && fechaNacimiento.month && fechaNacimiento.year) {
        formData.append("fechaNacimiento", JSON.stringify(fechaNacimiento));
      }

      if (fotoPerfilFile) formData.append("foto_perfil", fotoPerfilFile);
      if (fotoPortadaFile) formData.append("foto_portada", fotoPortadaFile);

      const res = await fetch("http://localhost:3000/usuarios/actualizar-perfil", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        // Actualizar fotos con URLs devueltas desde el backend
        if (data.fotos?.foto_perfil) setFotoPerfil(data.fotos.foto_perfil);
        if (data.fotos?.foto_portada) setFotoPortada(data.fotos.foto_portada);

        // Limpiar archivos seleccionados
        setFotoPerfilFile(null);
        setFotoPortadaFile(null);

        // Actualizar contexto global
        setUsuario(data.usuario);

        bloquearInputs();
        resetearEdicion();

        // Mostrar alert de éxito
        setAlertConfig({
          type: "success",
          title: "¡Éxito!",
          message: "Tu perfil ha sido actualizado correctamente."
        });
        setMostrarAlert(true);
      } else {
        // Manejar errores del backend
        if (data.errors && Array.isArray(data.errors)) {
          const nuevosErrores = {};
          data.errors.forEach(error => {
            if (error.path === "nombre_usuario") nuevosErrores.nombre = error.message;
            if (error.path === "correo_electronico") nuevosErrores.correo = error.message;
            if (error.path === "telefono") nuevosErrores.telefono = error.message;
            if (error.path === "contrasena") nuevosErrores.password = error.message;
            if (error.path === "fecha_nacimiento") nuevosErrores.fecha_nacimiento = error.message;
            if (error.path === "genero") nuevosErrores.genero = error.message;
          });
          setErrores(nuevosErrores);
        }

        setAlertConfig({
          type: "error",
          title: "Error",
          message: data.mensaje || "Error al actualizar perfil"
        });
        setMostrarAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Error de conexión al actualizar perfil. Por favor, intenta nuevamente."
      });
      setMostrarAlert(true);
    }
  };

  // ================== MODAL HANDLERS ==================
  const confirmarCancelar = () => {
    handleCancelar();
    setMostrarModalCancelar(false);
  };

  const cerrarModal = () => {
    setMostrarModalCancelar(false);
  };

  // ======= EXPORTAR DATOS DEL HOOK PARA PERFIL.JSX ======
  return {
    // Estados de UI
    mostrarModalCancelar,
    setMostrarModalCancelar,
    mostrarAlert,
    setMostrarAlert,
    alertConfig,
    errores,
    mostrarPassword,
    setMostrarPassword,
    mostrarConfirmPassword,
    setMostrarConfirmPassword,
    showEmoji,
    setShowEmoji,
    editarFecha,
    setEditarFecha,

    // Referencias
    fileInputRef,

    // Estados de datos
    nombre,
    correo,
    telefono,
    descripcion,
    genero,
    password,
    confirmarPassword,
    fechaNacimiento,

    // Estados de fotos
    fotoPerfil,
    fotoPortada,
    fotoPerfilFile,
    fotoPortadaFile,

    // Opciones
    days,
    months,
    years,

    // Usuario del contexto
    usuario,

    // Funciones de utilidad
    obtenerFotoPerfil,

    // Handlers
    handleCambiarFoto,
    handleFotoSeleccionada,
    handleFotoPortadaSeleccionada,
    handleCancelar,
    habilitarEdicion,
    handleNombreChange,
    handleCorreoChange,
    handleTelefonoChange,
    handlePasswordChange,
    handleConfirmarPasswordChange,
    handleGeneroChange,
    handleFechaChange,
    handleDescripcionChange,
    handleEmojiClick,
    handleGuardar,
    confirmarCancelar,
    cerrarModal,
  };
}