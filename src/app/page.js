'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const SLOTS = [
  { id: 'M1', label: 'M1 (07:30 - 09:10)' },
  { id: 'M2', label: 'M2 (09:20 - 11:00)' },
  { id: 'T1', label: 'T1 (13:30 - 15:10)' },
  { id: 'T2', label: 'T2 (15:20 - 17:00)' },
  { id: 'N1', label: 'N1 (19:00 - 20:40)' },
  { id: 'N2', label: 'N2 (20:50 - 22:30)' },
];

export default function SchedulingPage() {
  const [items, setItems] = useState([]);
  const [allocations, setAllocations] = useState([]);
  
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('PROFESSOR');
  
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [selectedSalaId, setSelectedSalaId] = useState('');
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');
  const [selectedSlot, setSelectedSlot] = useState('M1');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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
        showToast('Erro ao carregar dados do servidor.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleRegisterItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showToast('Por favor, informe o nome do item.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: itemName, category: itemCategory }),
      });
      const result = await res.json();

      if (result.success) {
        setItems((prev) => [...prev, result.data]);
        setItemName('');
        showToast(`"${result.data.name}" cadastrado com sucesso!`, 'success');
      } else {
        showToast(result.error || 'Erro ao cadastrar item.', 'error');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.', 'error');
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"? Isso também removerá todas as suas alocações de horários correspondentes.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setAllocations((prev) =>
          prev.filter(
            (a) => a.professorId !== id && a.salaId !== id && a.disciplinaId !== id
          )
        );
        showToast('Item excluído com sucesso.', 'success');
      } else {
        showToast(result.error || 'Erro ao excluir item.', 'error');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.', 'error');
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();

    if (!selectedProfessorId || !selectedSalaId || !selectedDisciplinaId) {
      showToast('Selecione um Professor, uma Sala e uma Disciplina.', 'error');
      return;
    }

    const horario = `${selectedDay} ${selectedSlot}`;

    const professor = items.find((i) => i.id === selectedProfessorId);
    const sala = items.find((i) => i.id === selectedSalaId);
    const disciplina = items.find((i) => i.id === selectedDisciplinaId);

    const profConflict = allocations.find((a) => a.horario === horario && a.professorId === selectedProfessorId);
    if (profConflict) {
      showToast(`O Professor "${professor?.name}" já está ocupado em: ${horario}.`, 'error');
      return;
    }

    const salaConflict = allocations.find((a) => a.horario === horario && a.salaId === selectedSalaId);
    if (salaConflict) {
      showToast(`A Sala "${sala?.name}" já está ocupada em: ${horario}.`, 'error');
      return;
    }

    const discConflict = allocations.find((a) => a.horario === horario && a.disciplinaId === selectedDisciplinaId);
    if (discConflict) {
      showToast(`A Disciplina "${disciplina?.name}" já está alocada em: ${horario}.`, 'error');
      return;
    }

    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: selectedProfessorId,
          salaId: selectedSalaId,
          disciplinaId: selectedDisciplinaId,
          horario,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setAllocations((prev) => [...prev, result.data]);
        showToast('Horário alocado com sucesso!', 'success');
        setSelectedProfessorId('');
        setSelectedSalaId('');
        setSelectedDisciplinaId('');
      } else {
        showToast(result.error || 'Erro ao salvar alocação.', 'error');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.', 'error');
    }
  };

  const handleDeleteAllocation = async (id) => {
    try {
      const res = await fetch(`/api/allocations/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        setAllocations((prev) => prev.filter((a) => a.id !== id));
        showToast('Alocação removida.', 'success');
      } else {
        showToast(result.error || 'Erro ao remover alocação.', 'error');
      }
    } catch (err) {
      showToast('Erro ao se conectar com o servidor.', 'error');
    }
  };

  const professors = items.filter((i) => i.category === 'PROFESSOR');
  const rooms = items.filter((i) => i.category === 'SALA');
  const disciplines = items.filter((i) => i.category === 'DISCIPLINA');

  return (
    <div className="dashboard-grid">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>x</button>
          </div>
        </div>
      )}

      <div className="sidebar">
        
        <div className="card">
          <div className="card-title">
            <span>Cadastro Unificado</span>
          </div>
          <p className="card-subtitle">Cadastre os elementos básicos do sistema</p>

          <form onSubmit={handleRegisterItem}>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${itemCategory === 'PROFESSOR' ? 'active' : ''}`}
                data-category="PROFESSOR"
                onClick={() => setItemCategory('PROFESSOR')}
              >
                Professor
              </button>
              <button
                type="button"
                className={`segment-btn ${itemCategory === 'SALA' ? 'active' : ''}`}
                data-category="SALA"
                onClick={() => setItemCategory('SALA')}
              >
                Sala
              </button>
              <button
                type="button"
                className={`segment-btn ${itemCategory === 'DISCIPLINA' ? 'active' : ''}`}
                data-category="DISCIPLINA"
                onClick={() => setItemCategory('DISCIPLINA')}
              >
                Disciplina
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="itemNameInput">Nome</label>
              <input
                id="itemNameInput"
                type="text"
                className="form-control"
                placeholder={
                  itemCategory === 'PROFESSOR' ? 'Ex: Dr. Alan Turing' :
                  itemCategory === 'SALA' ? 'Ex: Lab de Redes 203' : 'Ex: Cálculo I'
                }
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Cadastrar {itemCategory === 'PROFESSOR' ? 'Professor' : itemCategory === 'SALA' ? 'Sala' : 'Disciplina'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 700 }}>
              Itens Cadastrados ({items.length})
            </h4>
            {items.length === 0 ? (
              <div className="empty-state">Nenhum item cadastrado ainda.</div>
            ) : (
              <div className="items-list-container">
                {items.slice().reverse().map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <span className={`item-tag ${item.category.toLowerCase()}`}>
                        {item.category === 'PROFESSOR' ? 'Prof' : item.category === 'SALA' ? 'Sala' : 'Disc'}
                      </span>
                      <span className="item-name" title={item.name}>{item.name}</span>
                    </div>
                    <button
                      className="btn-delete"
                      title="Excluir item"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Alocação de Horário</span>
          </div>
          <p className="card-subtitle">Combine os elementos para montar a grade</p>

          <form onSubmit={handleCreateAllocation}>
            <div className="form-group">
              <label htmlFor="selectProfessor">Professor</label>
              <select
                id="selectProfessor"
                className="form-select"
                value={selectedProfessorId}
                onChange={(e) => setSelectedProfessorId(e.target.value)}
              >
                <option value="">-- Selecione o Professor --</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="selectSala">Sala</label>
              <select
                id="selectSala"
                className="form-select"
                value={selectedSalaId}
                onChange={(e) => setSelectedSalaId(e.target.value)}
              >
                <option value="">-- Selecione a Sala --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="selectDisciplina">Disciplina</label>
              <select
                id="selectDisciplina"
                className="form-select"
                value={selectedDisciplinaId}
                onChange={(e) => setSelectedDisciplinaId(e.target.value)}
              >
                <option value="">-- Selecione a Disciplina --</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="selectDay">Dia</label>
                <select
                  id="selectDay"
                  className="form-select"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="selectSlot">Horário</label>
                <select
                  id="selectSlot"
                  className="form-select"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {SLOTS.map((slot) => (
                    <option key={slot.id} value={slot.id}>{slot.id}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
              disabled={loading || items.length === 0}
            >
              Vincular Alocação
            </button>
          </form>
        </div>

      </div>

      <div className="matrix-container">
        <div className="card matrix-card">
          <div className="matrix-header">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Matriz da Grade Horária</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Visualização das alocações programadas por bloco</p>
            </div>
            <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              Total de Alocações: <strong>{allocations.length}</strong>
            </div>
          </div>

          <div className="matrix-table-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Horário / Dia</th>
                  {DAYS.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot.id}>
                    <td className="time-slot-header" title={slot.label}>
                      <div>{slot.id}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {slot.label.split(' ')[1]}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const slotKey = `${day} ${slot.id}`;
                      const alloc = allocations.find((a) => a.horario === slotKey);

                      if (alloc) {
                        const prof = items.find((i) => i.id === alloc.professorId);
                        const room = items.find((i) => i.id === alloc.salaId);
                        const disc = items.find((i) => i.id === alloc.disciplinaId);

                        return (
                          <td key={slotKey} className="matrix-cell">
                            <div className="cell-actions">
                              <button
                                className="btn-delete"
                                title="Remover alocação"
                                onClick={() => handleDeleteAllocation(alloc.id)}
                              >
                                X
                              </button>
                            </div>
                            <div className="allocation-card">
                              <div className="alloc-discipline" title={disc ? disc.name : 'Disciplina excluída'}>
                                {disc ? disc.name : 'Excluído'}
                              </div>
                              <div className="alloc-professor" title={prof ? prof.name : 'Professor excluído'}>
                                {prof ? prof.name : 'Excluído'}
                              </div>
                              <div className="alloc-sala" title={room ? room.name : 'Sala excluída'}>
                                {room ? room.name : 'Excluído'}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={slotKey} className="matrix-cell empty">
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', paddingTop: '30px', fontStyle: 'italic' }}>
                            --
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
