import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import fotoPredeterminada from "../assets/imagenes/perfil-usuario.png";
import api from "../services/api";

export function usePerfil() {
  const { usuario, setUsuario } = useContext(AuthContext);

  // ================================================================
  //  ESTADO — UI
  // ================================================================
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarAlert, setMostrarAlert]                 = useState(false);
  const [alertConfig, setAlertConfig]                   = useState({ type: "success", title: "", message: "" });
  const [errores, setErrores]                           = useState({});
  const [mostrarPassword, setMostrarPassword]           = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [showEmoji, setShowEmoji]                       = useState(false);
  const [editarFecha, setEditarFecha]                   = useState(false);

  // ================================================================
  //  REFERENCIAS — inputs de archivo
  // ================================================================
  const fileInputPerfilRef  = useRef(null);
  const fileInputPortadaRef = useRef(null);

  // ================================================================
  //  ESTADO — ajuste de PORTADA
  // ================================================================
  const [modoAjuste, setModoAjuste]               = useState(false);
  const [portadaPreviewUrl, setPortadaPreviewUrl] = useState(null);
  const [portadaZoom, setPortadaZoom]             = useState(1);
  const [portadaOffset, setPortadaOffset]         = useState({ x: 0, y: 0 });
  const [portadaImgNatural, setPortadaImgNatural] = useState({ w: 1, h: 1 });

  const portadaContainerRef = useRef(null);
  const isDragging          = useRef(false);
  const dragStart           = useRef({ x: 0, y: 0 });
  const offsetAtDrag        = useRef({ x: 0, y: 0 });

  // ================================================================
  //  ESTADO — ajuste de FOTO DE PERFIL
  // ================================================================
  const TAMAÑO_PERFIL = 140;

  const [modoAjustePerfil, setModoAjustePerfil]   = useState(false);
  const [perfilPreviewUrl, setPerfilPreviewUrl]   = useState(null);
  const [perfilZoom, setPerfilZoom]               = useState(1);
  const [perfilOffset, setPerfilOffset]           = useState({ x: 0, y: 0 });
  const [perfilImgNatural, setPerfilImgNatural]   = useState({ w: 1, h: 1 });

  const isDraggingPerfil   = useRef(false);
  const dragStartPerfil    = useRef({ x: 0, y: 0 });
  const offsetAtDragPerfil = useRef({ x: 0, y: 0 });

  // ================================================================
  //  CONSTANTES
  // ================================================================
  const FOTO_PREDETERMINADA    = fotoPredeterminada;
  const PORTADA_PREDETERMINADA = "/portada.jpg";
  const FECHA_VACIA            = { day: "", month: "", year: "" };
  const ALTURA_PORTADA_FINAL   = 240;

  const esFotoValida = (foto) =>
    foto &&
    foto !== "null" &&
    foto !== "undefined" &&
    foto !== "" &&
    foto !== "/perfil-usuario.png";

  // ================================================================
  //  ESTADO — datos del formulario
  // ================================================================
  const [nombre, setNombre]                         = useState(usuario?.nombre || "");
  const [apellido, setApellido]                     = useState(usuario?.apellido || "");
  const [correo, setCorreo]                         = useState(usuario?.correo || "");
  const [correo_alternativo, setCorreoAlternativo]  = useState(usuario?.correo_alternativo || "");
  const [telefono, setTelefono]                     = useState(usuario?.telefono || "");
  const [descripcion, setDescripcion]               = useState(usuario?.descripcion || "");
  const [genero, setGenero]                         = useState(usuario?.genero || "otro");
  const [password, setPassword]                     = useState("");
  const [confirmarPassword, setConfirmarPassword]   = useState("");
  const [fechaNacimiento, setFechaNacimiento]       = useState(FECHA_VACIA);

  // ================================================================
  //  ESTADO — fotos
  // ================================================================
  const [fotoPerfilFile, setFotoPerfilFile]   = useState(null);
  const [fotoPortadaFile, setFotoPortadaFile] = useState(null);

  const [fotoPerfil, setFotoPerfil] = useState(
    esFotoValida(usuario?.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA
  );
  const [fotoPortada, setFotoPortada] = useState(
    esFotoValida(usuario?.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA
  );

  // ================================================================
  //  OPCIONES — selects
  // ================================================================
  const days   = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // ================================================================
  //  EFFECT — sincronizar datos cuando cambia el usuario en contexto
  // ================================================================
  useEffect(() => {
    if (!usuario) return;
    setNombre(usuario.nombre || "");
    setApellido(usuario.apellido || "");
    setCorreo(usuario.correo || "");
    setCorreoAlternativo(usuario.correo_alternativo || "");
    setTelefono(usuario.telefono || "");
    setGenero(usuario.genero || "otro");
    setDescripcion(usuario.descripcion || "");
    setFechaNacimiento(usuario.fecha_nacimiento || FECHA_VACIA);
    setFotoPerfil(esFotoValida(usuario.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA);
    setFotoPortada(esFotoValida(usuario.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA);
  }, [usuario]);

  // ================================================================
  //  UTILIDADES
  // ================================================================
  const limpiarErrores = () => setErrores({});

  const obtenerFotoPerfil = () => {
    if (fotoPerfil && fotoPerfil.startsWith("blob:")) return fotoPerfil;
    const foto = usuario?.foto_perfil;
    if (foto && esFotoValida(foto)) return foto;
    return fotoPredeterminada;
  };

  const bloquearInputs = () => {
    const inputs = document.querySelectorAll(".input-editable input, .input-editable select");
    inputs.forEach((input) => { input.disabled = true; });
  };

  const resetearEdicion = () => {
    setEditarFecha(false);
    setPassword("");
    setConfirmarPassword("");
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);
  };

  // ================================================================
  //  CÁLCULO DE LÍMITES — portada
  // ================================================================
  const calcularZoomMin = useCallback((contW, contH, imgW, imgH) => {
    return Math.max(contW / imgW, contH / imgH);
  }, []);

  const clampOffset = useCallback((x, y, zoom, imgW, imgH, contW, contH) => {
    const scaledW = imgW * zoom;
    const scaledH = imgH * zoom;
    return {
      x: Math.min(0, Math.max(contW - scaledW, x)),
      y: Math.min(0, Math.max(contH - scaledH, y)),
    };
  }, []);

  // ================================================================
  //  CÁLCULO DE LÍMITES — perfil
  // ================================================================
  const clampOffsetPerfil = useCallback((x, y, zoom, imgW, imgH) => {
    const scaledW = imgW * zoom;
    const scaledH = imgH * zoom;
    return {
      x: Math.min(0, Math.max(140 - scaledW, x)),
      y: Math.min(0, Math.max(140 - scaledH, y)),
    };
  }, []);

  // ================================================================
  //  SELECCIÓN DE ARCHIVO — portada
  // ================================================================
  const handleFotoPortadaSeleccionada = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const contEl = portadaContainerRef.current;
      const contW  = contEl ? contEl.offsetWidth : 1100;
      const contH  = ALTURA_PORTADA_FINAL;
      const imgW   = img.naturalWidth;
      const imgH   = img.naturalHeight;
      const zoomMin   = calcularZoomMin(contW, contH, imgW, imgH);
      const scaledW   = imgW * zoomMin;
      const scaledH   = imgH * zoomMin;
      setPortadaImgNatural({ w: imgW, h: imgH });
      setPortadaZoom(zoomMin);
      setPortadaOffset({ x: (contW - scaledW) / 2, y: (contH - scaledH) / 2 });
      setPortadaPreviewUrl(url);
      setFotoPortadaFile(file);
      setModoAjuste(true);
    };
    img.src = url;
    e.target.value = null;
  }, [calcularZoomMin]);

  // ================================================================
  //  SELECCIÓN DE ARCHIVO — foto de perfil
  // ================================================================
  const handleFotoSeleccionada = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const imgW    = img.naturalWidth;
      const imgH    = img.naturalHeight;
      const zoomMin = Math.max(140 / imgW, 140 / imgH);
      const scaledW = imgW * zoomMin;
      const scaledH = imgH * zoomMin;
      setPerfilImgNatural({ w: imgW, h: imgH });
      setPerfilZoom(zoomMin);
      setPerfilOffset({ x: (140 - scaledW) / 2, y: (140 - scaledH) / 2 });
      setPerfilPreviewUrl(url);
      setFotoPerfilFile(file);
      setModoAjustePerfil(true);
    };
    img.src = url;
    e.target.value = null;
  }, []);

  // ================================================================
  //  ZOOM — portada
  // ================================================================
  const handlePortadaZoomChange = useCallback((val) => {
    const contEl  = portadaContainerRef.current;
    if (!contEl) return;
    const contW   = contEl.offsetWidth;
    const contH   = ALTURA_PORTADA_FINAL;
    const zoomMin = calcularZoomMin(contW, contH, portadaImgNatural.w, portadaImgNatural.h);
    const newZoom = Math.min(zoomMin * 3, Math.max(zoomMin, parseFloat(val)));
    const clamped = clampOffset(
      portadaOffset.x, portadaOffset.y, newZoom,
      portadaImgNatural.w, portadaImgNatural.h, contW, contH
    );
    setPortadaZoom(newZoom);
    setPortadaOffset(clamped);
  }, [portadaOffset, portadaImgNatural, calcularZoomMin, clampOffset]);

  // ================================================================
  //  ZOOM — foto de perfil
  // ================================================================
  const handlePerfilZoomChange = useCallback((val) => {
    const zoomMin = Math.max(140 / perfilImgNatural.w, 140 / perfilImgNatural.h);
    const newZoom = Math.min(zoomMin * 4, Math.max(zoomMin, parseFloat(val)));
    const clamped = clampOffsetPerfil(
      perfilOffset.x, perfilOffset.y, newZoom,
      perfilImgNatural.w, perfilImgNatural.h
    );
    setPerfilZoom(newZoom);
    setPerfilOffset(clamped);
  }, [perfilOffset, perfilImgNatural, clampOffsetPerfil]);

  // ================================================================
  //  DRAG MOUSE — portada
  // ================================================================
  const handlePortadaMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current    = true;
    dragStart.current     = { x: e.clientX, y: e.clientY };
    offsetAtDrag.current  = { ...portadaOffset };
  }, [portadaOffset]);

  const handlePortadaMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const contEl = portadaContainerRef.current;
    if (!contEl) return;
    const clamped = clampOffset(
      offsetAtDrag.current.x + (e.clientX - dragStart.current.x),
      offsetAtDrag.current.y + (e.clientY - dragStart.current.y),
      portadaZoom, portadaImgNatural.w, portadaImgNatural.h,
      contEl.offsetWidth, ALTURA_PORTADA_FINAL
    );
    setPortadaOffset(clamped);
  }, [portadaZoom, portadaImgNatural, clampOffset]);

  const handlePortadaMouseUp = useCallback(() => { isDragging.current = false; }, []);

  // ================================================================
  //  DRAG TOUCH — portada
  // ================================================================
  const handlePortadaTouchStart = useCallback((e) => {
    const t = e.touches[0];
    isDragging.current   = true;
    dragStart.current    = { x: t.clientX, y: t.clientY };
    offsetAtDrag.current = { ...portadaOffset };
  }, [portadaOffset]);

  const handlePortadaTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const contEl = portadaContainerRef.current;
    if (!contEl) return;
    const t = e.touches[0];
    const clamped = clampOffset(
      offsetAtDrag.current.x + (t.clientX - dragStart.current.x),
      offsetAtDrag.current.y + (t.clientY - dragStart.current.y),
      portadaZoom, portadaImgNatural.w, portadaImgNatural.h,
      contEl.offsetWidth, ALTURA_PORTADA_FINAL
    );
    setPortadaOffset(clamped);
  }, [portadaZoom, portadaImgNatural, clampOffset]);

  const handlePortadaTouchEnd = useCallback(() => { isDragging.current = false; }, []);

  // ================================================================
  //  DRAG MOUSE — foto de perfil
  // ================================================================
  const handlePerfilMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingPerfil.current   = true;
    dragStartPerfil.current    = { x: e.clientX, y: e.clientY };
    offsetAtDragPerfil.current = { ...perfilOffset };
  }, [perfilOffset]);

  const handlePerfilMouseMove = useCallback((e) => {
    if (!isDraggingPerfil.current) return;
    const clamped = clampOffsetPerfil(
      offsetAtDragPerfil.current.x + (e.clientX - dragStartPerfil.current.x),
      offsetAtDragPerfil.current.y + (e.clientY - dragStartPerfil.current.y),
      perfilZoom, perfilImgNatural.w, perfilImgNatural.h
    );
    setPerfilOffset(clamped);
  }, [perfilZoom, perfilImgNatural, clampOffsetPerfil]);

  const handlePerfilMouseUp = useCallback(() => { isDraggingPerfil.current = false; }, []);

  // ================================================================
  //  DRAG TOUCH — foto de perfil
  // ================================================================
  const handlePerfilTouchStart = useCallback((e) => {
    const t = e.touches[0];
    isDraggingPerfil.current   = true;
    dragStartPerfil.current    = { x: t.clientX, y: t.clientY };
    offsetAtDragPerfil.current = { ...perfilOffset };
  }, [perfilOffset]);

  const handlePerfilTouchMove = useCallback((e) => {
    if (!isDraggingPerfil.current) return;
    e.preventDefault();
    const t = e.touches[0];
    const clamped = clampOffsetPerfil(
      offsetAtDragPerfil.current.x + (t.clientX - dragStartPerfil.current.x),
      offsetAtDragPerfil.current.y + (t.clientY - dragStartPerfil.current.y),
      perfilZoom, perfilImgNatural.w, perfilImgNatural.h
    );
    setPerfilOffset(clamped);
  }, [perfilZoom, perfilImgNatural, clampOffsetPerfil]);

  const handlePerfilTouchEnd = useCallback(() => { isDraggingPerfil.current = false; }, []);

  // ================================================================
  //  CONFIRMAR AJUSTE — portada
  // ================================================================
  const confirmarAjustePortada = useCallback(() => {
    const contEl = portadaContainerRef.current;
    if (!contEl || !portadaPreviewUrl) return;
    const contW = contEl.offsetWidth;
    const contH = ALTURA_PORTADA_FINAL;
    const canvas = document.createElement("canvas");
    canvas.width  = contW * 2;
    canvas.height = contH * 2;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const srcX = -portadaOffset.x / portadaZoom;
      const srcY = -portadaOffset.y / portadaZoom;
      const srcW = contW / portadaZoom;
      const srcH = contH / portadaZoom;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setFotoPortadaFile(new File([blob], "portada_ajustada.jpg", { type: "image/jpeg" }));
        setFotoPortada(URL.createObjectURL(blob));
        setModoAjuste(false);
        setPortadaPreviewUrl(null);
      }, "image/jpeg", 0.93);
    };
    img.src = portadaPreviewUrl;
  }, [portadaOffset, portadaZoom, portadaPreviewUrl]);

  // ================================================================
  //  CONFIRMAR AJUSTE — foto de perfil
  // ================================================================
  const confirmarAjustePerfil = useCallback(() => {
    if (!perfilPreviewUrl) return;
    const CIRCULO_CSS = 140;
    const OUTPUT_SIZE = 560;
    const canvas = document.createElement("canvas");
    canvas.width  = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const srcX = -perfilOffset.x / perfilZoom;
      const srcY = -perfilOffset.y / perfilZoom;
      const srcW = CIRCULO_CSS / perfilZoom;
      const srcH = CIRCULO_CSS / perfilZoom;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      canvas.toBlob((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        setFotoPerfilFile(new File([blob], "perfil_ajustado.jpg", { type: "image/jpeg" }));
        setFotoPerfil(blobUrl);
        setModoAjustePerfil(false);
        setPerfilPreviewUrl(null);
      }, "image/jpeg", 0.95);
    };
    img.src = perfilPreviewUrl;
  }, [perfilOffset, perfilZoom, perfilPreviewUrl]);

  // ================================================================
  //  CANCELAR AJUSTE
  // ================================================================
  const cancelarAjustePortada = useCallback(() => {
    setModoAjuste(false);
    setPortadaPreviewUrl(null);
    setFotoPortadaFile(null);
    if (fileInputPortadaRef.current) fileInputPortadaRef.current.value = null;
  }, []);

  const cancelarAjustePerfil = useCallback(() => {
    setModoAjustePerfil(false);
    setPerfilPreviewUrl(null);
    setFotoPerfilFile(null);
    if (fileInputPerfilRef.current) fileInputPerfilRef.current.value = null;
  }, []);

  // ================================================================
  //  HANDLERS — abrir selector de archivo
  // ================================================================
  const handleCambiarFotoPerfil  = () => fileInputPerfilRef.current.click();
  const handleCambiarFotoPortada = () => fileInputPortadaRef.current.click();

  // ================================================================
  //  HANDLER — cancelar formulario (restaurar estado original)
  // ================================================================
  const handleCancelar = () => {
    setNombre(usuario?.nombre || "");
    setApellido(usuario?.apellido || "");
    setCorreo(usuario?.correo || "");
    setCorreoAlternativo(usuario?.correo_alternativo || "");
    setTelefono(usuario?.telefono || "");
    setDescripcion(usuario?.descripcion || "");
    setGenero(usuario?.genero || "otro");
    setFechaNacimiento(usuario?.fecha_nacimiento || FECHA_VACIA);
    setFotoPerfil(esFotoValida(usuario?.foto_perfil) ? usuario.foto_perfil : FOTO_PREDETERMINADA);
    setFotoPortada(esFotoValida(usuario?.foto_portada) ? usuario.foto_portada : PORTADA_PREDETERMINADA);
    setFotoPerfilFile(null);
    setFotoPortadaFile(null);
    setModoAjuste(false);
    setPortadaPreviewUrl(null);
    setModoAjustePerfil(false);
    setPerfilPreviewUrl(null);
    if (fileInputPerfilRef.current) fileInputPerfilRef.current.value = null;
    if (fileInputPortadaRef.current) fileInputPortadaRef.current.value = null;
    setPassword("");
    setConfirmarPassword("");
    setErrores({});
    bloquearInputs();
    resetearEdicion();
  };

  // ================================================================
  //  HANDLER — habilitar edición de un input individual
  // ================================================================
  const habilitarEdicion = (e) => {
    const container = e.currentTarget.closest(".input-editable");
    const input     = container?.querySelector("input");
    if (input) {
      input.disabled = !input.disabled;
      if (!input.disabled) input.focus();
    }
  };

  // ================================================================
  //  HANDLERS — cambios de campos del formulario
  // ================================================================
  const handleNombreChange = (e) => {
    setNombre(e.target.value);
    if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
  };
  const handleApellidoChange = (e) => {
    setApellido(e.target.value);
    if (errores.apellido) setErrores((prev) => ({ ...prev, apellido: undefined }));
  };
  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
    if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
  };
  const handleCorreoAlternativoChange = (e) => {
    setCorreoAlternativo(e.target.value);
    if (errores.correo_alternativo) setErrores((prev) => ({ ...prev, correo_alternativo: undefined }));
  };
  const handleTelefonoChange = (e) => {
    setTelefono(e.target.value);
    if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: undefined }));
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
  };
  const handleConfirmarPasswordChange = (e) => {
    setConfirmarPassword(e.target.value);
    if (errores.confirmarPassword) setErrores((prev) => ({ ...prev, confirmarPassword: undefined }));
  };
  const handleGeneroChange = (e) => {
    setGenero(e.target.value);
    if (errores.genero) setErrores((prev) => ({ ...prev, genero: undefined }));
  };
  const handleFechaChange = (field, value) => {
    setFechaNacimiento((prev) => ({ ...prev, [field]: Number(value) }));
    if (errores.fecha_nacimiento) setErrores((prev) => ({ ...prev, fecha_nacimiento: undefined }));
  };
  const handleDescripcionChange = (e) => setDescripcion(e.target.value);
  const handleEmojiClick        = (emoji) => setDescripcion((prev) => prev + emoji.emoji);

  // ================================================================
  //  VERIFICACIONES — disponibilidad en servidor
  // ================================================================
  const verificarCorreoDisponible = async (correo) => {
    try {
      const { data } = await api.post("/usuarios/verificar-correo", {
        correo_electronico: correo,
        id_usuario: usuario?.id_usuario,
      });
      return data;
    } catch (error) {
      console.error("Error al verificar correo:", error);
      return { disponible: true };
    }
  };

  const verificarTelefonoDisponible = async (telefono) => {
    try {
      const { data } = await api.post("/usuarios/verificar-telefono", {
        telefono,
        id_usuario: usuario?.id_usuario,
      });
      return data;
    } catch (error) {
      console.error("Error al verificar teléfono:", error);
      return { disponible: true };
    }
  };

  // ================================================================
  //  VALIDACIONES — formulario completo
  // ================================================================
  const validarFormulario = async () => {
    const nuevosErrores = {};

    // Nombre
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/.test(nombreLimpio)) {
      nuevosErrores.nombre = "El nombre solo puede contener letras, espacios, puntos y acentos";
    }

    // Apellido
    const apellidoLimpio = apellido.trim();
    if (!apellidoLimpio) {
      nuevosErrores.apellido = "El apellido es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/.test(apellidoLimpio)) {
      nuevosErrores.apellido = "El apellido solo puede contener letras, espacios, puntos y acentos";
    }

    // Correo
    const correoLimpio = correo.trim();
    if (!correoLimpio) {
      nuevosErrores.correo = "El correo electrónico es obligatorio";
    } else {
      const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      if (!correoRegex.test(correoLimpio)) {
        nuevosErrores.correo = "El correo electrónico no cumple con un formato válido y profesional";
      } else if (correoLimpio.split("@")[0].length > 64) {
        nuevosErrores.correo = "El correo no debe superar 64 caracteres antes del @";
      } else if (correoLimpio.toLowerCase() !== usuario?.correo?.toLowerCase()) {
        const r = await verificarCorreoDisponible(correoLimpio);
        if (!r.disponible) nuevosErrores.correo = r.message;
      }
    }

    // Correo alternativo
    const correoAltLimpio = correo_alternativo.trim();
    if (correoAltLimpio) {
      if (correoAltLimpio.toLowerCase() === correoLimpio.toLowerCase()) {
        nuevosErrores.correo_alternativo = "El correo alternativo no puede ser igual al correo principal";
      } else {
        const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
        if (!correoRegex.test(correoAltLimpio)) {
          nuevosErrores.correo_alternativo = "El correo alternativo no cumple con un formato válido y profesional";
        } else if (correoAltLimpio.split("@")[0].length > 64) {
          nuevosErrores.correo_alternativo = "El correo alternativo no debe superar 64 caracteres antes del @";
        }
      }
    }

    // Teléfono
    const telefonoLimpio = telefono.trim();
    if (!telefonoLimpio) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^[0-9]{10}$/.test(telefonoLimpio)) {
      nuevosErrores.telefono = "El teléfono debe tener 10 dígitos numéricos";
    } else if (telefonoLimpio !== usuario?.telefono) {
      const r = await verificarTelefonoDisponible(telefonoLimpio);
      if (!r.disponible) nuevosErrores.telefono = r.message;
    }

    // Contraseña
    if (password || confirmarPassword) {
      if (password.trim() === "") {
        nuevosErrores.password = "La contraseña no puede estar vacía";
      } else {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/.test(password))
          nuevosErrores.password =
            "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
        if (password.length > 128)
          nuevosErrores.password = "La contraseña no puede superar 128 caracteres";
      }
      if (password !== confirmarPassword)
        nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    }

    // Fecha de nacimiento
    if (!fechaNacimiento.day || !fechaNacimiento.month || !fechaNacimiento.year) {
      nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const pad      = (n) => String(n).padStart(2, "0");
      const fechaDate = new Date(
        `${fechaNacimiento.year}-${pad(fechaNacimiento.month)}-${pad(fechaNacimiento.day)}`
      );
      const hoy = new Date();
      if (isNaN(fechaDate.getTime())) {
        nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no es válida";
      } else {
        if (fechaDate >= hoy)
          nuevosErrores.fecha_nacimiento = "La fecha no puede ser hoy ni futura";
        if (fechaDate > new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate()))
          nuevosErrores.fecha_nacimiento = "Debes tener al menos 13 años";
        if (fechaDate < new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate()))
          nuevosErrores.fecha_nacimiento = "La edad no puede ser mayor a 120 años";
      }
    }

    // Género
    if (!genero || !["mujer", "hombre", "otro"].includes(genero))
      nuevosErrores.genero = "Debes seleccionar un género válido";

    return nuevosErrores;
  };

  // ================================================================
  //  GUARDAR — envío al servidor
  // ================================================================
  const handleGuardar = async () => {
    limpiarErrores();
    const erroresValidacion = await validarFormulario();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("nombre",             nombre.trim());
      formData.append("apellido",           apellido.trim());
      formData.append("correo",             correo.trim().toLowerCase());
      formData.append("correo_alternativo", correo_alternativo.trim().toLowerCase() || "");
      formData.append("telefono",           telefono.trim());
      formData.append("descripcion",        descripcion);
      formData.append("genero",             genero);
      if (password && password.trim() !== "")
        formData.append("password", password);
      if (fechaNacimiento.day && fechaNacimiento.month && fechaNacimiento.year)
        formData.append("fechaNacimiento", JSON.stringify(fechaNacimiento));
      if (fotoPerfilFile)  formData.append("foto_perfil",  fotoPerfilFile);
      if (fotoPortadaFile) formData.append("foto_portada", fotoPortadaFile);

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/actualizar-perfil`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        if (data.fotos?.foto_perfil)  setFotoPerfil(data.fotos.foto_perfil);
        if (data.fotos?.foto_portada) setFotoPortada(data.fotos.foto_portada);
        setFotoPerfilFile(null);
        setFotoPortadaFile(null);
        setUsuario(data.usuario);
        bloquearInputs();
        resetearEdicion();
        setAlertConfig({ type: "success", title: "¡Éxito!", message: "Tu perfil ha sido actualizado correctamente." });
        setMostrarAlert(true);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const nuevosErrores = {};
          data.errors.forEach((error) => {
            if (error.path === "nombre")            nuevosErrores.nombre            = error.message;
            if (error.path === "apellido")          nuevosErrores.apellido          = error.message;
            if (error.path === "correo_electronico") nuevosErrores.correo           = error.message;
            if (error.path === "telefono")          nuevosErrores.telefono          = error.message;
            if (error.path === "contrasena")        nuevosErrores.password          = error.message;
            if (error.path === "fecha_nacimiento")  nuevosErrores.fecha_nacimiento  = error.message;
            if (error.path === "genero")            nuevosErrores.genero            = error.message;
          });
          setErrores(nuevosErrores);
        }
        setAlertConfig({ type: "error", title: "Error", message: data.mensaje || "Error al actualizar perfil" });
        setMostrarAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({ type: "error", title: "Error", message: "Error de conexión al actualizar perfil." });
      setMostrarAlert(true);
    }
  };

  // ================================================================
  //  MODAL — confirmar / cerrar
  // ================================================================
  const confirmarCancelar = () => { handleCancelar(); setMostrarModalCancelar(false); };
  const cerrarModal       = () => setMostrarModalCancelar(false);

  // ================================================================
  //  EXPORTAR
  // ================================================================
  return {
    // UI
    mostrarModalCancelar, setMostrarModalCancelar,
    mostrarAlert, setMostrarAlert,
    alertConfig,
    errores,
    mostrarPassword, setMostrarPassword,
    mostrarConfirmPassword, setMostrarConfirmPassword,
    showEmoji, setShowEmoji,
    editarFecha, setEditarFecha,

    // Refs
    fileInputPerfilRef, fileInputPortadaRef,

    // Datos del formulario
    nombre, apellido, correo, correo_alternativo,
    telefono, descripcion, genero,
    password, confirmarPassword, fechaNacimiento,
    days, months, years,
    usuario,

    // Fotos
    fotoPerfil, fotoPortada,
    fotoPerfilFile, fotoPortadaFile,

    // Utilidades de foto
    obtenerFotoPerfil,
    handleCambiarFotoPerfil, handleCambiarFotoPortada,
    handleFotoSeleccionada, handleFotoPortadaSeleccionada,

    // Formulario
    handleCancelar, habilitarEdicion,
    handleNombreChange, handleApellidoChange,
    handleCorreoChange, handleCorreoAlternativoChange,
    handleTelefonoChange, handlePasswordChange,
    handleConfirmarPasswordChange, handleGeneroChange,
    handleFechaChange, handleDescripcionChange,
    handleEmojiClick, handleGuardar,
    confirmarCancelar, cerrarModal,

    // Ajuste portada
    modoAjuste,
    portadaPreviewUrl,
    portadaZoom,
    portadaOffset,
    portadaImgNatural,
    portadaContainerRef,
    handlePortadaMouseDown, handlePortadaMouseMove,
    handlePortadaMouseUp,
    handlePortadaTouchStart, handlePortadaTouchMove,
    handlePortadaTouchEnd,
    handlePortadaZoomChange,
    confirmarAjustePortada, cancelarAjustePortada,

    // Ajuste foto de perfil
    modoAjustePerfil,
    perfilPreviewUrl,
    perfilZoom,
    perfilOffset,
    perfilImgNatural,
    handlePerfilMouseDown, handlePerfilMouseMove,
    handlePerfilMouseUp,
    handlePerfilTouchStart, handlePerfilTouchMove,
    handlePerfilTouchEnd,
    handlePerfilZoomChange,
    confirmarAjustePerfil, cancelarAjustePerfil,
  };
}