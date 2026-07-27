import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { UserModel } from '../models/user.model';
import { CompanyRepository } from '../../company/repositories/company.repository';
import { CompanyModel } from '../../company/models/company.model';
import { BranchModel } from '../../branch/models/branch.model';
import { getDataSource } from '../../../shared/config/data-source';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-architect-erp';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';

export class AuthService {
  private userRepository: UserRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
  }

  async companyLogin(username: string, password: string): Promise<{ user: any; token: string }> {
    const company = await this.companyRepository.findByContactPerson(username);
    if (!company) {
      throw new Error('Invalid Username or Password.');
    }

    if (company.status === 'Inactive') {
      throw new Error('This account has been deactivated. Please contact your administrator.');
    }

    if (!company.password) {
      throw new Error('Company account has no password set. Please contact your administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      throw new Error('Invalid Username or Password.');
    }

    const token = jwt.sign(
      {
        id: company.id,
        companyId: company.companyId,
        email: company.email,
        role: 'Company',
        name: company.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY as any }
    );

    const companyResponse = {
      id: company.companyId,
      userId: company.companyId,
      name: company.name,
      email: company.email,
      role: 'Company',
      contactPerson: company.contactPerson,
      status: company.status,
    };

    return { user: companyResponse, token };
  }

  async login(username: string, password: string): Promise<{ user: any; token: string }> {
    // Try to find in UserRepository first
    const user = await this.userRepository.findByUserId(username);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid Username or Password.');
      }

      const token = jwt.sign(
        {
          id: user.id,
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY as any }
      );

      const userResponse = {
        id: `USR-${String(user.id).padStart(3, '0')}`,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };

      return { user: userResponse, token };
    }

    // Try to find in CompanyRepository
    const company = await this.companyRepository.findByContactPerson(username);
    if (company) {
      if (company.status === 'Inactive') {
        throw new Error('This account has been deactivated. Please contact your administrator.');
      }

      if (!company.password) {
        throw new Error('Company account has no password set. Please contact your administrator.');
      }

      const isPasswordValid = await bcrypt.compare(password, company.password);
      if (!isPasswordValid) {
        throw new Error('Invalid Username or Password.');
      }

      const token = jwt.sign(
        {
          id: company.id,
          companyId: company.companyId,
          email: company.email,
          role: 'Company',
          name: company.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY as any }
      );

      const companyResponse = {
        id: company.companyId,
        userId: company.companyId,
        name: company.name,
        email: company.email,
        role: 'Company',
        contactPerson: company.contactPerson,
        status: company.status,
      };

      return { user: companyResponse, token };
    }

    // Try to find in BranchRepository
    const dataSource = await getDataSource();
    const branchRepo = dataSource.getRepository<BranchModel>('BranchModel');
    let branch = await branchRepo.findOne({ where: { branchId: username } });
    if (!branch) {
      branch = await branchRepo.findOne({ where: { code: username } });
    }

    if (branch) {
      if (branch.status === 'Inactive') {
        throw new Error('This branch has been deactivated. Please contact your administrator.');
      }

      const savedPassword = branch.password || await bcrypt.hash('Branch@123', 10);
      const isPasswordValid = await bcrypt.compare(password, savedPassword);
      if (!isPasswordValid) {
        throw new Error('Invalid Username or Password.');
      }

      const token = jwt.sign(
        {
          id: branch.id,
          branchId: branch.branchId,
          role: 'Branch',
          name: branch.name,
          companyId: branch.companyId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY as any }
      );

      const branchResponse = {
        id: branch.branchId,
        userId: branch.branchId,
        name: branch.name,
        role: 'Branch',
        code: branch.code,
        manager: branch.manager,
        companyId: branch.companyId,
      };

      return { user: branchResponse, token };
    }

    throw new Error('Invalid Username or Password.');
  }

  async register(userData: Partial<UserModel>): Promise<UserModel> {
    if (!userData.userId || !userData.email || !userData.password || !userData.name) {
      throw new Error('Missing required user registration fields.');
    }

    const existingUserById = await this.userRepository.findByUserId(userData.userId);
    if (existingUserById) {
      throw new Error('User ID is already registered.');
    }

    const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUserData = {
      ...userData,
      password: hashedPassword,
    };

    return await this.userRepository.createUser(newUserData);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  async getUserById(id: number): Promise<UserModel | null> {
    return await this.userRepository.findById(id);
  }

  async getCompanyById(id: number): Promise<CompanyModel | null> {
    return await this.companyRepository.findById(id);
  }

  async getBranchById(id: number): Promise<BranchModel | null> {
    const dataSource = await getDataSource();
    const branchRepo = dataSource.getRepository<BranchModel>('BranchModel');
    return await branchRepo.findOne({ where: { id } });
  }

  async branchLogin(username: string, password: string): Promise<{ user: any; token: string }> {
    const dataSource = await getDataSource();
    const branchRepo = dataSource.getRepository<BranchModel>('BranchModel');
    
    // Find branch by branchId or code
    let branch = await branchRepo.findOne({ where: { branchId: username } });
    if (!branch) {
      branch = await branchRepo.findOne({ where: { code: username } });
    }

    if (!branch) {
      throw new Error('Invalid Username or Password.');
    }

    if (branch.status === 'Inactive') {
      throw new Error('This branch has been deactivated. Please contact your administrator.');
    }

    const savedPassword = branch.password || await bcrypt.hash('Branch@123', 10);
    const isPasswordValid = await bcrypt.compare(password, savedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid Username or Password.');
    }

    const token = jwt.sign(
      {
        id: branch.id,
        branchId: branch.branchId,
        role: 'Branch',
        name: branch.name,
        companyId: branch.companyId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY as any }
    );

    const branchResponse = {
      id: branch.branchId,
      userId: branch.branchId,
      name: branch.name,
      role: 'Branch',
      code: branch.code,
      manager: branch.manager,
      companyId: branch.companyId,
    };

    return { user: branchResponse, token };
  }
}
