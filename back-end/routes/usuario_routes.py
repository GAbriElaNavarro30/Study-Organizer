from flask import Blueprint, jsonify, request
from models.usuario_model import UsuarioModel

usuario_bp = Blueprint("usuario_bp", __name__, url_prefix="/usuarios")

# ============================ Obtener usuarios ===========================
@usuario_bp.route("/", methods=["GET"])
def get_usuarios():
    usuarios = UsuarioModel.obtener_usuarios()
    return jsonify(usuarios)

# ============================= crear usuario =============================
@usuario_bp.route("/", methods=["POST"])
def crear_usuario():
    try:
        data = request.json
        UsuarioModel.crear_usuario(data)

        return {"message": "Usuario registrado correctamente"}, 201

    except ValueError as e:
        return {"error": str(e)}, 400

