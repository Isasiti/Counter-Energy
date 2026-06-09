@echo off
echo Instalando dependencias de Python...
pip install -r requirements.txt

echo.
echo Iniciando servidor Flask en http://localhost:3000
python app.py
