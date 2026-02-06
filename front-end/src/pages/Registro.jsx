import React from "react";
import "../styles/registro.css";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useRegistro } from "../hooks/useRegistro";
import { useNavigate } from "react-router-dom";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";

export function Registro() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [nextPath, setNextPath] = React.useState(null);

  const navigate = useNavigate();
  const {
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
    errores
  } = useRegistro();

  // --------------- alertas ----------------
  const [alertData, setAlertData] = React.useState({
    visible: false,
    type: "success", // "success" o "error"
    title: "",
    message: "",
  });

  const showAlert = (type, title, message) => {
    setAlertData({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleCloseAlert = () => {
    setAlertData(prev => ({ ...prev, visible: false }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registrarUsuario();

    if (result.success) {
      showAlert("success", "¡Registro exitoso!", "Tu cuenta ha sido creada correctamente.");
    } else {
      showAlert("error", "Error", result.message || "Ocurrió un problema al registrar la cuenta.");
    }
  };

  const hayDatosIngresados = () => {
    return Object.values(formData).some(value => value !== "");
  };

  const handleVolverClick = (e) => {
    e.preventDefault(); // previene navegación automática
    if (hayDatosIngresados()) {
      setNextPath("/"); // ruta a donde queremos ir si confirma
      setModalVisible(true);
    } else {
      navigate("/"); // navega directamente si no hay datos
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (hayDatosIngresados()) {
      setNextPath("/login");
      setModalVisible(true);
    } else {
      navigate("/login");
    }
  };




  return (
    <div className="contenedor-registro">
      <form onSubmit={handleSubmit}
        className="formulario-registro"
      >
        <Link to="/" className="btn-volver" onClick={handleVolverClick}>
          <IoArrowBack />
        </Link>

        <h2>Crea una cuenta</h2>
        <p>Es fácil y seguro.</p>

        <hr className="separador" />

        {/* NOMBRE */}
        <div className="fila-campos">
          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre_usuario"
              placeholder="Nombre"
              value={formData.nombre_usuario}
              onChange={handleChange}
              className={errores.nombre_usuario ? "input-error" : ""}

            />

            {errores.nombre_usuario && (
              <span className="mensaje-error">
                {errores.nombre_usuario}
              </span>
            )}
          </div>
        </div>

        {/* ROL Y TELÉFONO */}
        <div className="fila-campos">
          <div className="campo">
            <label>Rol</label>
            <select
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              className={errores.id_rol ? "input-error" : ""}
            >
              <option value="">Selecciona un rol</option>
              <option value="3">Tutor</option>
              <option value="2">Estudiante</option>
            </select>

            {errores.id_rol && (
              <span className="mensaje-error">
                {errores.id_rol}
              </span>
            )}
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              placeholder="Ej. 5512345678"
              value={formData.telefono}
              onChange={handleChange}

              className={errores.telefono ? "input-error" : ""}

            />

            {errores.telefono && (
              <span className="mensaje-error">
                {errores.telefono}
              </span>
            )}
          </div>
        </div>

        {/* FECHA */}
        <div className="campo">
          <label>Fecha de nacimiento</label>

          <div className="fecha-nacimiento-registro">
            <select
              value={fechaNacimiento.day}
              onChange={(e) =>
                handleFechaChange(
                  e.target.value,
                  fechaNacimiento.month,
                  fechaNacimiento.year
                )
              }
            >
              <option value="">Día</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={fechaNacimiento.month}
              onChange={(e) =>
                handleFechaChange(
                  fechaNacimiento.day,
                  e.target.value,
                  fechaNacimiento.year
                )
              }
            >
              <option value="">Mes</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            <select
              value={fechaNacimiento.year}
              onChange={(e) =>
                handleFechaChange(
                  fechaNacimiento.day,
                  fechaNacimiento.month,
                  e.target.value
                )
              }
            >
              <option value="">Año</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {errores.fecha_nacimiento && (
            <span className="mensaje-error">
              {errores.fecha_nacimiento}
            </span>
          )}
        </div>


        {/* GÉNERO */}
        <div className="campo">
          <label>Género</label>

          <div className="opciones-genero-registro">
            <label className="radio-opcion-registro">
              <input
                type="radio"
                name="genero"
                value="mujer"
                onChange={handleChange}
                checked={formData.genero === "mujer"}
              />
              <span>Mujer</span>
            </label>

            <label className="radio-opcion-registro">
              <input
                type="radio"
                name="genero"
                value="hombre"
                onChange={handleChange}
                checked={formData.genero === "hombre"}
              />
              <span>Hombre</span>
            </label>

            <label className="radio-opcion-registro">
              <input
                type="radio"
                name="genero"
                value="otro"
                onChange={handleChange}
                checked={formData.genero === "otro"}
              />
              <span>Otro</span>
            </label>
          </div>

          {errores.genero && (
            <span className="mensaje-error">
              {errores.genero}
            </span>
          )}
        </div>


        {/* CORREO */}
        <div className="campo">
          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo_electronico"
            placeholder="correo@example.com"
            value={formData.correo_electronico}
            onChange={handleChange}
            className={errores.correo_electronico ? "input-error" : ""}
          />

          {errores.correo_electronico && (
            <span className="mensaje-error">
              {errores.correo_electronico}
            </span>
          )}
        </div>


        {/* CONTRASEÑAS */}
        <div className="fila-campos">
          {/* CONTRASEÑA */}
          <div className="campo campo-password">
            <label>Contraseña</label>

            <div className="input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Contraseña"
                value={formData.contrasena}
                onChange={handleChange}
                className={errores.contrasena ? "input-error" : ""}
              />

              <span
                className="icono-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>

            {errores.contrasena && (
              <span className="mensaje-error">
                {errores.contrasena}
              </span>
            )}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="campo campo-password">
            <label>Confirmar contraseña</label>

            <div className="input-password">
              <input
                type={mostrarConfirmPassword ? "text" : "password"}
                name="confirmarContrasena"
                placeholder="Confirmar contraseña"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                className={errores.confirmarContrasena ? "input-error" : ""}
              />

              <span
                className="icono-password"
                onClick={() =>
                  setMostrarConfirmPassword(!mostrarConfirmPassword)
                }
              >
                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>

            {errores.confirmarContrasena && (
              <span className="mensaje-error">
                {errores.confirmarContrasena}
              </span>
            )}
          </div>
        </div>


        <button type="submit" className="btn-registrar">
          Registrarse
        </button>

        <p className="texto-login">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" onClick={handleLoginClick}>Inicia sesión</Link>
        </p>
      </form>

      <ModalConfirmarCancelar
        isOpen={modalVisible}
        onConfirm={() => {
          setModalVisible(false);
          navigate(nextPath); // navega a la ruta guardada
        }}
        onCancel={() => setModalVisible(false)} // cierra modal si cancela
      />


      {alertData.visible && (
        <CustomAlert
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          logo={logo}
          onClose={() => {
            handleCloseAlert();
            if (alertData.type === "success") {
              navigate("/login"); // navega solo si fue éxito
            }
          }}
        />
      )}




    </div>

  );
}