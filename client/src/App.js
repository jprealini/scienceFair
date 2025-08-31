
import React, { useEffect, useState } from 'react';
import './App.css';


function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [selectingId, setSelectingId] = useState(null);
  const [unreservingId, setUnreservingId] = useState(null);
  const [families, setFamilies] = useState([]);
  const handleUnreserve = async (projectId) => {
    if (!familyName) return alert('Seleccione una familia');
    setUnreservingId(projectId);
    try {
      const res = await fetch('/api/unreserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, familyName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setProjects(projects => projects.map(p => p.id === projectId ? { ...p, selectedBy: null } : p));
    } catch (e) {
      alert(e.message);
    } finally {
      setUnreservingId(null);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/families').then(res => res.json())
    ])
      .then(([projectsData, familiesData]) => {
        setProjects(projectsData);
        setFamilies(familiesData);
      })
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
      // Do not clear familyName after reserving, so "Liberar" button can show for the selected family
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

  // Build a map of familyName -> project title (or null)
  const familySelections = families.map(fam => {
    const proj = projects.find(p => p.selectedBy === fam);
    return { family: fam, project: proj ? proj.title : null };
  });

  return (
    <div className="App">
      <h1>Feria de Ciencias Cristiana</h1>
      <div>
        <select
          className="family-input"
          value={familyName}
          onChange={e => setFamilyName(e.target.value)}
        >
          <option value="">Seleccione una familia</option>
          {families.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Family selections summary */}
      <div className="family-selections" style={{ margin: '20px 0', padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        <h3>Selección de cada familia</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {familySelections.map(({ family, project }) => (
            <li key={family} style={{ marginBottom: 4 }}>
              <strong>{family}:</strong> {project ? project : <span style={{ color: '#888' }}>Sin selección</span>}
            </li>
          ))}
        </ul>
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
                      p.selectedBy === familyName ? (
                        <>
                          <span className="reserved">Reservado por: {p.selectedBy}</span>
                          <button
                            onClick={() => handleUnreserve(p.id)}
                            disabled={unreservingId === p.id}
                            style={{ marginLeft: 8 }}
                          >
                            {unreservingId === p.id ? 'Liberando...' : 'Liberar'}
                          </button>
                        </>
                      ) : (
                        <span className="reserved">Reservado por: {p.selectedBy}</span>
                      )
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
