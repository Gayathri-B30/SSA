import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';
import { ClientController } from '../../../src/modules/client';

const clientController = new ClientController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await clientController.getAllClients(req, user);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await clientController.createClient(req, user);
  });
}
