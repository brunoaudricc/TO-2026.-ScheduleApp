import { NextResponse } from 'next/server';
import { getItems, addItem } from '@/lib/db';

export async function GET() {
  try {
    const items = getItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar itens.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'O nome é obrigatório.' },
        { status: 400 }
      );
    }

    if (!category || !['PROFESSOR', 'SALA', 'DISCIPLINA'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoria inválida. Escolha entre PROFESSOR, SALA ou DISCIPLINA.' },
        { status: 400 }
      );
    }

    const newItem = addItem({ name: name.trim(), category });
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar item.' },
      { status: 500 }
    );
  }
}
