CREATE DATABASE IF NOT EXISTS counterenergy;
USE counterenergy;

CREATE TABLE IF NOT EXISTS usuarios (
  cedula VARCHAR(20) PRIMARY KEY,
  correoelectronico VARCHAR(255) NOT NULL,
  contraseña VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS dispositivos;

CREATE TABLE dispositivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_cedula VARCHAR(20) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  consumo INT NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula)
);

CREATE TABLE IF NOT EXISTS consumo_dispositivo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id INT NOT NULL,
  inicio DATETIME NOT NULL,
  fin DATETIME DEFAULT NULL,
  energy_wh INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
);

INSERT INTO usuarios (cedula, correoelectronico, contraseña)
VALUES ('isaac', 'isaac@counterenergy.com', 'isaac')
ON DUPLICATE KEY UPDATE
  correoelectronico = VALUES(correoelectronico),
  contraseña = VALUES(contraseña);
