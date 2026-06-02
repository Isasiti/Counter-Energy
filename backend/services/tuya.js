const axios = require('axios');
const crypto = require('crypto');

const API_KEY = process.env.TUYA_API_KEY;
const API_SECRET = process.env.TUYA_API_SECRET;
const BASE_URL = process.env.TUYA_BASE_URL || 'https://openapi.tuyaus.com';

function timestamp() {
  return String(Date.now());
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function hmacSign(message) {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(message, 'utf8')
    .digest('hex')
    .toUpperCase();
}

async function getToken() {
  const t = timestamp();
  const path = '/v1.0/token?grant_type=1';
  const contentHash = sha256('');
  const strToSign = `GET\n${contentHash}\n\n${path}`;
  const msg = API_KEY + t + strToSign;
  const headers = {
    client_id: API_KEY,
    sign: hmacSign(msg),
    t,
    sign_method: 'HMAC-SHA256',
  };
  const res = await axios.get(`${BASE_URL}${path}`, { headers });
  return res.data.result.access_token;
}

async function getStatus(token, deviceId) {
  const t = timestamp();
  const path = `/v1.0/devices/${deviceId}/status`;
  const contentHash = sha256('');
  const strToSign = `GET\n${contentHash}\n\n${path}`;
  const msg = API_KEY + token + t + strToSign;
  const headers = {
    client_id: API_KEY,
    access_token: token,
    sign: hmacSign(msg),
    t,
    sign_method: 'HMAC-SHA256',
  };
  const res = await axios.get(`${BASE_URL}${path}`, { headers });
  for (const item of res.data.result || []) {
    if (item.code === 'switch_1') {
      return item.value;
    }
  }
  return null;
}

async function control(token, deviceId, action) {
  const t = timestamp();
  const path = `/v1.0/devices/${deviceId}/commands`;
  const body = { commands: [{ code: 'switch_1', value: action }] };
  const bodyStr = JSON.stringify(body);
  const contentHash = sha256(bodyStr);
  const strToSign = `POST\n${contentHash}\n\n${path}`;
  const msg = API_KEY + token + t + strToSign;
  const headers = {
    client_id: API_KEY,
    access_token: token,
    sign: hmacSign(msg),
    t,
    sign_method: 'HMAC-SHA256',
    'Content-Type': 'application/json',
  };
  const res = await axios.post(`${BASE_URL}${path}`, bodyStr, { headers });
  return res.data;
}

module.exports = { getToken, getStatus, control };
