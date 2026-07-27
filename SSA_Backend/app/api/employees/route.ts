import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';
import { EmployeeController } from '../../../src/modules/employee';

const employeeController = new EmployeeController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await employeeController.getAll(req, user);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await employeeController.register(req, user);
  });
}

export async function PUT(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await employeeController.update(req, user);
  });
}

export async function DELETE(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await employeeController.delete(req, user);
  });
}
