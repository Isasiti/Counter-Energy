require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function init() {
  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'db', 'schema.sql'),
    'utf8'
  );

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await connection.query(sql);
  await connection.end();
  console.log('Base de datos y tablas creadas correctamente.');
}

init().catch((err) => {
  console.error('Error al inicializar la base de datos:', err.message);
  process.exit(1);
});
