const express = require('express');
const pool = require('../db/connection');
const tuya = require('../services/tuya');

const router = express.Router();

router.get('/', async (req, res) => {
  const { usuario } = req.query;
  if (!usuario?.trim()) {
    return res.status(400).json({ error: 'Parámetro usuario requerido' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT id, usuario_cedula, modelo, nombre, device_id, consumo
       FROM dispositivos
       WHERE usuario_cedula = ?
       ORDER BY id`,
      [usuario.trim()]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/consumo-hoy', async (req, res) => {
  const { usuario } = req.query;
  if (!usuario?.trim()) {
    return res.status(400).json({ error: 'Parámetro usuario requerido' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.nombre, d.modelo, d.consumo,
        COALESCE(SUM(
          CASE
            WHEN ud.fin IS NULL THEN ROUND(TIMESTAMPDIFF(SECOND, GREATEST(ud.inicio, CURDATE()), NOW()) * d.consumo / 3600)
            ELSE ROUND(TIMESTAMPDIFF(SECOND, GREATEST(ud.inicio, CURDATE()), ud.fin) * d.consumo / 3600)
          END
        ), 0) AS consumido_wh
       FROM dispositivos d
       LEFT JOIN consumo_dispositivo ud
         ON ud.dispositivo_id = d.id
         AND ud.inicio < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
         AND (ud.fin IS NULL OR ud.fin >= CURDATE())
       WHERE d.usuario_cedula = ?
       GROUP BY d.id
       ORDER BY d.id`,
      [usuario.trim()]
    );
    const totalWh = rows.reduce((sum, row) => sum + Number(row.consumido_wh), 0);
    const totalKwh = totalWh / 1000;
    const totalPrice = Math.round(totalKwh * 1036);
    res.json({ devices: rows, totalWh, totalKwh, totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT device_id FROM dispositivos WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    const token = await tuya.getToken();
    const status = await tuya.getStatus(token, rows[0].device_id);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/control', async (req, res) => {
  const { action } = req.body;
  if (typeof action !== 'boolean') {
    return res.status(400).json({ error: 'action debe ser true o false' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT device_id, consumo FROM dispositivos WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    const device = rows[0];
    const token = await tuya.getToken();
    const result = await tuya.control(token, device.device_id, action);

    let saved = null;
    if (action) {
      const [activeRows] = await pool.query(
        'SELECT id FROM consumo_dispositivo WHERE dispositivo_id = ? AND fin IS NULL',
        [req.params.id]
      );
      if (activeRows.length === 0) {
        await pool.query(
          'INSERT INTO consumo_dispositivo (dispositivo_id, inicio) VALUES (?, NOW())',
          [req.params.id]
        );
      }
    } else {
      const [activeRows] = await pool.query(
        'SELECT id, inicio FROM consumo_dispositivo WHERE dispositivo_id = ? AND fin IS NULL',
        [req.params.id]
      );
      if (activeRows.length > 0) {
        const active = activeRows[0];
        const durationSeconds = Math.max(
          0,
          Math.floor((Date.now() - new Date(active.inicio).getTime()) / 1000)
        );
        const energyWh = Math.round((durationSeconds * device.consumo) / 3600);
        await pool.query(
          'UPDATE consumo_dispositivo SET fin = NOW(), energy_wh = ? WHERE id = ?',
          [energyWh, active.id]
        );
        const energyKwh = energyWh / 1000;
        const co2Kg = Number((energyKwh * 0.164).toFixed(3));
        const trees = Number((co2Kg / 25).toFixed(3));
        saved = { energyWh, energyKwh, co2Kg, trees };
      }
    }

    res.json({ success: true, saved, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, usuario_cedula, modelo, nombre, device_id, consumo FROM dispositivos WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { usuario_cedula, modelo, nombre, device_id, consumo } = req.body;
  if (!usuario_cedula?.trim() || !modelo?.trim() || !nombre?.trim() || !device_id?.trim()) {
    return res.status(400).json({
      error: 'Los campos usuario, modelo, nombre y device_id son obligatorios',
    });
  }
  const wattage = Number(consumo) || 0;
  try {
    const [result] = await pool.query(
      'INSERT INTO dispositivos (usuario_cedula, modelo, nombre, device_id, consumo) VALUES (?, ?, ?, ?, ?)',
      [usuario_cedula.trim(), modelo.trim(), nombre.trim(), device_id.trim(), wattage]
    );
    res.status(201).json({
      id: result.insertId,
      usuario_cedula: usuario_cedula.trim(),
      modelo: modelo.trim(),
      nombre: nombre.trim(),
      device_id: device_id.trim(),
      consumo: wattage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { modelo, nombre, device_id, consumo } = req.body;
  if (!modelo?.trim() || !nombre?.trim() || !device_id?.trim()) {
    return res.status(400).json({
      error: 'Los campos modelo, nombre y device_id son obligatorios',
    });
  }
  const wattage = Number(consumo) || 0;
  try {
    const [result] = await pool.query(
      'UPDATE dispositivos SET modelo = ?, nombre = ?, device_id = ?, consumo = ? WHERE id = ?',
      [modelo.trim(), nombre.trim(), device_id.trim(), wattage, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    res.json({
      id: Number(req.params.id),
      modelo: modelo.trim(),
      nombre: nombre.trim(),
      device_id: device_id.trim(),
      consumo: wattage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM dispositivos WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    res.json({ message: 'Dispositivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
