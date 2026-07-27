import { BranchRepository } from '../repositories/branch.repository';
import { BranchModel } from '../models/branch.model';
import bcrypt from 'bcryptjs';

export class BranchService {
  private branchRepository: BranchRepository;

  constructor() {
    this.branchRepository = new BranchRepository();
  }

  async getBranches(companyId: string): Promise<BranchModel[]> {
    const branches = await this.branchRepository.findAllByCompanyId(companyId);
    branches.forEach(b => delete b.password);
    return branches;
  }

  async addBranch(companyId: string, branchData: Partial<BranchModel>): Promise<BranchModel> {
    if (!branchData.name || !branchData.code || !branchData.manager || !branchData.address || !branchData.phone) {
      throw new Error('Missing required branch fields. (name, code, manager, address, phone are required)');
    }

    // Ensure branch code is unique within the company
    const existing = await this.branchRepository.findByCodeAndCompanyId(branchData.code, companyId);
    if (existing) {
      throw new Error('Branch code is already registered for this company.');
    }

    // Sequential BRN-XXX generation based on max suffix
    const branchId = await this.branchRepository.getNextBranchId();

    branchData.branchId = branchId;
    branchData.companyId = companyId;

    if (branchData.password) {
      branchData.password = await bcrypt.hash(branchData.password, 10);
    } else {
      branchData.password = await bcrypt.hash('Branch@123', 10);
    }

    const savedBranch = await this.branchRepository.createBranch(branchData);
    delete savedBranch.password;
    return savedBranch;
  }

  async updateBranch(branchId: string, companyId: string, branchData: Partial<BranchModel>): Promise<BranchModel> {
    const branch = await this.branchRepository.findByBranchId(branchId);
    if (!branch || branch.companyId !== companyId) {
      throw new Error('Branch not found.');
    }

    if (branchData.name) branch.name = branchData.name;
    if (branchData.manager) branch.manager = branchData.manager;
    if (branchData.address) branch.address = branchData.address;
    if (branchData.phone) branch.phone = branchData.phone;
    if (branchData.status) branch.status = branchData.status;
    if (branchData.password) {
      branch.password = await bcrypt.hash(branchData.password, 10);
    }

    if (branchData.code) {
      const existing = await this.branchRepository.findByCodeAndCompanyId(branchData.code, companyId);
      if (existing && existing.branchId !== branchId) {
        throw new Error('Branch code is already registered for this company.');
      }
      branch.code = branchData.code;
    }

    const savedBranch = await this.branchRepository.createBranch(branch);
    delete savedBranch.password;
    return savedBranch;
  }

  async deleteBranch(branchId: string, companyId: string): Promise<boolean> {
    const branch = await this.branchRepository.findByBranchId(branchId);
    if (!branch || branch.companyId !== companyId) {
      throw new Error('Branch not found.');
    }
    return await this.branchRepository.deleteByBranchId(branchId, companyId);
  }
}
