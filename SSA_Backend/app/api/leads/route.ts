import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';
import { LeadController } from '../../../src/modules/lead';

const leadController = new LeadController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await leadController.getAllLeads(req, user);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await leadController.createLead(req, user);
  });
}
