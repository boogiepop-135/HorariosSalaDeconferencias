const express = require('express');
const router = express.Router();
const Horario = require('../database/models/Horario');

// Función helper para verificar conflictos de horario
const verificarConflicto = async (fecha, horaInicio, horaFin, estado = 'activo', excluirId = null) => {
  const query = {
    fecha: fecha,
    estado: estado,
    $or: [
      // Horario nuevo empieza dentro de otro horario
      { 
        hora_inicio: { $lte: horaInicio }, 
        hora_fin: { $gt: horaInicio } 
      },
      // Horario nuevo termina dentro de otro horario
      { 
        hora_inicio: { $lt: horaFin }, 
        hora_fin: { $gte: horaFin } 
      },
      // Horario nuevo contiene completamente a otro horario
      { 
        hora_inicio: { $gte: horaInicio }, 
        hora_fin: { $lte: horaFin } 
      }
    ]
  };

  if (excluirId) {
    query._id = { $ne: excluirId };
  }

  return await Horario.find(query);
};

// GET - Obtener todos los horarios
router.get('/', async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    const query = {};

    if (fecha) {
      query.fecha = fecha;
    }

    if (estado) {
      query.estado = estado;
    }

    const horarios = await Horario.find(query)
      .sort({ fecha: 1, hora_inicio: 1 })
      .lean();

    // Convertir _id a id para mantener compatibilidad con el frontend
    const horariosFormateados = horarios.map(horario => ({
      ...horario,
      id: horario._id.toString()
    }));

    res.json(horariosFormateados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener un horario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const horario = await Horario.findById(id).lean();

    if (!horario) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    // Convertir _id a id
    res.json({
      ...horario,
      id: horario._id.toString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear un nuevo horario
router.post('/', async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado } = req.body;

    // Validaciones
    if (!fecha || !hora_inicio || !hora_fin || !titulo) {
      res.status(400).json({ error: 'Faltan campos requeridos: fecha, hora_inicio, hora_fin, titulo' });
      return;
    }

    // Verificar si hay conflicto de horarios
    const conflicts = await verificarConflicto(fecha, hora_inicio, hora_fin, estado || 'activo');

    if (conflicts && conflicts.length > 0) {
      const conflictosFormateados = conflicts.map(conflict => ({
        ...conflict.toObject(),
        id: conflict._id.toString()
      }));

      res.status(409).json({ 
        error: 'Conflicto de horario detectado',
        conflictos: conflictosFormateados
      });
      return;
    }

    // Crear el nuevo horario
    const nuevoHorario = new Horario({
      fecha,
      hora_inicio,
      hora_fin,
      titulo,
      descripcion: descripcion || null,
      organizador: organizador || null,
      participantes: participantes || null,
      estado: estado || 'activo'
    });

    const horarioGuardado = await nuevoHorario.save();

    res.status(201).json({
      id: horarioGuardado._id.toString(),
      message: 'Horario creado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar un horario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado } = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    // Verificar si existe
    const existing = await Horario.findById(id);

    if (!existing) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    // Si se están cambiando fecha/horarios, verificar conflictos (excluyendo el actual)
    if (fecha || hora_inicio || hora_fin) {
      const newFecha = fecha || existing.fecha;
      const newHoraInicio = hora_inicio || existing.hora_inicio;
      const newHoraFin = hora_fin || existing.hora_fin;
      const newEstado = estado || existing.estado;

      const conflicts = await verificarConflicto(newFecha, newHoraInicio, newHoraFin, newEstado, id);

      if (conflicts && conflicts.length > 0) {
        const conflictosFormateados = conflicts.map(conflict => ({
          ...conflict.toObject(),
          id: conflict._id.toString()
        }));

        res.status(409).json({ 
          error: 'Conflicto de horario detectado',
          conflictos: conflictosFormateados
        });
        return;
      }
    }

    // Actualizar solo los campos proporcionados
    const updateData = {};
    if (fecha) updateData.fecha = fecha;
    if (hora_inicio) updateData.hora_inicio = hora_inicio;
    if (hora_fin) updateData.hora_fin = hora_fin;
    if (titulo) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (organizador !== undefined) updateData.organizador = organizador;
    if (participantes !== undefined) updateData.participantes = participantes;
    if (estado) updateData.estado = estado;
    updateData.updated_at = new Date();

    await Horario.findByIdAndUpdate(id, { $set: updateData });

    res.json({
      id: id,
      message: 'Horario actualizado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar un horario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const horario = await Horario.findById(id);

    if (!horario) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    await Horario.findByIdAndDelete(id);

    res.json({
      message: 'Horario eliminado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
