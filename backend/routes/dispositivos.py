from flask import Blueprint, request, jsonify
from database import db
from remote_controller import remote_controller

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
        # Verificar que el dispositivo existe en la BD
        fetch_q = "SELECT id, device_id FROM dispositivos WHERE id = %s"
        result = db.execute_query(fetch_q, (device_id,))
        if not result:
            return jsonify({'error': 'Dispositivo no encontrado'}), 404
        
        # Obtener estado del dispositivo remoto
        status_data = remote_controller.get_status()
        if status_data is None:
            return jsonify({'status': None, 'error': 'No se pudo conectar al dispositivo'}), 503
        
        # Extraer estado del relé
        rele_state = status_data.get('rele', None)
        return jsonify({
            'status': bool(rele_state) if rele_state is not None else None,
            'potencia': status_data.get('potencia', 0),
            'irms': status_data.get('irms', 0)
        }), 200
    except Exception as e:
        print(f"Error consultando estado: {e}")
        return jsonify({'status': None, 'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/<int:device_id>/control', methods=['POST'])
def dispositivo_control(device_id: int):
    try:
        data = request.get_json()
        if not data or 'action' not in data:
            return jsonify({'error': 'Campo action requerido'}), 400
        
        # Verificar que el dispositivo existe en la BD
        fetch_q = "SELECT id, nombre FROM dispositivos WHERE id = %s"
        result = db.execute_query(fetch_q, (device_id,))
        if not result:
            return jsonify({'error': 'Dispositivo no encontrado'}), 404
        
        device = result[0]
        action = data.get('action')  # True = encender, False = apagar
        
        # Ejecutar control en el dispositivo remoto
        success = remote_controller.control(action)
        
        if success:
            # Calcular ahorros (placeholder - se puede mejorar)
            response_data = {
                'success': True,
                'device_id': device_id,
                'nombre': device['nombre'],
                'action': 'encendido' if action else 'apagado'
            }
            
            # Si se apagó, incluir información de ahorro (opcional)
            if not action:
                response_data['saved'] = {
                    'co2Kg': 0.5,  # Placeholder: calcular según consumo real
                    'trees': 0.01
                }
            
            return jsonify(response_data), 200
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo ejecutar la acción en el dispositivo remoto',
                'device_id': device_id
            }), 503
    except Exception as e:
        print(f"Error controlando dispositivo: {e}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/<int:device_id>/consumo', methods=['POST'])
def update_consumo(device_id: int):
    """Actualiza el consumo del dispositivo en la BD"""
    try:
        data = request.get_json()
        if not data or 'consumo' not in data:
            return jsonify({'error': 'Campo consumo requerido'}), 400
        
        consumo = float(data.get('consumo', 0))
        
        # Verificar que el dispositivo existe
        fetch_q = "SELECT id FROM dispositivos WHERE id = %s"
        result = db.execute_query(fetch_q, (device_id,))
        if not result:
            return jsonify({'error': 'Dispositivo no encontrado'}), 404
        
        # Actualizar consumo en la BD
        update_q = "UPDATE dispositivos SET consumo = %s WHERE id = %s"
        affected = db.execute_update(update_q, (consumo, device_id))
        
        if affected:
            return jsonify({'success': True, 'consumo': consumo}), 200
        else:
            return jsonify({'error': 'No se pudo actualizar el consumo'}), 400
    except Exception as e:
        print(f"Error actualizando consumo: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dispositivos_bp.route('/consumo-actual', methods=['GET'])
def get_consumo_actual():
    """Obtiene el consumo actual de todos los dispositivos del usuario"""
    try:
        usuario = request.args.get('usuario', '')
        if not usuario:
            return jsonify({'error': 'Usuario requerido'}), 400
        
        query = "SELECT SUM(consumo) as total_consumo FROM dispositivos WHERE usuario_cedula = %s"
        result = db.execute_query(query, (usuario,))
        
        if result:
            total_consumo = result[0].get('total_consumo') or 0
            return jsonify({'total_consumo': float(total_consumo)}), 200
        return jsonify({'total_consumo': 0}), 200
    except Exception as e:
        print(f"Error obteniendo consumo actual: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
