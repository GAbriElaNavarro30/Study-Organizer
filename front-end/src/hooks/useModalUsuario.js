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
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Solo validar coincidencia de contraseñas
        if (tipo === "crear" || (tipo === "editar" && formData.contrasena && formData.confirmarPassword)) {
            if (formData.contrasena !== formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
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
        setErrors(prev => ({ ...prev, [name]: null }));
        
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

        // Limpiar errores de fecha
        setErrors(prev => ({ ...prev, fecha_nacimiento: null }));
        if (limpiarErrorBackend) {
            limpiarErrorBackend("fecha_nacimiento");
        }
    };

    // ================== PREPARAR DATA PARA SUBMIT ==================
    const prepararDataParaEnviar = () => {
        const { day, month, year } = formData.fecha_nacimiento;
        const fecha_nacimiento =
            day && month && year ? `${year}-${month}-${day}` : "";

        const mapearRolAId = (rol) => {
            if (rol === "Administrador") return 1;
            if (rol === "Tutor") return 2;
            if (rol === "Estudiante") return 3;
            return null;
        };

        const dataEnviar = {
            nombre_usuario: formData.nombre_usuario,
            correo: formData.correo,
            telefono: formData.telefono,
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