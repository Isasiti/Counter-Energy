from flask import Flask
from flask_cors import CORS
from database import db
from config import config
import os
import os
from dotenv import load_dotenv
load_dotenv()
#Prueba
# Si no encuentra la variable DB_HOST, por defecto usará 'localhost' (así te sigue funcionando a ti en tu PC)
db_host = os.getenv('DB_HOST', 'localhost')
def create_app(config_name='development'):
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Habilitar CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Registrar blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    from routes.dispositivos import dispositivos_bp
    app.register_blueprint(dispositivos_bp)
    
    # Conectar a la base de datos al iniciar
    @app.before_request
    def before_request():
        if not db.connection or not db.connection.is_connected():
            db.connect()
    
    # Desconectar de la base de datos al terminar
    @app.teardown_appcontext
    def teardown_db(exception=None):
        pass
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=3000, debug=True)
