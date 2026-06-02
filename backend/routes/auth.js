const express = require('express');
const pool = require('../db/connection');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { cedula, password } = req.body;
  if (!cedula?.trim() || !password) {
    return res.status(400).json({ error: 'Cédula y contraseña son obligatorios' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT cedula, correoelectronico FROM usuarios WHERE cedula = ? AND contraseña = ?',
      [cedula.trim(), password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    res.json({
      cedula: rows[0].cedula,
      correoelectronico: rows[0].correoelectronico,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
