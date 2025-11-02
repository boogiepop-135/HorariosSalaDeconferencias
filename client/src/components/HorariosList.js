import React from 'react';
import './HorariosList.css';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HorariosList = ({ horarios, onEdit, onDelete }) => {
  if (horarios.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay horarios registrados</p>
        <p className="empty-state-subtitle">Haz clic en "Nuevo Horario" para agregar uno</p>
      </div>
    );
  }

  return (
    <div className="horarios-list">
      <div className="horarios-grid">
        {horarios.map((horario) => (
          <div key={horario.id} className={`horario-card ${horario.estado === 'cancelado' ? 'cancelado' : ''}`}>
            <div className="horario-header">
              <h3>{horario.titulo}</h3>
              <span className={`badge badge-${horario.estado}`}>{horario.estado}</span>
            </div>
            
            <div className="horario-info">
              <div className="info-row">
                <span className="info-label">📅 Fecha:</span>
                <span className="info-value">
                  {format(parseISO(horario.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">🕐 Hora:</span>
                <span className="info-value">
                  {horario.hora_inicio} - {horario.hora_fin}
                </span>
              </div>

              {horario.organizador && (
                <div className="info-row">
                  <span className="info-label">👤 Organizador:</span>
                  <span className="info-value">{horario.organizador}</span>
                </div>
              )}

              {horario.participantes && (
                <div className="info-row">
                  <span className="info-label">👥 Participantes:</span>
                  <span className="info-value">{horario.participantes}</span>
                </div>
              )}

              {horario.descripcion && (
                <div className="info-row">
                  <span className="info-label">📝 Descripción:</span>
                  <span className="info-value">{horario.descripcion}</span>
                </div>
              )}
            </div>

            <div className="horario-actions">
              <button
                className="btn-edit"
                onClick={() => onEdit(horario)}
              >
                ✏️ Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete(horario.id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorariosList;

