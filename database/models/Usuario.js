const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  telefono: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  strikes: {
    type: Number,
    default: 0,
    min: 0
  },
  razones_strikes: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    motivo: {
      type: String,
      required: true
    },
    horario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horario'
    }
  }],
  activo: {
    type: Boolean,
    default: true
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

// Método para agregar un strike
usuarioSchema.methods.agregarStrike = function(motivo, horarioId = null) {
  this.strikes += 1;
  this.razones_strikes.push({
    fecha: new Date(),
    motivo: motivo,
    horario_id: horarioId
  });
  return this.save();
};

// Método para verificar si el usuario tiene muchos strikes (3 o más)
usuarioSchema.methods.tieneMuchosStrikes = function() {
  return this.strikes >= 3;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;

