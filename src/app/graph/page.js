'use client';

import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

export default function GraphPage() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const [items, setItems] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
  const [showProfessors, setShowProfessors] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [showDisciplines, setShowDisciplines] = useState(true);
  const [layoutType, setLayoutType] = useState('cose');

  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, allocRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/allocations'),
        ]);

        const itemsData = await itemsRes.json();
        const allocData = await allocRes.json();

        if (itemsData.success) setItems(itemsData.data);
        if (allocData.success) setAllocations(allocData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;

    const filteredItems = items.filter((item) => {
      if (item.category === 'PROFESSOR') return showProfessors;
      if (item.category === 'SALA') return showRooms;
      if (item.category === 'DISCIPLINA') return showDisciplines;
      return true;
    });

    const filteredAllocations = allocations.filter((alloc) => {
      if (selectedDayFilter === 'ALL') return true;
      return alloc.horario.startsWith(selectedDayFilter);
    });

    const elements = [];
    const itemIds = new Set(filteredItems.map((i) => i.id));

    filteredItems.forEach((item) => {
      let color = '#3b82f6';
      let shape = 'ellipse';
      if (item.category === 'SALA') {
        color = '#10b981';
        shape = 'hexagon';
      } else if (item.category === 'DISCIPLINA') {
        color = '#f59e0b';
        shape = 'rectangle';
      }

      elements.push({
        data: {
          id: item.id,
          label: item.name,
          category: item.category,
          color,
          shape,
        },
      });
    });

    filteredAllocations.forEach((alloc) => {
      const hasProf = itemIds.has(alloc.professorId);
      const hasSala = itemIds.has(alloc.salaId);
      const hasDisc = itemIds.has(alloc.disciplinaId);

      if (hasProf && hasDisc) {
        elements.push({
          data: {
            id: `${alloc.id}-pd`,
            source: alloc.professorId,
            target: alloc.disciplinaId,
            label: alloc.horario,
            allocId: alloc.id,
          },
        });
      }
      if (hasDisc && hasSala) {
        elements.push({
          data: {
            id: `${alloc.id}-ds`,
            source: alloc.disciplinaId,
            target: alloc.salaId,
            label: alloc.horario,
            allocId: alloc.id,
          },
        });
      }
      if (hasSala && hasProf) {
        elements.push({
          data: {
            id: `${alloc.id}-sp`,
            source: alloc.salaId,
            target: alloc.professorId,
            label: alloc.horario,
            allocId: alloc.id,
          },
        });
      }
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(color)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-weight': '600',
            'width': '80px',
            'height': '80px',
            'shape': 'data(shape)',
            'border-width': '2px',
            'border-color': 'rgba(255, 255, 255, 0.25)',
            'text-wrap': 'wrap',
            'text-max-width': '75px',
            'overlay-opacity': 0,
            'transition-property': 'background-color, border-color, border-width',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': 'rgba(255, 255, 255, 0.15)',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-weight': '500',
            'color': '#cbd5e1',
            'text-background-opacity': 0.85,
            'text-background-color': '#11141e',
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'text-rotation': 'autorotate',
            'overlay-opacity': 0,
            'transition-property': 'line-color, width',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': '4px',
            'border-color': '#818cf8',
            'background-color': '#4f46e5',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#818cf8',
            'width': 5,
          },
        },
      ],
      layout: {
        name: layoutType,
        fit: true,
        padding: 40,
        animate: true,
        animationDuration: 500,
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 140,
      },
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const itemId = node.id();
      const matchedItem = items.find((i) => i.id === itemId);
      
      const itemAllocations = allocations.filter(
        (a) => a.professorId === itemId || a.salaId === itemId || a.disciplinaId === itemId
      );

      setSelectedElement({
        type: 'node',
        data: matchedItem,
        allocations: itemAllocations,
      });
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const allocId = edge.data('allocId');
      const matchedAlloc = allocations.find((a) => a.id === allocId);

      if (matchedAlloc) {
        const prof = items.find((i) => i.id === matchedAlloc.professorId);
        const room = items.find((i) => i.id === matchedAlloc.salaId);
        const disc = items.find((i) => i.id === matchedAlloc.disciplinaId);

        setSelectedElement({
          type: 'edge',
          data: matchedAlloc,
          details: { professor: prof, sala: room, disciplina: disc },
        });
      }
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedElement(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [loading, items, allocations, selectedDayFilter, showProfessors, showRooms, showDisciplines, layoutType]);

  const handleRefreshLayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({
        name: layoutType,
        animate: true,
        fit: true,
        padding: 40,
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 140,
      }).run();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Filtro de Dia:</span>
            <select
              className="form-select"
              style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedDayFilter}
              onChange={(e) => {
                setSelectedDayFilter(e.target.value);
                setSelectedElement(null);
              }}
            >
              <option value="ALL">Mostrar Todos</option>
              <option value="Segunda">Segunda-feira</option>
              <option value="Terça">Terça-feira</option>
              <option value="Quarta">Quarta-feira</option>
              <option value="Quinta">Quinta-feira</option>
              <option value="Sexta">Sexta-feira</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Layout do Grafo:</span>
            <select
              className="form-select"
              style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
            >
              <option value="cose">Força (Cose)</option>
              <option value="circle">Circular</option>
              <option value="grid">Grade (Grid)</option>
              <option value="concentric">Concêntrico</option>
            </select>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={handleRefreshLayout}
          >
            Reorganizar
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="legend-item">
            <span className="legend-color professor"></span>
            <span>Professor (Azul)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color sala"></span>
            <span>Sala (Verde)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color disciplina"></span>
            <span>Disciplina (Amarelo)</span>
          </div>
        </div>
      </div>

      <div className="graph-layout">
        
        <div className="graph-canvas-container">
          {loading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              Carregando Grafo...
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              Nenhum item cadastrado no sistema.<br/>Cadastre itens na página de montagem de grade.
            </div>
          )}
          <div ref={containerRef} className="graph-canvas" />
        </div>

        <div className="graph-legend">
          
          <div className="card">
            <div className="card-title">Filtros de Categorias</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-professor)' }}
                  checked={showProfessors}
                  onChange={(e) => {
                    setShowProfessors(e.target.checked);
                    setSelectedElement(null);
                  }}
                />
                Exibir Professores
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-sala)' }}
                  checked={showRooms}
                  onChange={(e) => {
                    setShowRooms(e.target.checked);
                    setSelectedElement(null);
                  }}
                />
                Exibir Salas
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-disciplina)' }}
                  checked={showDisciplines}
                  onChange={(e) => {
                    setShowDisciplines(e.target.checked);
                    setSelectedElement(null);
                  }}
                />
                Exibir Disciplinas
              </label>
            </div>
          </div>

          <div className="card" style={{ flex: 1, minHeight: '280px' }}>
            <div className="card-title">Detalhes do Elemento</div>
            
            {!selectedElement ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '4rem', fontStyle: 'italic' }}>
                Clique em um vértice ou aresta do grafo para visualizar suas conexões e informações detalhadas.
              </div>
            ) : selectedElement.type === 'node' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`item-tag ${selectedElement.data.category.toLowerCase()}`}>
                    {selectedElement.data.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                  {selectedElement.data.name}
                </h3>
                
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Aulas e Alocacoes Vinculadas ({selectedElement.allocations.length})
                </h4>

                {selectedElement.allocations.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Nenhuma alocação registrada para este elemento.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedElement.allocations.map((alloc) => {
                      const prof = items.find((i) => i.id === alloc.professorId);
                      const room = items.find((i) => i.id === alloc.salaId);
                      const disc = items.find((i) => i.id === alloc.disciplinaId);
                      return (
                        <div 
                          key={alloc.id} 
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', fontSize: '0.75rem' }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Horario: {alloc.horario}</div>
                          {selectedElement.data.category !== 'DISCIPLINA' && <div>D: {disc?.name || 'Excluído'}</div>}
                          {selectedElement.data.category !== 'PROFESSOR' && <div>P: {prof?.name || 'Excluído'}</div>}
                          {selectedElement.data.category !== 'SALA' && <div>S: {room?.name || 'Excluído'}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', textTransform: 'uppercase' }}>
                    Vinculo Temporal
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                  Horario: {selectedElement.data.horario}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ borderLeft: '3px solid var(--color-disciplina)', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Disciplina</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                      {selectedElement.details.disciplina?.name || 'Excluída'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--color-professor)', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Professor</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                      {selectedElement.details.professor?.name || 'Excluído'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--color-sala)', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sala</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                      {selectedElement.details.sala?.name || 'Excluída'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
