import "../styles/registro.css";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useRegistro } from "../hooks/useRegistro";

export function Registro() {
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
    registrarUsuario
  } = useRegistro();

  return (
    <div className="contenedor-registro">
      <form
        className="formulario-registro"
        onSubmit={(e) => {
          e.preventDefault();
          registrarUsuario();
        }}
      >
        <Link to="/" className="btn-volver">
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
              required
            />
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
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="3">Tutor</option>
              <option value="2">Estudiante</option>
            </select>
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              placeholder="Ej. 5512345678"
              value={formData.telefono}
              onChange={handleChange}
              pattern="[0-9]{10}"
              required
            />
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
              required
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
              required
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
              required
            >
              <option value="">Año</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
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
                required
              />
              <span>Mujer</span>
            </label>

            <label className="radio-opcion-registro">
              <input
                type="radio"
                name="genero"
                value="hombre"
                onChange={handleChange}
              />
              <span>Hombre</span>
            </label>

            <label className="radio-opcion-registro">
              <input
                type="radio"
                name="genero"
                value="otro"
                onChange={handleChange}
              />
              <span>Otro</span>
            </label>
          </div>
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
            required
          />
        </div>

        {/* CONTRASEÑAS */}
        <div className="fila-campos">
          <div className="campo campo-password">
            <label>Contraseña</label>
            <div className="input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                name="contraseña"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                required
              />
              <span
                className="icono-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          <div className="campo campo-password">
            <label>Confirmar contraseña</label>
            <div className="input-password">
              <input
                type={mostrarConfirmPassword ? "text" : "password"}
                name="confirmarContraseña"
                placeholder="Confirmar contraseña"
                value={formData.confirmarContraseña}
                onChange={handleChange}
                required
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
          </div>
        </div>

        <button type="submit" className="btn-registrar">
          Registrarse
        </button>

        <p className="texto-login">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}