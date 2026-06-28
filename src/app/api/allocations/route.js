import { NextResponse } from 'next/server';
import { getAllocations, addAllocation } from '@/lib/db';

export async function GET() {
  try {
    const allocations = getAllocations();
    return NextResponse.json({ success: true, data: allocations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter alocações.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { professorId, salaId, disciplinaId, horario } = body;

    if (!professorId || !salaId || !disciplinaId || !horario) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos (Professor, Sala, Disciplina e Horário) são obrigatórios.' },
        { status: 400 }
      );
    }

    const newAlloc = addAllocation({ professorId, salaId, disciplinaId, horario });
    return NextResponse.json({ success: true, data: newAlloc }, { status: 201 });
  } catch (error) {
    const isValidationError = error.message.includes('ocupado') || 
                              error.message.includes('ocupada') || 
                              error.message.includes('alocada') ||
                              error.message.includes('encontrado') ||
                              error.message.includes('encontrada') ||
                              error.message.includes('inválido') ||
                              error.message.includes('inválida');
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
