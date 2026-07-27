import { NextRequest } from 'next/server';
import { AuthController, authMiddleware } from '../../../../src/modules/auth';

const authController = new AuthController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (currentUser) => {
    return await authController.getProfile(req, currentUser);
  });
}
