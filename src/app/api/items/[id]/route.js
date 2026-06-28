import { NextResponse } from 'next/server';
import { deleteItem } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do item é obrigatório.' },
        { status: 400 }
      );
    }

    deleteItem(id);
    return NextResponse.json({ success: true, message: 'Item excluído com sucesso.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao excluir item.' },
      { status: 500 }
    );
  }
}
