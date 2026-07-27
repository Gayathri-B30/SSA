import { NextRequest, NextResponse } from 'next/server';
import { BranchService } from '../services/branch.service';

export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }

  async getAll(req: NextRequest, user: any): Promise<NextResponse> {
    try {
      const companyId = user.companyId || user.userId;
      if (!companyId) {
        return NextResponse.json({ message: 'Company Identification is missing.' }, { status: 400 });
      }

      const branches = await this.branchService.getBranches(companyId);
      return NextResponse.json(branches, { status: 200 });
    } catch (error: any) {
      console.error('Error in BranchController.getAll:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to fetch branches.' },
        { status: 500 }
      );
    }
  }

  async register(req: NextRequest, user: any): Promise<NextResponse> {
    try {
      const companyId = user.companyId || user.userId;
      if (!companyId) {
        return NextResponse.json({ message: 'Company Identification is missing.' }, { status: 400 });
      }

      const body = await req.json();
      const branch = await this.branchService.addBranch(companyId, body);
      return NextResponse.json(branch, { status: 201 });
    } catch (error: any) {
      console.error('Error in BranchController.register:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to register branch.' },
        { status: 400 }
      );
    }
  }

  async update(req: NextRequest, user: any): Promise<NextResponse> {
    try {
      const companyId = user.companyId || user.userId;
      if (!companyId) {
        return NextResponse.json({ message: 'Company Identification is missing.' }, { status: 400 });
      }

      const body = await req.json();
      const { branchId, ...updateData } = body;

      if (!branchId) {
        return NextResponse.json(
          { message: 'Branch ID (branchId) is required for update.' },
          { status: 400 }
        );
      }

      const branch = await this.branchService.updateBranch(branchId, companyId, updateData);
      return NextResponse.json(branch, { status: 200 });
    } catch (error: any) {
      console.error('Error in BranchController.update:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to update branch.' },
        { status: 400 }
      );
    }
  }

  async delete(req: NextRequest, user: any): Promise<NextResponse> {
    try {
      const companyId = user.companyId || user.userId;
      if (!companyId) {
        return NextResponse.json({ message: 'Company Identification is missing.' }, { status: 400 });
      }

      const { searchParams } = new URL(req.url);
      const branchId = searchParams.get('branchId');

      if (!branchId) {
        return NextResponse.json(
          { message: 'Branch ID (branchId) is required for deletion.' },
          { status: 400 }
        );
      }

      const deleted = await this.branchService.deleteBranch(branchId, companyId);
      if (!deleted) {
        return NextResponse.json(
          { message: 'Branch not found or already deleted.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Branch deleted successfully.' }, { status: 200 });
    } catch (error: any) {
      console.error('Error in BranchController.delete:', error.message);
      return NextResponse.json(
        { message: error.message || 'Failed to delete branch.' },
        { status: 500 }
      );
    }
  }
}
