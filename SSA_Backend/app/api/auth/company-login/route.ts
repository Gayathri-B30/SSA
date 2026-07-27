import { NextRequest } from 'next/server';
import { AuthController } from '../../../../src/modules/auth';

const authController = new AuthController();

export async function POST(req: NextRequest) {
  return await authController.companyLogin(req);
}
