const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET - Obtener todos los horarios
router.get('/', (req, res) => {
  const { fecha, estado } = req.query;
  let query = 'SELECT * FROM horarios WHERE 1=1';
  const params = [];

  if (fecha) {
    query += ' AND fecha = ?';
    params.push(fecha);
  }

  if (estado) {
    query += ' AND estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY fecha, hora_inicio';

  db.getDb().all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET - Obtener un horario por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.getDb().get('SELECT * FROM horarios WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }
    res.json(row);
  });
});

// POST - Crear un nuevo horario
router.post('/', (req, res) => {
  const { fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado } = req.body;

  // Validaciones
  if (!fecha || !hora_inicio || !hora_fin || !titulo) {
    res.status(400).json({ error: 'Faltan campos requeridos: fecha, hora_inicio, hora_fin, titulo' });
    return;
  }

  // Verificar si hay conflicto de horarios
  const checkConflictQuery = `
    SELECT * FROM horarios 
    WHERE fecha = ? 
    AND estado = 'activo'
    AND (
      (hora_inicio <= ? AND hora_fin > ?) OR
      (hora_inicio < ? AND hora_fin >= ?) OR
      (hora_inicio >= ? AND hora_fin <= ?)
    )
  `;

  db.getDb().all(checkConflictQuery, [fecha, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin], (err, conflicts) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (conflicts && conflicts.length > 0) {
      res.status(409).json({ 
        error: 'Conflicto de horario detectado',
        conflictos: conflicts
      });
      return;
    }

    // Insertar el nuevo horario
    const insertQuery = `
      INSERT INTO horarios (fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.getDb().run(insertQuery, [
      fecha, hora_inicio, hora_fin, titulo, 
      descripcion || null, 
      organizador || null, 
      participantes || null, 
      estado || 'activo'
    ], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Horario creado exitosamente'
      });
    });
  });
});

// PUT - Actualizar un horario
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado } = req.body;

  // Verificar si existe
  db.getDb().get('SELECT * FROM horarios WHERE id = ?', [id], (err, existing) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!existing) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    // Si se están cambiando fecha/horarios, verificar conflictos (excluyendo el actual)
    if (fecha || hora_inicio || hora_fin) {
      const newFecha = fecha || existing.fecha;
      const newHoraInicio = hora_inicio || existing.hora_inicio;
      const newHoraFin = hora_fin || existing.hora_fin;

      const checkConflictQuery = `
        SELECT * FROM horarios 
        WHERE fecha = ? 
        AND id != ?
        AND estado = 'activo'
        AND (
          (hora_inicio <= ? AND hora_fin > ?) OR
          (hora_inicio < ? AND hora_fin >= ?) OR
          (hora_inicio >= ? AND hora_fin <= ?)
        )
      `;

      db.getDb().all(checkConflictQuery, [newFecha, id, newHoraInicio, newHoraInicio, newHoraFin, newHoraFin, newHoraInicio, newHoraFin], (err, conflicts) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (conflicts && conflicts.length > 0) {
          res.status(409).json({ 
            error: 'Conflicto de horario detectado',
            conflictos: conflicts
          });
          return;
        }

        updateHorario();
      });
    } else {
      updateHorario();
    }

    function updateHorario() {
      const updateQuery = `
        UPDATE horarios 
        SET fecha = COALESCE(?, fecha),
            hora_inicio = COALESCE(?, hora_inicio),
            hora_fin = COALESCE(?, hora_fin),
            titulo = COALESCE(?, titulo),
            descripcion = COALESCE(?, descripcion),
            organizador = COALESCE(?, organizador),
            participantes = COALESCE(?, participantes),
            estado = COALESCE(?, estado),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.getDb().run(updateQuery, [
        fecha || null,
        hora_inicio || null,
        hora_fin || null,
        titulo || null,
        descripcion !== undefined ? descripcion : null,
        organizador !== undefined ? organizador : null,
        participantes !== undefined ? participantes : null,
        estado || null,
        id
      ], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          id: parseInt(id),
          message: 'Horario actualizado exitosamente'
        });
      });
    }
  });
});

// DELETE - Eliminar un horario
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.getDb().get('SELECT * FROM horarios WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    db.getDb().run('DELETE FROM horarios WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'Horario eliminado exitosamente'
      });
    });
  });
});

module.exports = router;

