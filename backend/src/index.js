require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();
const https = require('https');
const fs = require('fs');
const PORT = process.env.PORT || 6120;


// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://cowork.sofiai.com.mx/',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/space-types', require('./routes/spaceTypes'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

//Congiguracion para HTTPS
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.eventopolis.com.mx/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.eventopolis.com.mx/fullchain.pem'),
};

https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
