import { NextResponse } from 'next/server';
import { deleteAllocation } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da alocação é obrigatório.' },
        { status: 400 }
      );
    }

    deleteAllocation(id);
    return NextResponse.json({ success: true, message: 'Alocação removida com sucesso.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao excluir alocação.' },
      { status: 500 }
    );
  }
}
