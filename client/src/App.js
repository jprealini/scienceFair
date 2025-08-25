
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (projectId) => {
    if (!familyName) return alert('Ingrese el nombre de la familia');
    setSelectingId(projectId);
    try {
      const res = await fetch('/api/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, familyName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setProjects(projects => projects.map(p => p.id === projectId ? { ...p, selectedBy: familyName } : p));
      setFamilyName('');
    } catch (e) {
      alert(e.message);
    } finally {
      setSelectingId(null);
    }
  };

  if (loading) return <div>Cargando proyectos...</div>;
  if (error) return <div>Error: {error.message || error.toString()}</div>;

  // Agrupar por disciplina y nivel
  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.discipline]) grouped[p.discipline] = {};
    if (!grouped[p.discipline][p.level]) grouped[p.discipline][p.level] = [];
    grouped[p.discipline][p.level].push(p);
  });

  // Color palette for each science
  const scienceColors = {
    'Botánica': '#e0f7fa',
    'Zoología': '#fff9c4',
    'Microbiología': '#f3e5f5',
    'Astronomía': '#e3f2fd',
    'Física': '#ffe0b2',
    'Química': '#f8bbd0',
    'Meteorología': '#c8e6c9',
    'Matemáticas en la Naturaleza': '#d1c4e9',
    'Biomecánica': '#f0f4c3',
    'Cristalografía': '#b3e5fc',
    'Ingeniería Natural': '#dcedc8',
  };

  return (
    <div className="App">
      <h1>Feria de Ciencias Cristiana</h1>
      <div>
        <input
          className="family-input"
          type="text"
          placeholder="Nombre de la familia"
          value={familyName}
          onChange={e => setFamilyName(e.target.value)}
        />
      </div>
      <div className="sciences-container">
        {Object.entries(grouped).map(([discipline, levels]) => (
          <div
            key={discipline}
            className="science-block"
            style={{
              '--science-color': scienceColors[discipline] || '#e0e0e0',
              border: `2px solid ${scienceColors[discipline] || '#e0e0e0'}`
            }}
          >
            <h2>{discipline}</h2>
            {Object.entries(levels).map(([level, projs]) => (
              <div key={level}>
                <h3>{level}</h3>
                {projs.map(p => (
                  <div className="project-card" key={p.id} style={{'--science-color': scienceColors[discipline] || '#e0e0e0'}}>
                    <div className="level">Nivel: {level}</div>
                    <strong>{p.title}</strong>
                    <div className="desc">{p.description}</div>
                    {p.selectedBy ? (
                      <span className="reserved">Reservado por: {p.selectedBy}</span>
                    ) : (
                      <button
                        onClick={() => handleSelect(p.id)}
                        disabled={!!p.selectedBy || selectingId === p.id}
                      >
                        {selectingId === p.id ? 'Guardando...' : 'Reservar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
