import React, { useState, useEffect, useCallback } from 'react';
import './HorariosManager.css';
import HorariosList from './HorariosList';
import HorarioForm from './HorarioForm';
import { horariosService } from '../services/api';

const HorariosManager = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState('');

  const loadHorarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = fechaFiltro ? { fecha: fechaFiltro } : {};
      const data = await horariosService.getAll(params);
      setHorarios(data);
    } catch (err) {
      setError('Error al cargar los horarios: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [fechaFiltro]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  const handleCreate = () => {
    setEditingHorario(null);
    setShowForm(true);
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      return;
    }

    try {
      await horariosService.delete(id);
      loadHorarios();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFormSubmit = async (horarioData) => {
    try {
      if (editingHorario) {
        await horariosService.update(editingHorario.id, horarioData);
      } else {
        await horariosService.create(horarioData);
      }
      setShowForm(false);
      setEditingHorario(null);
      loadHorarios();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      if (err.response?.status === 409) {
        alert('Conflicto de horario: Ya existe una reserva en ese horario.\n\nDetalles: ' + errorMsg);
      } else {
        alert('Error: ' + errorMsg);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHorario(null);
  };

  return (
    <div className="horarios-manager">
      <div className="toolbar">
        <div className="filters">
          <label>
            Filtrar por fecha:
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </label>
          {fechaFiltro && (
            <button
              className="btn-clear-filter"
              onClick={() => setFechaFiltro('')}
            >
              Limpiar filtro
            </button>
          )}
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Nuevo Horario
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando horarios...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <HorariosList
          horarios={horarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <HorarioForm
          horario={editingHorario}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default HorariosManager;

