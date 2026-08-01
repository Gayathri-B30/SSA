import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../../src/modules/auth/middlewares/auth.middleware';
import { LeadController } from '../../../../../src/modules/lead';

const leadController = new LeadController();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await authMiddleware(req, async (user) => {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, message: 'Invalid category ID.' }, { status: 400 });
    }
    return await leadController.updateCategory(req, categoryId, user);
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await authMiddleware(req, async (user) => {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, message: 'Invalid category ID.' }, { status: 400 });
    }
    return await leadController.deleteCategory(req, categoryId, user);
  });
}
