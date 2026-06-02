const express = require('express');
const router = express.Router();
const TEST_API_KEY = '1027801124J';
const axios = require('axios');

const TEST_API_KEY = '1027801124J';
const EXTERNAL_BASE = process.env.TEST_DEVICE_BASE || 'http://181.140.119.7:8000';
const EXTERNAL_API_KEY = process.env.TEST_DEVICE_API_KEY || TEST_API_KEY;

let state = {
  rele: false,
  irms: 0.0,
  potencia: 0.0,
};

const updateReadings = () => {
  if (state.rele) {
    state.irms = parseFloat((0.05 + Math.random() * 0.45).toFixed(3));
    state.potencia = parseFloat((state.irms * 230).toFixed(1));
  } else {
    state.irms = 0.0;
    state.potencia = 0.0;
  }
};

router.use((req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== TEST_API_KEY) {
    return res.status(403).json({ error: 'x-api-key inválida' });
  }
  next();
});

router.get('/status', (req, res) => {
  updateReadings();
  res.json({
    irms: state.irms,
    potencia: state.potencia,
    rele: state.rele,
  });
});

router.post('/control', async (req, res) => {
  const { action } = req.body;
  if (typeof action !== 'boolean') {
    return res.status(400).json({ error: 'action debe ser true o false' });
  }

  state.rele = action;
  updateReadings();

  // Call external device API directly from Node
  let external = { ok: false };
  try {
    const url = `${EXTERNAL_BASE}/rele/${action ? 1 : 0}`;
    const resp = await axios.post(url, {}, { headers: { 'x-api-key': EXTERNAL_API_KEY }, timeout: 10000 });
    external = resp.data || { ok: true };
  } catch (err) {
    console.error('Error calling external device API:', err.message || err);
    external = { ok: false, error: (err && err.message) || 'request error' };
  }

  res.json({
    ok: external.ok === undefined ? true : external.ok,
    external,
    rele: state.rele,
    irms: state.irms,
    potencia: state.potencia,
  });
});

module.exports = router;
