import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../src/modules/auth/middlewares/auth.middleware';
import { LeadController } from '../../../../src/modules/lead';

const leadController = new LeadController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async () => {
    return await leadController.getTemplateFields(req);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user) => {
    return await leadController.createTemplateField(req, user);
  });
}
