import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';
import { BranchController } from '../../../src/modules/branch';

const branchController = new BranchController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await branchController.getAll(req, user);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await branchController.register(req, user);
  });
}

export async function PUT(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await branchController.update(req, user);
  });
}

export async function DELETE(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await branchController.delete(req, user);
  });
}
