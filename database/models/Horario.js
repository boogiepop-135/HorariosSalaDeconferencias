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
  estado: {
    type: String,
    enum: ['activo', 'cancelado'],
    default: 'activo',
    index: true
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

const Horario = mongoose.model('Horario', horarioSchema);

module.exports = Horario;

