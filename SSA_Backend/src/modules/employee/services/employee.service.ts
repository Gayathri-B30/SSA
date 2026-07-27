import { EmployeeRepository } from '../repositories/employee.repository';
import { EmployeeModel } from '../models/employee.model';
import { BranchRepository } from '../../branch/repositories/branch.repository';

export class EmployeeService {
  private employeeRepository: EmployeeRepository;
  private branchRepository: BranchRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
    this.branchRepository = new BranchRepository();
  }

  async getEmployees(companyId: string): Promise<EmployeeModel[]> {
    return await this.employeeRepository.findAllByCompanyId(companyId);
  }

  async addEmployee(companyId: string, employeeData: Partial<EmployeeModel>): Promise<EmployeeModel> {
    if (!employeeData.name || !employeeData.email || !employeeData.phone || !employeeData.department || !employeeData.designation || !employeeData.joiningDate) {
      throw new Error('Missing required employee fields.');
    }

    // Ensure email is unique within the company
    const existing = await this.employeeRepository.findByEmailAndCompanyId(employeeData.email, companyId);
    if (existing) {
      throw new Error('Employee email is already registered.');
    }

    // Verify branch exists and belongs to company if provided
    if (employeeData.branchId) {
      const branch = await this.branchRepository.findByBranchId(employeeData.branchId);
      if (!branch || branch.companyId !== companyId) {
        throw new Error('Invalid branch specified.');
      }
    }

    // Sequential EMP-XXX generation based on max suffix
    const employeeId = await this.employeeRepository.getNextEmployeeId();

    employeeData.employeeId = employeeId;
    employeeData.companyId = companyId;
    
    return await this.employeeRepository.createEmployee(employeeData);
  }

  async updateEmployee(employeeId: string, companyId: string, employeeData: Partial<EmployeeModel>): Promise<EmployeeModel> {
    const employee = await this.employeeRepository.findByEmployeeId(employeeId);
    if (!employee || employee.companyId !== companyId) {
      throw new Error('Employee not found.');
    }

    if (employeeData.name) employee.name = employeeData.name;
    if (employeeData.phone) employee.phone = employeeData.phone;
    if (employeeData.department) employee.department = employeeData.department;
    if (employeeData.designation) employee.designation = employeeData.designation;
    if (employeeData.manager !== undefined) employee.manager = employeeData.manager;
    if (employeeData.joiningDate) employee.joiningDate = employeeData.joiningDate;
    if (employeeData.status) employee.status = employeeData.status;

    if (employeeData.branchId !== undefined) {
      if (employeeData.branchId) {
        const branch = await this.branchRepository.findByBranchId(employeeData.branchId);
        if (!branch || branch.companyId !== companyId) {
          throw new Error('Invalid branch specified.');
        }
        employee.branchId = employeeData.branchId;
      } else {
        employee.branchId = undefined; // clears branch mapping in DB
      }
    }

    if (employeeData.email) {
      const existing = await this.employeeRepository.findByEmailAndCompanyId(employeeData.email, companyId);
      if (existing && existing.employeeId !== employeeId) {
        throw new Error('Employee email is already registered.');
      }
      employee.email = employeeData.email;
    }

    return await this.employeeRepository.createEmployee(employee);
  }

  async deleteEmployee(employeeId: string, companyId: string): Promise<boolean> {
    const employee = await this.employeeRepository.findByEmployeeId(employeeId);
    if (!employee || employee.companyId !== companyId) {
      throw new Error('Employee not found.');
    }
    return await this.employeeRepository.deleteByEmployeeId(employeeId);
  }

  async getEmployeesByBranch(branchId: string): Promise<EmployeeModel[]> {
    return await this.employeeRepository.findAllByBranchId(branchId);
  }
}
