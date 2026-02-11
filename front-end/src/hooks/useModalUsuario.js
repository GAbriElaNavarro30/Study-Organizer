import { useState, useEffect } from "react";

export function useModalUsuario(tipo, usuario, isOpen, limpiarErrorBackend) {
    // ================== ESTADO DEL FORMULARIO ==================
    const [formData, setFormData] = useState({
        nombre_usuario: "",
        correo: "",
        rol: "",
        telefono: "",
        genero: "",
        fecha_nacimiento: {
            day: "",
            month: "",
            year: ""
        },
        contrasena: "",
        confirmarPassword: ""
    });

    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [errors, setErrors] = useState({});

    // ================== LISTAS FECHA ==================
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

    // ============== VERIFICAR CORREO DISPONIBLE ==============
    const verificarCorreoDisponible = async (correo, usuarioId = null) => {
        try {
            const payload = {
                correo_electronico: correo
            };

            // ✅ AGREGAR id_usuario solo si existe
            if (usuarioId) {
                payload.id_usuario = usuarioId;
            }

            const response = await fetch(
                "http://localhost:3000/usuarios/verificar-correo",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
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
    const verificarTelefonoDisponible = async (telefono, usuarioId = null) => {
        try {
            const payload = {
                telefono: telefono
            };

            // ✅ AGREGAR id_usuario solo si existe
            if (usuarioId) {
                payload.id_usuario = usuarioId;
            }

            const response = await fetch(
                "http://localhost:3000/usuarios/verificar-telefono",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error al verificar teléfono:", error);
            return { disponible: true };
        }
    };

    // ================== DETECTAR CAMBIOS ==================
    const tieneCambios = () => {
        if (tipo === "crear") {
            return Object.values(formData).some(value => {
                if (typeof value === "object") {
                    return Object.values(value).some(v => v !== "");
                }
                return value !== "";
            });
        } else if (tipo === "editar" && usuario) {
            const fecha = usuario.fecha_nacimiento?.split("-") || ["", "", ""];
            const usuarioOriginal = {
                nombre_usuario: usuario.nombre_usuario || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                telefono: usuario.telefono || "",
                genero: usuario.genero || "",
                fecha_nacimiento: {
                    year: fecha[0],
                    month: fecha[1],
                    day: fecha[2]
                },
                contrasena: "",
                confirmarPassword: ""
            };

            return JSON.stringify(formData) !== JSON.stringify(usuarioOriginal);
        }
        return false;
    };

    // ================== VALIDAR FORMULARIO ==================
    const validarFormulario = async () => {
        const nuevosErrores = {};

        // ============== NOMBRE ==============
        if (!formData.nombre_usuario || !formData.nombre_usuario.trim()) {
            nuevosErrores.nombre_usuario = "El nombre es obligatorio";
        } else {
            const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
            if (!nombreRegex.test(formData.nombre_usuario)) {
                nuevosErrores.nombre_usuario = "El nombre solo puede contener letras, espacios y acentos";
            }
        }

        // ============== CORREO ==============
        if (!formData.correo || !formData.correo.trim()) {
            nuevosErrores.correo = "El correo electrónico es obligatorio";
        } else {
            const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

            if (!correoRegex.test(formData.correo)) {
                nuevosErrores.correo = "El correo electrónico no cumple con un formato válido";
            } else {
                const parteUsuario = formData.correo.split("@")[0];
                if (parteUsuario.length > 64) {
                    nuevosErrores.correo = "El correo no debe superar 64 caracteres antes del @";
                } else {
                    // ✅ VERIFICAR SI EL CORREO YA EXISTE (Enviando el ID del usuario en modo editar)
                    const usuarioId = tipo === "editar" ? usuario?.id : null;
                    const resultadoCorreo = await verificarCorreoDisponible(formData.correo, usuarioId);
                    if (!resultadoCorreo.disponible) {
                        nuevosErrores.correo = resultadoCorreo.message;
                    }
                }
            }
        }

        // ============== ROL ==============
        if (!formData.rol) {
            nuevosErrores.id_rol = "El rol es obligatorio";
        }

        // ============== TELÉFONO ==============
        if (!formData.telefono || !formData.telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es obligatorio";
        } else {
            const telefonoRegex = /^[0-9]{10}$/;
            if (!telefonoRegex.test(formData.telefono)) {
                nuevosErrores.telefono = "El teléfono debe tener 10 dígitos numéricos";
            } else {
                // ✅ VERIFICAR SI EL TELÉFONO YA EXISTE (Enviando el ID del usuario en modo editar)
                const usuarioId = tipo === "editar" ? usuario?.id : null;
                const resultadoTelefono = await verificarTelefonoDisponible(formData.telefono, usuarioId);
                if (!resultadoTelefono.disponible) {
                    nuevosErrores.telefono = resultadoTelefono.message;
                }
            }
        }

        // ============== GÉNERO ==============
        if (!formData.genero || !formData.genero.trim()) {
            nuevosErrores.genero = "El género es obligatorio";
        } else {
            const generosValidos = ["mujer", "hombre", "otro"];
            if (!generosValidos.includes(formData.genero)) {
                nuevosErrores.genero = "El género seleccionado no es válido";
            }
        }

        // ============== CONTRASEÑA ==============
        // En CREAR, la contraseña es obligatoria
        if (tipo === "crear") {
            if (!formData.contrasena || !formData.contrasena.trim()) {
                nuevosErrores.contrasena = "La contraseña es obligatoria";
            } else {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

                if (!passwordRegex.test(formData.contrasena)) {
                    nuevosErrores.contrasena = "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
                }
            }

            // Confirmar contraseña
            if (!formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = "Debes confirmar la contraseña";
            } else if (formData.contrasena !== formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
            }
        }

        // En EDITAR, la contraseña es opcional, pero si se ingresa debe ser válida
        if (tipo === "editar") {
            if (formData.contrasena || formData.confirmarPassword) {
                // Si escribió algo en contraseña, validar formato
                if (formData.contrasena) {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

                    if (!passwordRegex.test(formData.contrasena)) {
                        nuevosErrores.contrasena = "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)";
                    }
                }

                // Validar que coincidan
                if (formData.contrasena !== formData.confirmarPassword) {
                    nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
                }
            }
        }

        // ============== FECHA DE NACIMIENTO ==============
        if (!formData.fecha_nacimiento.day || !formData.fecha_nacimiento.month || !formData.fecha_nacimiento.year) {
            nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
        } else {
            const fecha = new Date(
                formData.fecha_nacimiento.year,
                formData.fecha_nacimiento.month - 1,
                formData.fecha_nacimiento.day
            );
            const hoy = new Date();

            // Fecha inválida
            if (isNaN(fecha.getTime())) {
                nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no es válida";
            } else {
                // No hoy ni futura
                if (fecha >= hoy) {
                    nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy ni una fecha futura";
                } else {
                    // Edad mínima
                    const edadMinima = 13;
                    const fechaMinima = new Date(
                        hoy.getFullYear() - edadMinima,
                        hoy.getMonth(),
                        hoy.getDate()
                    );

                    if (fecha > fechaMinima) {
                        nuevosErrores.fecha_nacimiento = `Debes tener al menos ${edadMinima} años`;
                    }

                    // Edad máxima
                    const edadMaxima = 120;
                    const fechaMaxima = new Date(
                        hoy.getFullYear() - edadMaxima,
                        hoy.getMonth(),
                        hoy.getDate()
                    );

                    if (fecha < fechaMaxima) {
                        nuevosErrores.fecha_nacimiento = `La edad no puede ser mayor a ${edadMaxima} años`;
                    }
                }
            }
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ================== EDITAR USUARIO ==================
    useEffect(() => {
        if (tipo === "editar" && usuario) {
            const [year = "", month = "", day = ""] = usuario.fecha_nacimiento?.split("-") || [];

            setFormData({
                nombre_usuario: usuario.nombre_usuario || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                telefono: usuario.telefono || "",
                genero: usuario.genero || "",
                fecha_nacimiento: {
                    day: String(parseInt(day)),
                    month: String(parseInt(month)),
                    year: String(year),
                },
                contrasena: "",
                confirmarPassword: ""
            });
        } else {
            setFormData({
                nombre_usuario: "",
                correo: "",
                rol: "",
                telefono: "",
                genero: "",
                fecha_nacimiento: { day: "", month: "", year: "" },
                contrasena: "",
                confirmarPassword: ""
            });
        }
    }, [usuario, tipo, isOpen]);

    // ================== HANDLERS ==================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        // LIMPIAR ERROR DEL CAMPO QUE ESTÁ ESCRIBIENDO 
        if (errors[name]) {
            setErrors(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores[name];
                return nuevosErrores;
            });
        }

        // limpiar error de rol si esta ecribiendo
        if (name === "rol") {
            setErrors(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores.id_rol;
                return nuevosErrores;
            });
        }

        // LIMPIAR ERROR DE CONFIRMAR PASSWORD SI ESTÁ ESCRIBIENDO EN PASSWORD 
        if (name === "contrasena" && errors.confirmarPassword) {
            setErrors(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores.confirmarPassword;
                return nuevosErrores;
            });
        }

        // Limpiar error del backend si existe
        if (limpiarErrorBackend) {
            // Si es el campo "rol", limpiar también "id_rol" del backend
            if (name === "rol") {
                limpiarErrorBackend("id_rol");
            } else {
                limpiarErrorBackend(name);
            }
        }
    };

    const handleFechaChange = (campo, valor) => {
        setFormData(prev => ({
            ...prev,
            fecha_nacimiento: {
                ...prev.fecha_nacimiento,
                [campo]: valor
            }
        }));

        // LIMPIAR ERROR DE FECHA AL CAMBIAR
        if (errors.fecha_nacimiento) {
            setErrors(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores.fecha_nacimiento;
                return nuevosErrores;
            });
        }

        // Limpiar error del backend
        if (limpiarErrorBackend) {
            limpiarErrorBackend("fecha_nacimiento");
        }
    };

    // ================== PREPARAR DATA PARA SUBMIT ==================
    const prepararDataParaEnviar = () => {
        const { day, month, year } = formData.fecha_nacimiento;
        const fecha_nacimiento =
            day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : "";

        const mapearRolAId = (rol) => {
            if (rol === "Administrador") return 1;
            if (rol === "Tutor") return 2;
            if (rol === "Estudiante") return 3;
            return null;
        };

        const dataEnviar = {
            nombre_usuario: formData.nombre_usuario.trim(),
            correo: formData.correo.trim().toLowerCase(),
            telefono: formData.telefono.trim(),
            genero: formData.genero,
            fecha_nacimiento,
            id_rol: mapearRolAId(formData.rol)
        };

        if (formData.contrasena) {
            dataEnviar.contrasena = formData.contrasena;
        }

        return dataEnviar;
    };

    // ================== LIMPIAR ERRORES AL ABRIR ==================
    useEffect(() => {
        setErrors({});
    }, [isOpen]);

    // ================== EXPORT ==================
    return {
        formData,
        setFormData,
        showConfirmCancel,
        setShowConfirmCancel,
        errors,
        days,
        months,
        years,
        tieneCambios,
        validarFormulario,
        handleChange,
        handleFechaChange,
        prepararDataParaEnviar
    };
}