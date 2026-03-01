import { useState, useEffect } from "react";

export const useModalCrearActualizarTarea = ({ isOpen, onClose, onSave, task }) => {
    // ===== ESTADOS PRINCIPALES =====
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({});
    // ===== NOTIFICACIÓN POR CORREO =====
    const [activo, setActivo] = useState(true);

    // ===== CUSTOM ALERT =====
    const [alert, setAlert] = useState({
        show: false,
        type: "error",
        title: "",
        message: ""
    });

    // ===== MODAL CONFIRMAR CANCELAR =====
    const [showCancelModal, setShowCancelModal] = useState(false);

    // ===== VALORES INICIALES =====
    const [initialValues, setInitialValues] = useState({
        title: "",
        description: "",
        fecha: { day: "", month: "", year: "" },
        hora: { hour: "", minute: "", period: "AM" }
    });

    // ===== FECHA =====
    const [fecha, setFecha] = useState({
        day: "",
        month: "",
        year: ""
    });

    // ===== HORA =====
    const [hora, setHora] = useState({
        hour: "",
        minute: "",
        period: "AM"
    });

    // ===== LISTAS PARA SELECTS =====
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const years = Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() + i
    );

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    const minutes = Array.from(
        { length: 60 },
        (_, i) => String(i).padStart(2, "0")
    );

    // ===== FUNCIONES DE ALERT =====
    const showAlert = (type, title, message) => {
        setAlert({ show: true, type, title, message });
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

    // ===== VERIFICAR SI HAY CAMBIOS =====
    const hasChanges = () => {
        return (
            title !== initialValues.title ||
            description !== initialValues.description ||
            fecha.day !== initialValues.fecha.day ||
            fecha.month !== initialValues.fecha.month ||
            fecha.year !== initialValues.fecha.year ||
            hora.hour !== initialValues.hora.hour ||
            hora.minute !== initialValues.hora.minute ||
            hora.period !== initialValues.hora.period ||
            activo !== initialValues.activo
        );
    };

    // ===== MANEJAR CIERRE =====
    const handleClose = () => {
        if (hasChanges()) {
            setShowCancelModal(true);
        } else {
            onClose();
        }
    };

    // ===== CONFIRMAR CANCELACIÓN =====
    const handleConfirmCancel = () => {
        setShowCancelModal(false);
        onClose();
    };

    // ===== HANDLERS DE CAMBIO CON LIMPIEZA DE ERRORES =====
    const handleTitleChange = (value) => {
        setTitle(value);
        if (errors.titulo) {
            setErrors(prev => ({ ...prev, titulo: "" }));
        }
    };

    const handleDescriptionChange = (value) => {
        setDescription(value);
        if (errors.descripcion) {
            setErrors(prev => ({ ...prev, descripcion: "" }));
        }
    };

    const handleFechaChange = (field, value) => {
        setFecha(prev => ({ ...prev, [field]: value }));
        if (errors.fecha) {
            setErrors(prev => ({ ...prev, fecha: "" }));
        }
    };

    const handleHoraChange = (field, value) => {
        setHora(prev => ({ ...prev, [field]: value }));
        if (errors.hora) {
            setErrors(prev => ({ ...prev, hora: "" }));
        }
    };

    // ===== VALIDACIÓN =====
    const validateForm = () => {
        const newErrors = {};

        // Validar título
        if (!title.trim()) {
            newErrors.titulo = "El título es obligatorio";
        } else if (title.trim().length < 3) {
            newErrors.titulo = "El título debe tener al menos 3 caracteres";
        } else if (title.trim().length > 100) {
            newErrors.titulo = "El título no puede exceder 100 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!]+$/.test(title.trim())) {
            newErrors.titulo = "El título solo puede contener letras, números y signos de puntuación básicos";
        }

        // Validar descripción
        if (!description.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        } else if (description.trim().length > 500) {
            newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
        } else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,;:()\-¿?¡!\n]+$/.test(description.trim())) {
            newErrors.descripcion = "La descripción contiene caracteres no permitidos";
        }

        // Validar fecha
        if (!fecha.day || !fecha.month || !fecha.year) {
            newErrors.fecha = "La fecha completa es obligatoria";
        } else {
            const fechaSeleccionada = new Date(`${fecha.year}-${fecha.month}-${fecha.day}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (isNaN(fechaSeleccionada.getTime())) {
                newErrors.fecha = "Formato de fecha inválido";
            } else if (fechaSeleccionada < hoy) {
                newErrors.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        // Validar hora
        if (!hora.hour || !hora.minute) {
            newErrors.hora = "La hora completa es obligatoria";
        } else if (fecha.day && fecha.month && fecha.year) {
            let h = parseInt(hora.hour);
            if (hora.period === "PM" && h < 12) h += 12;
            if (hora.period === "AM" && h === 12) h = 0;

            const fechaHoraSeleccionada = new Date(
                `${fecha.year}-${fecha.month}-${fecha.day}T${String(h).padStart(2, "0")}:${hora.minute}:00`
            );
            const ahora = new Date();

            if (fechaHoraSeleccionada < ahora) {
                newErrors.hora = "La fecha y hora no pueden ser anteriores a la actual";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== GUARDAR =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formattedDate = `${fecha.year}-${fecha.month}-${fecha.day}`;

        let h = parseInt(hora.hour);
        if (hora.period === "PM" && h < 12) h += 12;
        if (hora.period === "AM" && h === 12) h = 0;
        const formattedTime = `${String(h).padStart(2, "0")}:${hora.minute}`;

        try {
            await onSave({
                ...task,
                title: title.trim(),
                description: description.trim(),
                dueDate: formattedDate,
                dueTime: formattedTime,
                activo
            });

            onClose();
        } catch (error) {
            if (error.response?.data?.errores) {
                setErrors(error.response.data.errores);
                showAlert(
                    "error",
                    "Error del servidor",
                    "Por favor, verifica los campos marcados en rojo"
                );
            } else {
                showAlert(
                    "error",
                    "Error inesperado",
                    "Ocurrió un error al guardar la tarea. Por favor, intenta nuevamente."
                );
            }
        }
    };

    // ===== EFECTO: CARGAR DATOS AL ABRIR/EDITAR =====
    useEffect(() => {
        if (task) {
            // MODO EDICIÓN
            const taskTitle = task.title || "";
            const taskDescription = task.description || "";

            setTitle(taskTitle);
            setDescription(taskDescription);
            setErrors({});
            setAlert({ show: false, type: "error", title: "", message: "" });
            // MODO EDICIÓN
            setActivo(task.activo !== undefined ? task.activo : true);

            // MODO CREAR
            let taskFecha = { day: "", month: "", year: "" };
            let taskHora = { hour: "", minute: "", period: "AM" };

            // Procesar fecha
            if (task.dueDateOriginal || task.dueDate) {
                const dateObj = new Date(task.dueDateOriginal || task.dueDate);
                const year = dateObj.getUTCFullYear();
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                const day = String(dateObj.getUTCDate()).padStart(2, "0");

                taskFecha = { day, month, year: String(year) };
                setFecha(taskFecha);
            }

            // Procesar hora
            if (task.dueTime) {
                let [h, min] = task.dueTime.split(":");
                let hourNum = parseInt(h);
                let period = "AM";
                let displayHour = hourNum;

                if (hourNum === 0) {
                    displayHour = 12;
                    period = "AM";
                } else if (hourNum === 12) {
                    displayHour = 12;
                    period = "PM";
                } else if (hourNum > 12) {
                    displayHour = hourNum - 12;
                    period = "PM";
                } else {
                    displayHour = hourNum;
                    period = "AM";
                }

                taskHora = {
                    hour: String(displayHour),
                    minute: min,
                    period
                };
                setHora(taskHora);
            }

            // Guardar valores iniciales
            setInitialValues({
                title: taskTitle,
                description: taskDescription,
                fecha: taskFecha,
                hora: taskHora,
                activo: task.activo !== undefined ? task.activo : true
            });
        } else {
            // MODO CREAR
            setTitle("");
            setActivo(true); 
            setDescription("");
            setFecha({ day: "", month: "", year: "" });
            setHora({ hour: "", minute: "", period: "AM" });
            setErrors({});
            setAlert({ show: false, type: "error", title: "", message: "" });

            setInitialValues({
                title: "",
                description: "",
                fecha: { day: "", month: "", year: "" },
                hora: { hour: "", minute: "", period: "AM" },
                activo: true
            });
        }
    }, [task, isOpen]);

    // ===== RETORNAR TODO LO NECESARIO =====
    return {
        // Estados
        title,
        description,
        fecha,
        hora,
        errors,
        alert,
        showCancelModal,
        activo,

        // Listas
        days,
        months,
        years,
        hours,
        minutes,

        // Funciones
        showAlert,
        closeAlert,
        handleClose,
        handleConfirmCancel,
        handleTitleChange,
        handleDescriptionChange,
        handleFechaChange,
        handleHoraChange,
        handleSubmit,
        setShowCancelModal,
        setActivo,
    };
};