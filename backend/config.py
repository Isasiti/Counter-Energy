import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv('.env')

class Config:
    """Configuración base"""
    DEBUG = False
    TESTING = False
    
    # MySQL Configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'isasito2122')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'counterenergy')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False

class TestingConfig(Config):
    """Configuración para pruebas"""
    TESTING = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
