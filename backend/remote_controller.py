"""
Módulo para controlar dispositivos remotos vía API externa.
Basado en controlador.py - Soporta múltiples dispositivos.
"""

import requests
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv('.env')

class RemoteDeviceController:
    """Controlador para dispositivos remotos vía API"""
    
    def __init__(self):
        # Configuración desde variables de entorno
        self.api_base = os.getenv('REMOTE_API_BASE', 'http://181.140.119.7:8000')
        self.api_key = os.getenv('REMOTE_API_KEY', '1027801124J')
        self.timeout = (5, 10)  # (connection_timeout, read_timeout)
        
        # Sesión reutilizable
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        })
    
    def get_status(self) -> Optional[Dict[str, Any]]:
        """
        Obtiene el estado del dispositivo remoto.
        Retorna: {irms, potencia, rele, ...} o None si hay error
        """
        try:
            response = self.session.get(
                f"{self.api_base}/status",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            print(f"⌛ Timeout al conectar a {self.api_base}/status")
            return None
        except requests.exceptions.ConnectionError as e:
            print(f"🌐 Error conexión a dispositivo remoto: {e}")
            return None
        except Exception as e:
            print(f"❌ Error obteniendo estado: {e}")
            return None
    
    def turn_on(self) -> bool:
        """
        Enciende el relé del dispositivo remoto.
        Retorna: True si fue exitoso, False en caso contrario
        """
        try:
            response = self.session.post(
                f"{self.api_base}/rele/1",
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            success = data.get('ok', False)
            if success:
                print("✅ Relé ENCENDIDO")
            else:
                print("❌ Error al encender relé")
            return success
        except Exception as e:
            print(f"❌ Error encendiendo dispositivo: {e}")
            return False
    
    def turn_off(self) -> bool:
        """
        Apaga el relé del dispositivo remoto y obtiene potencia actual.
        Retorna: (bool, float) - (éxito, potencia)
        """
        try:
            response = self.session.post(
                f"{self.api_base}/rele/0",
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            success = data.get('ok', False)
            if success:
                print("⭕ Relé APAGADO")
            else:
                print("❌ Error al apagar relé")
            return success
        except Exception as e:
            print(f"❌ Error apagando dispositivo: {e}")
            return False
    
    def control(self, action: bool) -> bool:
        """
        Controla el dispositivo con una acción booleana.
        action: True para encender, False para apagar
        """
        if action:
            return self.turn_on()
        else:
            return self.turn_off()
    
    def get_power(self) -> float:
        """
        Obtiene la potencia actual del dispositivo.
        Retorna: potencia en W (watts)
        """
        status = self.get_status()
        if status:
            return float(status.get('potencia', 0))
        return 0.0


# Instancia global del controlador
remote_controller = RemoteDeviceController()
