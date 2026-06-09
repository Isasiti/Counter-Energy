import mysql.connector
from mysql.connector import Error
from config import Config

class Database:
    """Gestión de conexión a MySQL"""
    
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Establece la conexión a la base de datos"""
        try:
            self.connection = mysql.connector.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE,
                port=Config.MYSQL_PORT
            )
            if self.connection.is_connected():
                print("Conexión a MySQL exitosa")
                return self.connection
        except Error as e:
            print(f"Error al conectar a MySQL: {e}")
            return None
    
    def disconnect(self):
        """Cierra la conexión a la base de datos"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Conexión a MySQL cerrada")
    
    def execute_query(self, query, params=None):
        """Ejecuta una consulta SELECT y retorna los resultados"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            result = cursor.fetchall()
            cursor.close()
            return result
        except Error as e:
            print(f"Error ejecutando consulta: {e}")
            return None
    
    def execute_update(self, query, params=None):
        """Ejecuta una consulta INSERT, UPDATE o DELETE"""
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            self.connection.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            return affected_rows
        except Error as e:
            print(f"Error ejecutando actualización: {e}")
            return None

# Instancia global de la base de datos
db = Database()
Database.connect(db)