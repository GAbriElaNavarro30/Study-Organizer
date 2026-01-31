import re
from config import get_db_connection
from werkzeug.security import generate_password_hash

class UsuarioModel:

    # ================================ obtener todos los usuarios =================
    @staticmethod
    def obtener_usuarios():
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM Usuario"
        cursor.execute(query)
        usuarios = cursor.fetchall()

        cursor.close()
        connection.close()
        return usuarios

    # ================================= reglas de valdiacion ======================
    @staticmethod
    def validar_usuario(data):
        nombre = data.get("nombre_usuario", "").strip()

        if not nombre:
            return "El nombre es obligatorio"

        # Solo letras y espacios (incluye acentos)
        patron = r"^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
        if not re.match(patron, nombre):
            return "El nombre solo debe contener letras y espacios"

        return None


    # ============================ Crear usuario ================================
    @staticmethod
    def crear_usuario(data):
        error = UsuarioModel.validar_usuario(data)
        if error:
            raise ValueError(error)
            
        connection = get_db_connection()
        cursor = connection.cursor()

        password_hash = generate_password_hash(data["contraseña"])

        query = """
        INSERT INTO Usuario 
        (nombre_usuario, telefono, fecha_nacimiento, genero,
         correo_electronico, contraseña, id_rol)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(query, (
            data["nombre_usuario"],
            data["telefono"],
            data["fecha_nacimiento"],
            data["genero"],
            data["correo_electronico"],
            password_hash,          # contraseña cifrada
            int(data["id_rol"])
        ))

        connection.commit()
        cursor.close()
        connection.close()