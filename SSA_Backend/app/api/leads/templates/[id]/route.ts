import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../../src/modules/auth/middlewares/auth.middleware';
import { LeadController } from '../../../../../src/modules/lead';

const leadController = new LeadController();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await authMiddleware(req, async (user) => {
    const { id } = await params;
    const fieldId = parseInt(id, 10);
    if (isNaN(fieldId)) {
      return NextResponse.json({ success: false, message: 'Invalid question / template field ID.' }, { status: 400 });
    }
    return await leadController.updateTemplateField(req, fieldId, user);
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await authMiddleware(req, async (user) => {
    const { id } = await params;
    const fieldId = parseInt(id, 10);
    if (isNaN(fieldId)) {
      return NextResponse.json({ success: false, message: 'Invalid question / template field ID.' }, { status: 400 });
    }
    return await leadController.deleteTemplateField(req, fieldId, user);
  });
}
