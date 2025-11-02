const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const horariosRoutes = require('./routes/horarios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas API
app.use('/api/horarios', horariosRoutes);

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Inicializar base de datos
db.init();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

