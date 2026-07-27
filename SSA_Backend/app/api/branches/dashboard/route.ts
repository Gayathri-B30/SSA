import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../src/modules/auth/middlewares/auth.middleware';
import { EmployeeRepository } from '../../../../src/modules/employee/repositories/employee.repository';

const employeeRepo = new EmployeeRepository();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    if (user.role !== 'Branch') {
      return NextResponse.json(
        { message: 'Unauthorized access. Only branch users can access this dashboard.' },
        { status: 403 }
      );
    }

    try {
      const branchId = user.branchId;
      const branchName = user.name;

      const employees = await employeeRepo.findAllByBranchId(branchId);
      const totalEmployees = await employeeRepo.countEmployeesByBranchId(branchId);

      return NextResponse.json({
        branchName,
        branchId,
        totalEmployees,
        employees
      }, { status: 200 });
    } catch (error: any) {
      console.error('Error in Branch Dashboard route:', error.message);
      return NextResponse.json(
        { message: 'Failed to fetch branch dashboard data.' },
        { status: 500 }
      );
    }
  });
}
