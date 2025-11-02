import React, { useState, useEffect } from 'react';
import './HorarioForm.css';

const HorarioForm = ({ horario, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    titulo: '',
    descripcion: '',
    organizador: '',
    participantes: '',
    estado: 'activo'
  });

  useEffect(() => {
    if (horario) {
      setFormData({
        fecha: horario.fecha || '',
        hora_inicio: horario.hora_inicio || '',
        hora_fin: horario.hora_fin || '',
        titulo: horario.titulo || '',
        descripcion: horario.descripcion || '',
        organizador: horario.organizador || '',
        participantes: horario.participantes || '',
        estado: horario.estado || 'activo'
      });
    } else {
      // Establecer fecha de hoy por defecto
      const hoy = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, fecha: hoy }));
    }
  }, [horario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{horario ? 'Editar Horario' : 'Nuevo Horario'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fecha">Fecha *</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hora_inicio">Hora Inicio *</label>
              <input
                type="time"
                id="hora_inicio"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora_fin">Hora Fin *</label>
              <input
                type="time"
                id="hora_fin"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Reunión de equipo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del evento..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="organizador">Organizador</label>
            <input
              type="text"
              id="organizador"
              name="organizador"
              value={formData.organizador}
              onChange={handleChange}
              placeholder="Nombre del organizador"
            />
          </div>

          <div className="form-group">
            <label htmlFor="participantes">Participantes</label>
            <input
              type="text"
              id="participantes"
              name="participantes"
              value={formData.participantes}
              onChange={handleChange}
              placeholder="Lista de participantes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="activo">Activo</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {horario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HorarioForm;

