from flask import Blueprint, request, jsonify
from database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para autenticar usuarios"""
    try:
        data = request.get_json()
        
        # Validar que los datos requeridos están presentes
        if not data or not data.get('cedula') or not data.get('password'):
            return jsonify({'error': 'Cédula y contraseña son requeridas'}), 400
        
        cedula = data.get('cedula')
        password = data.get('password')
        
        # Consultar el usuario en la base de datos
        query = "SELECT cedula, correoelectronico, contraseña FROM usuarios WHERE cedula = %s"
        result = db.execute_query(query, (cedula,))
        
        if not result:
            return jsonify({'error': 'Credenciales incorrectas'}), 401
        
        usuario = result[0]
        
        # Validar la contraseña (en producción, usar hashing)
        if usuario['contraseña'] != password:
            return jsonify({'error': 'Credenciales incorrectas'}), 401
        
        # Retornar datos del usuario
        return jsonify({
            'cedula': usuario['cedula'],
            'correoelectronico': usuario['correoelectronico']
        }), 200
    
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
