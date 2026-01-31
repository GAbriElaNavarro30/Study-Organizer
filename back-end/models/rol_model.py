from config import get_db_connection

class RolModel:

# ================================ obetener todos los roles ====================================
    @staticmethod
    def obtener_roles():
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM Rol"
        cursor.execute(query)
        roles = cursor.fetchall()

        cursor.close()
        connection.close()
        return roles