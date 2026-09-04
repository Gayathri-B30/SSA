import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../../src/modules/auth/middlewares/auth.middleware';
import { ClientController } from '../../../../../src/modules/client';

const clientController = new ClientController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return await authMiddleware(req, async (_user: any) => {
    return await clientController.getClientProjects(req, resolvedParams.id);
  });
}
