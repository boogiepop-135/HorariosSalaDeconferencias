const express = require('express');
const router = express.Router();
const Horario = require('../database/models/Horario');
const Usuario = require('../database/models/Usuario');

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

// POST - Crear un nuevo horario (requiere usuario_telefono)
router.post('/', async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, titulo, descripcion, organizador, participantes, estado, usuario_telefono } = req.body;

    // Validaciones
    if (!fecha || !hora_inicio || !hora_fin || !titulo || !usuario_telefono) {
      res.status(400).json({ error: 'Faltan campos requeridos: fecha, hora_inicio, hora_fin, titulo, usuario_telefono' });
      return;
    }

    // Buscar o crear usuario por teléfono
    let usuario = await Usuario.findOne({ telefono: usuario_telefono.trim() });
    
    if (!usuario) {
      // Si no existe el usuario, necesitamos el nombre para crearlo
      const { usuario_nombre } = req.body;
      if (!usuario_nombre) {
        res.status(400).json({ error: 'Usuario no existe. Se requiere usuario_nombre para crear nuevo usuario' });
        return;
      }
      
      // Crear nuevo usuario
      usuario = new Usuario({
        nombre: usuario_nombre.trim(),
        telefono: usuario_telefono.trim(),
        strikes: 0,
        activo: true
      });
      await usuario.save();
    }

    // Verificar si el usuario tiene muchos strikes
    if (usuario.tieneMuchosStrikes()) {
      res.status(403).json({ 
        error: 'Usuario tiene 3 o más strikes. No puede reservar la sala.',
        strikes: usuario.strikes
      });
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
      usuario_id: usuario._id,
      usuario_nombre: usuario.nombre,
      usuario_telefono: usuario.telefono,
      estado: estado || 'activo'
    });

    const horarioGuardado = await nuevoHorario.save();

    res.status(201).json({
      id: horarioGuardado._id.toString(),
      message: 'Horario creado exitosamente',
      usuario: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        strikes: usuario.strikes
      }
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

// POST - Marcar uso sin reserva (registra strike automáticamente)
router.post('/:id/uso-sin-reserva', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_telefono } = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const horario = await Horario.findById(id);

    if (!horario) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    // Buscar usuario por teléfono
    let usuario = null;
    if (usuario_telefono) {
      usuario = await Usuario.findOne({ telefono: usuario_telefono.trim() });
      
      if (!usuario) {
        // Crear usuario si no existe (necesitamos nombre)
        const { usuario_nombre } = req.body;
        if (usuario_nombre) {
          usuario = new Usuario({
            nombre: usuario_nombre.trim(),
            telefono: usuario_telefono.trim(),
            strikes: 0,
            activo: true
          });
          await usuario.save();
        }
      }

      // Agregar strike por usar sin reserva
      if (usuario) {
        await usuario.agregarStrike(
          'Uso de sala sin reserva previa',
          id
        );
      }
    }

    // Marcar horario como usado sin reserva
    horario.uso_sin_reserva = true;
    horario.fecha_uso_sin_reserva = new Date();
    if (usuario) {
      horario.usuario_id = usuario._id;
      horario.usuario_nombre = usuario.nombre;
      horario.usuario_telefono = usuario.telefono;
    }
    await horario.save();

    res.json({
      message: 'Uso sin reserva registrado',
      strike_agregado: usuario ? true : false,
      usuario: usuario ? {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        strikes: usuario.strikes
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Marcar no asistencia (registra strike)
router.post('/:id/no-asistio', async (req, res) => {
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

    if (!horario.usuario_id) {
      res.status(400).json({ error: 'Este horario no tiene usuario asociado' });
      return;
    }

    // Buscar usuario y agregar strike
    const usuario = await Usuario.findById(horario.usuario_id);
    if (usuario) {
      await usuario.agregarStrike(
        'No asistió a la reserva sin cancelar',
        id
      );

      // Marcar horario como no asistió
      horario.estado = 'no_asistio';
      await horario.save();

      res.json({
        message: 'No asistencia registrada y strike agregado',
        usuario: {
          id: usuario._id.toString(),
          nombre: usuario.nombre,
          strikes: usuario.strikes,
          tiene_muchos_strikes: usuario.tieneMuchosStrikes()
        }
      });
    } else {
      res.status(404).json({ error: 'Usuario asociado no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Registrar strike por no respetar horario
router.post('/:id/strike', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    if (!motivo) {
      res.status(400).json({ error: 'Falta el motivo del strike' });
      return;
    }

    const horario = await Horario.findById(id);

    if (!horario) {
      res.status(404).json({ error: 'Horario no encontrado' });
      return;
    }

    if (!horario.usuario_id) {
      res.status(400).json({ error: 'Este horario no tiene usuario asociado' });
      return;
    }

    // Buscar usuario y agregar strike
    const usuario = await Usuario.findById(horario.usuario_id);
    if (usuario) {
      await usuario.agregarStrike(motivo, id);

      res.json({
        message: 'Strike registrado exitosamente',
        usuario: {
          id: usuario._id.toString(),
          nombre: usuario.nombre,
          strikes: usuario.strikes,
          tiene_muchos_strikes: usuario.tieneMuchosStrikes()
        }
      });
    } else {
      res.status(404).json({ error: 'Usuario asociado no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
