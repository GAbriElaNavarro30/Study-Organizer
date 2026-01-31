from flask import Flask
from flask_cors import CORS
from routes.rol_routes import rol_bp
from routes.usuario_routes import usuario_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(rol_bp)
app.register_blueprint(usuario_bp)

@app.route("/")
def home():
    return {"message": "Servidor funcionando"}

if __name__ == "__main__":
    app.run(debug=True)
