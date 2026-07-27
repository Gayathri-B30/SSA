import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../../src/modules/auth/middlewares/auth.middleware';
import { LeadController } from '../../../../../src/modules/lead';

const leadController = new LeadController();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const leadId = parseInt(resolvedParams.id, 10);

  return await authMiddleware(req, async (user: any) => {
    return await leadController.getLeadDeliverables(req, leadId, user);
  });
}
