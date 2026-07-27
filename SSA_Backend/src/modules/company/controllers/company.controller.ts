import { NextRequest, NextResponse } from 'next/server';
import { CompanyService } from '../services/company.service';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const companies = await this.companyService.getAllCompanies();
      return NextResponse.json(companies, { status: 200 });
    } catch (error: any) {
      console.error('Error in CompanyController.getAll:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to fetch companies.' },
        { status: 500 }
      );
    }
  }

  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const company = await this.companyService.registerCompany(body);
      return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
      console.error('Error in CompanyController.register:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to register company.' },
        { status: 400 }
      );
    }
  }

  async update(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { companyId, ...updateData } = body;

      if (!companyId) {
        return NextResponse.json(
          { message: 'Company ID (companyId) is required for update.' },
          { status: 400 }
        );
      }

      const company = await this.companyService.updateCompany(companyId, updateData);
      return NextResponse.json(company, { status: 200 });
    } catch (error: any) {
      console.error('Error in CompanyController.update:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to update company.' },
        { status: 400 }
      );
    }
  }

  async delete(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const companyId = searchParams.get('companyId');

      if (!companyId) {
        return NextResponse.json(
          { message: 'Company ID (companyId) is required for deletion.' },
          { status: 400 }
        );
      }

      const deleted = await this.companyService.deleteCompany(companyId);
      if (!deleted) {
        return NextResponse.json(
          { message: 'Company not found or already deleted.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Company deleted successfully.' }, { status: 200 });
    } catch (error: any) {
      console.error('Error in CompanyController.delete:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to delete company.' },
        { status: 500 }
      );
    }
  }
}
