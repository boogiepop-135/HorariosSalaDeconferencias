import React from 'react';
import './App.css';
import HorariosManager from './components/HorariosManager';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Administración de Sala de Conferencias</h1>
        <p>Sistema de gestión de horarios</p>
      </header>
      <main>
        <HorariosManager />
      </main>
    </div>
  );
}

export default App;

