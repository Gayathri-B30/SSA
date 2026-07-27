import { NextRequest } from 'next/server';
import { CompanyController, companyMiddleware } from '../../../src/modules/company';

const companyController = new CompanyController();

export async function GET(req: NextRequest) {
  return await companyMiddleware(req, async () => {
    return await companyController.getAll(req);
  });
}

export async function POST(req: NextRequest) {
  return await companyMiddleware(req, async () => {
    return await companyController.register(req);
  });
}

export async function PUT(req: NextRequest) {
  return await companyMiddleware(req, async () => {
    return await companyController.update(req);
  });
}

export async function DELETE(req: NextRequest) {
  return await companyMiddleware(req, async () => {
    return await companyController.delete(req);
  });
}
