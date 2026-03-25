import { useState } from "react";

// ================================================================
//  DATOS — preguntas y respuestas por categoría
// ================================================================
const CATEGORIAS = [
    {
        id: "general",
        titulo: "General",
        preguntas: [
            {
                id: "g1",
                pregunta: "¿Qué es Study Organizer?",
                respuesta:
                    "Study Organizer es una plataforma web de apoyo al aprendizaje académico y bienestar emocional para estudiantes de educación superior. Combina herramientas de organización académica (tareas, notas), evaluación del estilo de aprendizaje, importancia del bienestar emocional y cursos de mejora de hábitos de estudio.",
            },
            {
                id: "g2",
                pregunta: "¿Es gratuita la plataforma?",
                respuesta:
                    "Sí, Study Organizer es completamente gratuita. Solo necesitas crear una cuenta para acceder a todas las funciones disponibles.",
            },
            {
                id: "g3",
                pregunta: "¿En qué dispositivos puedo usar Study Organizer?",
                respuesta:
                    "Puedes acceder desde cualquier dispositivo como: computadora, tableta o teléfono móvil con conexión a internet y un navegador web. La plataforma está diseñada para adaptarse a diferentes pantallas.",
            },
        ],
    },
    {
        id: "cuenta",
        titulo: "Cuenta y registro",
        preguntas: [
            {
                id: "c1",
                pregunta: "¿Cómo me registro en la plataforma?",
                respuesta:
                    "Haz clic en el botón 'Registrarse'. Deberás proporcionar tu nombre, rol (Estudiante o Tutor), teléfono, fecha de nacimiento, género, correo electrónico y una contraseña segura.",
            },
            {
                id: "c2",
                pregunta: "¿Olvidé mi contraseña, qué hago?",
                respuesta:
                    "En la pantalla de inicio de sesión encontrarás '¿Olvidaste tu contraseña?'. Ingresa tu correo electrónico y te enviaremos un enlace de recuperación. Si no tienes acceso a ese correo, usa la opción 'Usar otro método de recuperación' e ingresa tu correo principal, si tienes un correo alternativo registrado, el sistema te permitirá enviar el enlace ahí.",
            },
            {
                id: "c3",
                pregunta: "¿Puedo cambiar mi correo electrónico?",
                respuesta:
                    "Sí. Desde tu perfil puedes actualizar tu correo electrónico principal. También puedes registrar un correo alternativo opcional, que sirve como método de recuperación de cuenta en caso de perder acceso al correo principal.",
            },
            {
                id: "c4",
                pregunta: "¿Cómo actualizo mi foto de perfil o portada?",
                respuesta:
                    "En tu página de perfil puedes cambiar tanto la foto de perfil como la foto de portada. Al seleccionar una imagen se abrirá un editor donde podrás arrastrar y hacer zoom para ajustar el encuadre antes de guardar.",
            },
            {
                id: "c5",
                pregunta: "¿Puedo eliminar mi cuenta?",
                respuesta: "c5_jsx", // renderizado especial en PreguntasFrecuentes.jsx
                jsx: true,
            },
        ],
    },
    {
        id: "tareas",
        titulo: "Tareas",
        preguntas: [
            {
                id: "t1",
                pregunta: "¿Cómo creo una tarea?",
                respuesta:
                    "Desde el módulo de Tareas haz clic en el botón de nueva tarea. Se abrirá un formulario donde puedes ingresar el título, descripción, fecha, hora y activar el recordatorio por correo electrónico si lo deseas.",
            },
            {
                id: "t2",
                pregunta: "¿Cómo funcionan los recordatorios de tareas?",
                respuesta:
                    "Si activas el recordatorio al crear una tarea, recibirás dos notificaciones por correo: una 1 día antes a las 11:59 p.m. y otra 1 hora antes de la fecha y hora registrada. Si marcas la tarea como completada antes de esos tiempos, no recibirás las notificaciones.",
            },
            {
                id: "t3",
                pregunta: "¿Qué pasa si no completo una tarea a tiempo?",
                respuesta:
                    "Si la fecha y hora de una tarea se cumplen sin que la hayas marcado como completada, el sistema la cambia automáticamente a estado 'Vencida'. Puedes actualizar esa tarea en cualquier momento y marcarla como completada después.",
            },
            {
                id: "t4",
                pregunta: "¿Puedo ver un resumen de mis tareas?",
                respuesta:
                    "Sí. En el módulo de Tareas puedes ver el total de tareas generadas, pendientes, completadas y vencidas en tiempo real.",
            },
        ],
    },
    {
        id: "notas",
        titulo: "Notas",
        preguntas: [
            {
                id: "n1",
                pregunta: "¿Qué puedo hacer con el módulo de Notas?",
                respuesta:
                    "Puedes crear, editar, renombrar y eliminar notas, además puedes exportar y compartir notas en PDF. El editor es de texto te ofrece personalizar tus notas con opciones de utilizar negritas, cursiva, subrayado, alineación, listas, cambio de fuente, tamaño, color de texto, color de fondo y resaltado. Además incluye la opción de dictado de voz.",
            },
            {
                id: "n2",
                pregunta: "¿Cómo comparto una nota?",
                respuesta:
                    "Desde la lista de notas haz clic en el ícono de compartir sobre la nota. Puedes enviar la nota en PDF por correo electrónico o Telegram. El sistema guarda automáticamente los destinatarios recientes y puedes asignarles un nombre para identificarlos fácilmente.",
            },
            {
                id: "n3",
                pregunta: "¿Cómo usar el dictado por voz?",
                respuesta:
                    "En el editor de notas encontrarás el botón 'Dictar texto'. Al activarlo, puedes hablar y el sistema transcribirá tu voz al contenido de la nota. Funciona mejor en navegadores como Chrome o Edge.",
            },
            {
                id: "n4",
                pregunta: "¿Puedo tener dos notas con el mismo título?",
                respuesta:
                    "No. El sistema no permite títulos duplicados en tus notas. Si intentas crear o renombrar una nota con un título que ya existe, recibirás un mensaje que te indica que debes cambiar el título por uno distinto.",
            },
        ],
    },
    {
        id: "estilos",
        titulo: "Estilos de aprendizaje",
        preguntas: [
            {
                id: "e1",
                pregunta: "¿Qué es el test de estilos de aprendizaje?",
                respuesta:
                    "Es un test de 16 preguntas basado en el Modelo VARK (Visual, Auditivo, Lector/Escritor, Kinestésico) creado por Neil D. Fleming. Evalúa cómo prefieres recibir y procesar nueva información. Puedes seleccionar más de una opción por pregunta si varias te representan.",
            },
            {
                id: "e2",
                pregunta: "¿Cuántas veces puedo hacer el test?",
                respuesta:
                    "Puedes realizarlo las veces que quieras. El sistema guarda el historial de todos tus intentos con fecha y hora, para que puedas ver cómo evoluciona tu perfil de aprendizaje con el tiempo.",
            },
            {
                id: "e3",
                pregunta: "¿Qué me muestra el resultado del test?",
                respuesta:
                    "Al terminar verás tu perfil dominante (por ejemplo: Visual, Auditivo-Kinestésico o Multimodal), la distribución de tus respuestas en cada categoría con porcentajes, un gráfico radial y recomendaciones personalizadas generadas por el sistema experto tu perfil.",
            },
            {
                id: "e4",
                pregunta: "¿Puedo ver mis resultados anteriores?",
                respuesta:
                    "Sí. Puedes consultar el último resultado guardado. En la página informativa del módulo aparece un indicador si ya has realizado el test anteriormente.",
            },
        ],
    },
    {
        id: "dashboard",
        titulo: "Dashboard y bienestar",
        preguntas: [
            {
                id: "d1",
                pregunta: "¿Qué muestra el Dashboard?",
                respuesta:
                    "El Dashboard centraliza tu información: foto de perfil, nombre y rol, resultados del test de estilos de aprendizaje y del test de métodos de estudio, y tu registro emocional con las emociones más predominantes.",
            },
            {
                id: "d2",
                pregunta: "¿Cómo funciona el registro emocional?",
                respuesta:
                    "Una vez al día puedes seleccionar una emoción de una escala predeterminada para registrar cómo te sientes. Si ninguna emoción te representa, puedes registrar una propia y el sistema la agregará a tus opciones personales.",
            },
        ],
    },
    {
        id: "metodos",
        titulo: "Métodos de estudio",
        preguntas: [
            {
                id: "m1",
                pregunta: "¿Qué es el test de métodos de estudio?",
                respuesta:
                    "Es un test que evalúa tus hábitos de estudio en distintas dimensiones. Cada pregunta tiene 4 opciones en escala Likert: Nunca, Rara vez, Frecuentemente y Siempre. A diferencia del test VARK, en este test solo puedes elegir una opción por pregunta.",
            },
            {
                id: "m2",
                pregunta: "¿Cuántas veces puedo hacer el test de métodos de estudio?",
                respuesta:
                    "Puedes realizarlo las veces que quieras. El sistema guarda el historial de todos tus intentos con fecha y hora para que puedas ver tu evolución.",
            },
            {
                id: "m3",
                pregunta: "¿Qué me muestran los resultados?",
                respuesta:
                    "Los resultados te muestran los errores detectados en tus hábitos de estudio y recomendaciones para mejorarlos. Las recomendaciones también toman en cuenta tu perfil de estilos de aprendizaje si ya realizaste ese test. Además se te sugerirán cursos informativos publicados por tutores relacionados con tu perfil.",
            },
            {
                id: "m4",
                pregunta: "¿Necesito haber hecho el test de estilos de aprendizaje primero?",
                respuesta:
                    "No es obligatorio, pero se recomienda. Si ya tienes un perfil VARK registrado, el sistema podrá brindarte recomendaciones más precisas combinando ambos resultados.",
            },
        ],
    },
    {
        id: "cursos",
        titulo: "Cursos",
        preguntas: [
            {
                id: "cu1",
                pregunta: "¿Qué son los cursos en Study Organizer?",
                respuesta:
                    "Son cursos informativos breves publicados por tutores, diseñados para ayudarte a mejorar tus hábitos de estudio de acuerdo a tu estilo de aprendizaje. Cada curso tiene contenido informativo y pequeños tests de práctica.",
            },
            {
                id: "cu2",
                pregunta: "¿Cómo se me recomiendan los cursos?",
                respuesta:
                    "Los cursos se recomiendan automáticamente según tu perfil de estilos de aprendizaje y los resultados de tu test de métodos de estudio. También puedes explorarlos libremente desde el módulo de Cursos.",
            },
            {
                id: "cu3",
                pregunta: "¿Puedo retomar un curso en el punto donde me quedé?",
                respuesta:
                    "Sí. El sistema guarda tu progreso automáticamente para que puedas continuar desde donde te quedaste en cualquier momento.",
            },
            {
                id: "cu4",
                pregunta: "¿Puedo tomar el mismo curso más de una vez?",
                respuesta:
                    "Sí. Aunque el curso quede marcado como finalizado, puedes volver a tomarlo las veces que desees.",
            },
            {
                id: "cu5",
                pregunta: "¿Puedo publicar un curso si soy tutor?",
                respuesta:
                    "Sí. Si tu rol es Tutor, puedes crear y publicar cursos asociados a un perfil de aprendizaje. También puedes ver qué usuarios han tomado tus cursos y sus resultados.",
            },
        ],
    },
    {
        id: "soporte",
        titulo: "Soporte y contacto",
        preguntas: [
            {
                id: "s1",
                pregunta: "¿Cómo puedo reportar un problema técnico?",
                respuesta: "s1_jsx", // renderizado especial en PreguntasFrecuentes.jsx
                jsx: true,
            },
            {
                id: "s2",
                pregunta: "¿Cuánto tiempo tardan en responder mis mensajes?",
                respuesta:
                    "Intentamos responder todos los mensajes en un plazo máximo de 48 horas hábiles. Si tu caso es urgente, indícalo en el asunto de tu mensaje.",
            },
            {
                id: "s3",
                pregunta: "¿Tienen redes sociales donde pueda hacer preguntas?",
                respuesta: "s3_jsx", // renderizado especial en PreguntasFrecuentes.jsx
                jsx: true,
            },
        ],
    },
];

// ================================================================
//  HOOK
// ================================================================
export function usePreguntasFrecuentes() {
    // ID de la pregunta actualmente abierta (null = ninguna)
    const [abierta, setAbierta] = useState(null);

    // Categoría activa para filtrar (null = todas)
    const [categoriaActiva, setCategoriaActiva] = useState(null);

    const togglePregunta = (id) => {
        setAbierta((prev) => (prev === id ? null : id));
    };

    const seleccionarCategoria = (id) => {
        setCategoriaActiva((prev) => (prev === id ? null : id));
        setAbierta(null); // cerrar cualquier pregunta abierta al cambiar categoría
    };

    // Categorías visibles según filtro activo
    const categoriasFiltradas = categoriaActiva
        ? CATEGORIAS.filter((c) => c.id === categoriaActiva)
        : CATEGORIAS;

    return {
        categorias: CATEGORIAS,
        categoriasFiltradas,
        categoriaActiva,
        abierta,
        togglePregunta,
        seleccionarCategoria,
    };
}