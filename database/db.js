const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'horarios.db');

let db = null;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error conectando a la base de datos:', err);
        reject(err);
        return;
      }
      console.log('Conectado a la base de datos SQLite');
      createTables();
      resolve();
    });
  });
};

const createTables = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      organizador TEXT,
      participantes TEXT,
      estado TEXT DEFAULT 'activo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creando tabla:', err);
    } else {
      console.log('Tabla horarios creada o ya existe');
    }
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a init() primero.');
  }
  return db;
};

module.exports = {
  init,
  getDb
};

