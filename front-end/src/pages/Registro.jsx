import "../styles/registro.css";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useState } from "react";

export function Registro() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState({
    day: "",
    month: "",
    year: "",
  });

  // Generar opciones
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const handleFechaChange = (d, m, y) => {
    setFechaNacimiento({ day: d, month: m, year: y });
  };

  return (
    <div className="contenedor-registro">
      <form className="formulario-registro">
        <Link to="/" className="btn-volver">
          <IoArrowBack />
        </Link>

        <h2>Crea una cuenta</h2>
        <p>Es fácil y seguro.</p>

        <hr className="separador" />

        {/* FILA 1: Nombre y Teléfono */}
        <div className="fila-campos">
          <div className="campo">
            <label>Nombre</label>
            <input type="text" placeholder="Nombre" required />
          </div>


        </div>

        <div className="fila-campos">
          <div className="campo">
            <label>Rol</label>
            <select required>
              <option value="">Selecciona un rol</option>
              <option value="Tutor">Tutor</option>
              <option value="Estudiante">Estudiante</option>
            </select>
          </div>


          <div className="campo">
            <label>Teléfono</label>
            <input type="tel" placeholder="Ej. 5512345678" pattern="[0-9]{10}" required />
          </div>
        </div>

        {/* FILA 2: Fecha de nacimiento estilo Facebook */}
        <div className="campo">
          <label>Fecha de nacimiento</label>
          <div className="fecha-nacimiento-registro">
            <select
              value={fechaNacimiento.day}
              onChange={(e) => handleFechaChange(e.target.value, fechaNacimiento.month, fechaNacimiento.year)}
              required
            >
              <option value="">Día</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={fechaNacimiento.month}
              onChange={(e) => handleFechaChange(fechaNacimiento.day, e.target.value, fechaNacimiento.year)}
              required
            >
              <option value="">Mes</option>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>

            <select
              value={fechaNacimiento.year}
              onChange={(e) => handleFechaChange(fechaNacimiento.day, fechaNacimiento.month, e.target.value)}
              required
            >
              <option value="">Año</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* FILA 3: Género */}
        <div className="campo">
          <label>Género</label>
          <div className="opciones-genero-registro">
            <label className="radio-opcion-registro">
              <input type="radio" name="genero" value="mujer" required />
              <span>Mujer</span>
            </label>

            <label className="radio-opcion-registro">
              <input type="radio" name="genero" value="hombre" />
              <span>Hombre</span>
            </label>

            <label className="radio-opcion-registro">
              <input type="radio" name="genero" value="otro" />
              <span>Otro</span>
            </label>
          </div>
        </div>

        {/* FILA 4: Correo */}
        <div className="campo">
          <label>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" required />
        </div>

        {/* FILA 5: Contraseñas */}
        <div className="fila-campos">
          <div className="campo campo-password">
            <label>Contraseña</label>
            <div className="input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="••••••••"
                required
              />
              <span className="icono-password" onClick={() => setMostrarPassword(!mostrarPassword)}>
                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          <div className="campo campo-password">
            <label>Confirmar contraseña</label>
            <div className="input-password">
              <input
                type={mostrarConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
              />
              <span className="icono-password" onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}>
                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-registrar">Registrarse</button>

        <p className="texto-login">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
