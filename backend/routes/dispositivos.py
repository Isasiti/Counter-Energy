from flask import Blueprint, request, jsonify
from database import db

dispositivos_bp = Blueprint('dispositivos', __name__, url_prefix='/api/dispositivos')


@dispositivos_bp.route('', methods=['GET'])
def list_dispositivos():
    usuario = request.args.get('usuario', '')
    try:
        if not usuario:
            return jsonify({'error': 'Usuario requerido'}), 400
        query = "SELECT id, usuario_cedula, nombre, modelo, device_id, consumo FROM dispositivos WHERE usuario_cedula = %s"
        result = db.execute_query(query, (usuario,))
        return jsonify(result or []), 200
    except Exception as e:
        print(f"Error listando dispositivos: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('', methods=['POST'])
def create_dispositivo():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        usuario_cedula = data.get('usuario_cedula') or data.get('usuario') or ''
        nombre = data.get('nombre')
        modelo = data.get('modelo')
        device_id = data.get('device_id')
        if not usuario_cedula or not nombre or not modelo or not device_id:
            return jsonify({'error': 'Campos incompletos'}), 400

        insert_q = "INSERT INTO dispositivos (usuario_cedula, nombre, modelo, device_id) VALUES (%s, %s, %s, %s)"
        affected = db.execute_update(insert_q, (usuario_cedula, nombre, modelo, device_id))
        if not affected:
            return jsonify({'error': 'No se pudo crear el dispositivo'}), 500

        fetch_q = "SELECT id, usuario_cedula, nombre, modelo, device_id, consumo FROM dispositivos WHERE usuario_cedula = %s AND device_id = %s ORDER BY id DESC LIMIT 1"
        created = db.execute_query(fetch_q, (usuario_cedula, device_id))
        if created:
            return jsonify(created[0]), 201
        return jsonify({'error': 'No se pudo recuperar el dispositivo creado'}), 500
    except Exception as e:
        print(f"Error creando dispositivo: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/<int:device_id>', methods=['PUT'])
def update_dispositivo(device_id: int):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        nombre = data.get('nombre')
        modelo = data.get('modelo')
        device_identifier = data.get('device_id')
        if not nombre or not modelo or not device_identifier:
            return jsonify({'error': 'Campos incompletos'}), 400

        update_q = "UPDATE dispositivos SET nombre = %s, modelo = %s, device_id = %s WHERE id = %s"
        affected = db.execute_update(update_q, (nombre, modelo, device_identifier, device_id))
        if not affected:
            return jsonify({'error': 'No se pudo actualizar el dispositivo'}), 400

        fetch_q = "SELECT id, usuario_cedula, nombre, modelo, device_id, consumo FROM dispositivos WHERE id = %s"
        result = db.execute_query(fetch_q, (device_id,))
        return jsonify(result[0] if result else {}), 200
    except Exception as e:
        print(f"Error actualizando dispositivo: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/<int:device_id>', methods=['DELETE'])
def delete_dispositivo(device_id: int):
    try:
        delete_q = "DELETE FROM dispositivos WHERE id = %s"
        affected = db.execute_update(delete_q, (device_id,))
        if not affected:
            return jsonify({'error': 'No se pudo eliminar el dispositivo'}), 400
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"Error eliminando dispositivo: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/<int:device_id>/status', methods=['GET'])
def dispositivo_status(device_id: int):
    try:
        # Intentar devolver un estado si existe en la tabla; si no, retornar null
        fetch_q = "SELECT * FROM dispositivos WHERE id = %s"
        result = db.execute_query(fetch_q, (device_id,))
        if not result:
            return jsonify({'error': 'Dispositivo no encontrado'}), 404
        row = result[0]
        for key in ('status', 'estado', 'rele', 'on', 'activo'):
            if key in row:
                return jsonify({'status': bool(row[key])}), 200
        return jsonify({'status': None}), 200
    except Exception as e:
        print(f"Error consultando estado: {e}")
        return jsonify({'status': None}), 500


@dispositivos_bp.route('/<int:device_id>/control', methods=['POST'])
def dispositivo_control(device_id: int):
    try:
        data = request.get_json()
        if not data or 'action' not in data:
            return jsonify({'error': 'Campo action requerido'}), 400
        # Control físico no implementado: placeholder
        return jsonify({'success': False, 'error': 'Control no implementado en backend'}), 501
    except Exception as e:
        print(f"Error controlando dispositivo: {e}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500
