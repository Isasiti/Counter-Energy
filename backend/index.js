require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const dispositivosRouter = require('./routes/dispositivos');
const testDeviceRouter = require('./routes/testDevice');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRouter);
app.use('/api/dispositivos', dispositivosRouter);
app.use('/api/test-device', testDeviceRouter);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
