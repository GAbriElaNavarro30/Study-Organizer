from flask import Blueprint, jsonify, request
from models.rol_model import RolModel

rol_bp = Blueprint("rol_bp", __name__, url_prefix="/roles")

# ============================ Obtener todos los roles ===========================
@rol_bp.route("/", methods=["GET"])
def get_roles():
    roles = RolModel.obtener_roles()
    return jsonify(roles)