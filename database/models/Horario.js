const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  fecha: {
    type: String,
    required: true,
    index: true
  },
  hora_inicio: {
    type: String,
    required: true
  },
  hora_fin: {
    type: String,
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: null
  },
  organizador: {
    type: String,
    default: null
  },
  participantes: {
    type: String,
    default: null
  },
  // Usuario que reservó (referencia)
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  // Información del usuario (duplicada para fácil acceso)
  usuario_nombre: {
    type: String,
    default: null
  },
  usuario_telefono: {
    type: String,
    default: null,
    index: true
  },
  estado: {
    type: String,
    enum: ['activo', 'cancelado', 'no_asistio'],
    default: 'activo',
    index: true
  },
  // Registro si fue usado sin reserva
  uso_sin_reserva: {
    type: Boolean,
    default: false
  },
  fecha_uso_sin_reserva: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Índices compuestos para mejorar las consultas
horarioSchema.index({ fecha: 1, hora_inicio: 1 });
horarioSchema.index({ fecha: 1, estado: 1 });
horarioSchema.index({ usuario_telefono: 1, fecha: 1 });

const Horario = mongoose.model('Horario', horarioSchema);

module.exports = Horario;
