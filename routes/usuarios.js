const express = require('express');
const router = express.Router();
const Usuario = require('../database/models/Usuario');

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { telefono, activo } = req.query;
    const query = {};

    if (telefono) {
      query.telefono = telefono;
    }

    if (activo !== undefined) {
      query.activo = activo === 'true';
    }

    const usuarios = await Usuario.find(query)
      .sort({ nombre: 1 })
      .lean();

    const usuariosFormateados = usuarios.map(usuario => ({
      ...usuario,
      id: usuario._id.toString()
    }));

    res.json(usuariosFormateados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const usuario = await Usuario.findById(id).lean();

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      ...usuario,
      id: usuario._id.toString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener usuario por teléfono
router.get('/telefono/:telefono', async (req, res) => {
  try {
    const { telefono } = req.params;

    const usuario = await Usuario.findOne({ telefono: telefono }).lean();

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      ...usuario,
      id: usuario._id.toString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    // Validaciones
    if (!nombre || !telefono) {
      res.status(400).json({ error: 'Faltan campos requeridos: nombre, telefono' });
      return;
    }

    // Verificar si el teléfono ya existe
    const usuarioExistente = await Usuario.findOne({ telefono: telefono });
    if (usuarioExistente) {
      res.status(409).json({ 
        error: 'Ya existe un usuario con este teléfono',
        usuario: {
          id: usuarioExistente._id.toString(),
          nombre: usuarioExistente.nombre,
          telefono: usuarioExistente.telefono
        }
      });
      return;
    }

    // Crear el nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      strikes: 0,
      activo: true
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      id: usuarioGuardado._id.toString(),
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuarioGuardado._id.toString(),
        nombre: usuarioGuardado.nombre,
        telefono: usuarioGuardado.telefono,
        strikes: usuarioGuardado.strikes
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, activo } = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const existing = await Usuario.findById(id);

    if (!existing) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Si se está cambiando el teléfono, verificar que no exista
    if (telefono && telefono !== existing.telefono) {
      const usuarioConTelefono = await Usuario.findOne({ telefono: telefono });
      if (usuarioConTelefono) {
        res.status(409).json({ error: 'Ya existe un usuario con este teléfono' });
        return;
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre.trim();
    if (telefono) updateData.telefono = telefono.trim();
    if (activo !== undefined) updateData.activo = activo;
    updateData.updated_at = new Date();

    await Usuario.findByIdAndUpdate(id, { $set: updateData });

    res.json({
      id: id,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Agregar strike a un usuario
router.post('/:id/strikes', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo, horario_id } = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    if (!motivo) {
      res.status(400).json({ error: 'Falta el motivo del strike' });
      return;
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    await usuario.agregarStrike(motivo, horario_id);

    res.json({
      id: usuario._id.toString(),
      strikes: usuario.strikes,
      tiene_muchos_strikes: usuario.tieneMuchosStrikes(),
      message: 'Strike agregado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    await Usuario.findByIdAndDelete(id);

    res.json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

