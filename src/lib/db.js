import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ items: [], allocations: [] }, null, 2),
      'utf-8'
    );
  }
}

export function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return { items: [], allocations: [] };
  }
}

export function writeDb(data) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function getItems() {
  return readDb().items;
}

export function addItem(item) {
  const db = readDb();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: item.name,
    category: item.category,
    createdAt: new Date().toISOString(),
  };
  db.items.push(newItem);
  writeDb(db);
  return newItem;
}

export function deleteItem(id) {
  const db = readDb();
  db.items = db.items.filter((item) => item.id !== id);
  db.allocations = db.allocations.filter(
    (alloc) =>
      alloc.professorId !== id &&
      alloc.salaId !== id &&
      alloc.disciplinaId !== id
  );
  writeDb(db);
  return true;
}

export function getAllocations() {
  return readDb().allocations;
}

export function addAllocation(alloc) {
  const db = readDb();
  const { professorId, salaId, disciplinaId, horario } = alloc;

  const professor = db.items.find((item) => item.id === professorId && item.category === 'PROFESSOR');
  const sala = db.items.find((item) => item.id === salaId && item.category === 'SALA');
  const disciplina = db.items.find((item) => item.id === disciplinaId && item.category === 'DISCIPLINA');

  if (!professor) {
    throw new Error('Professor nao encontrado ou invalido.');
  }
  if (!sala) {
    throw new Error('Sala nao encontrada ou invalida.');
  }
  if (!disciplina) {
    throw new Error('Disciplina nao encontrada ou invalida.');
  }

  const professorConflict = db.allocations.find(
    (a) => a.horario === horario && a.professorId === professorId
  );
  if (professorConflict) {
    throw new Error(`O Professor "${professor.name}" ja esta ocupado no horario: ${horario}.`);
  }

  const salaConflict = db.allocations.find(
    (a) => a.horario === horario && a.salaId === salaId
  );
  if (salaConflict) {
    throw new Error(`A Sala "${sala.name}" ja esta ocupada no horario: ${horario}.`);
  }

  const disciplinaConflict = db.allocations.find(
    (a) => a.horario === horario && a.disciplinaId === disciplinaId
  );
  if (disciplinaConflict) {
    throw new Error(`A Disciplina "${disciplina.name}" ja esta alocada no horario: ${horario}.`);
  }

  const newAlloc = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    professorId,
    salaId,
    disciplinaId,
    horario,
    createdAt: new Date().toISOString(),
  };

  db.allocations.push(newAlloc);
  writeDb(db);
  return newAlloc;
}

export function deleteAllocation(id) {
  const db = readDb();
  db.allocations = db.allocations.filter((a) => a.id !== id);
  writeDb(db);
  return true;
}
