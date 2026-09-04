import "reflect-metadata";
import { DataSource } from "typeorm";
import { envConfig } from "./env.config";
import { TestModel } from "../../modules/test/models/test.model";
import { UserModel } from "../../modules/auth/models/user.model";
import { CompanyModel } from "../../modules/company/models/company.model";
import { EmployeeModel } from "../../modules/employee/models/employee.model";
import { BranchModel } from "../../modules/branch/models/branch.model";
import { ProjectCategoryModel } from "../../modules/lead/models/project-category.model";
import { CategoryTemplateFieldModel } from "../../modules/lead/models/category-template-field.model";
import { LeadModel } from "../../modules/lead/models/lead.model";
import { LeadRequirementValueModel } from "../../modules/lead/models/lead-requirement-value.model";
import { DeliverableTemplateModel } from "../../modules/lead/models/deliverable-template.model";
import { LeadDeliverableModel } from "../../modules/lead/models/lead-deliverable.model";
import { ClientModel } from "../../modules/client/models/client.model";
import {
  ProjectModel,
  DisciplineModel,
  ProjectDisciplineModel,
  DrawingTypeModel,
  DrawingModel,
  DrawingRevisionModel,
  DrawingFileModel
} from "../../modules/project";

const globalRef = global as unknown as { AppDataSource: DataSource | undefined };

export const AppDataSource = globalRef.AppDataSource || new DataSource({
  type: "postgres",
  ...(envConfig.database.url
    ? { url: envConfig.database.url }
    : {
        host: envConfig.database.host,
        port: envConfig.database.port,
        username: envConfig.database.username,
        password: envConfig.database.password,
        database: envConfig.database.database,
      }),
  ssl: envConfig.database.ssl,
  synchronize: true,
  logging: true,
  entities: [
    TestModel, 
    UserModel, 
    CompanyModel, 
    EmployeeModel, 
    BranchModel,
    ClientModel,
    ProjectCategoryModel,
    CategoryTemplateFieldModel,
    LeadModel,
    LeadRequirementValueModel,
    DeliverableTemplateModel,
    LeadDeliverableModel,
    ProjectModel,
    DisciplineModel,
    ProjectDisciplineModel,
    DrawingTypeModel,
    DrawingModel,
    DrawingRevisionModel,
    DrawingFileModel
  ],
  migrations: [],
  subscribers: [],
});

// Safe getMetadata & getRepository wrapper to handle Next.js / Turbopack HMR class identity changes
if (!(AppDataSource as any).__safeGetRepositoryPatched) {
  const origFindMetadata = (AppDataSource as any).findMetadata?.bind(AppDataSource);
  (AppDataSource as any).findMetadata = function (target: any) {
    const found = origFindMetadata ? origFindMetadata(target) : undefined;
    if (found) return found;
    const targetName = typeof target === 'function' ? target.name : String(target);
    return AppDataSource.entityMetadatas.find(
      m => m.name === targetName || m.targetName === targetName || m.tableName === targetName || (typeof m.target === 'function' && m.target.name === targetName)
    );
  };

  const origHasMetadata = AppDataSource.hasMetadata.bind(AppDataSource);
  (AppDataSource as any).hasMetadata = function (target: any) {
    if (origHasMetadata(target)) return true;
    return !!(AppDataSource as any).findMetadata(target);
  };

  const origGetMetadata = AppDataSource.getMetadata.bind(AppDataSource);
  (AppDataSource as any).getMetadata = function (target: any) {
    try {
      return origGetMetadata(target);
    } catch {
      const meta = (AppDataSource as any).findMetadata(target);
      if (meta) return meta;
      throw new Error(`No metadata for "${typeof target === 'function' ? target.name : target}" was found.`);
    }
  };

  const origGetRepository = AppDataSource.getRepository.bind(AppDataSource);
  (AppDataSource as any).getRepository = function <Entity>(target: any) {
    try {
      return origGetRepository(target);
    } catch (err: any) {
      const meta = (AppDataSource as any).findMetadata(target);
      if (meta) {
        return origGetRepository(meta.target as any);
      }
      throw err;
    }
  };

  (AppDataSource as any).__safeGetRepositoryPatched = true;
}

if (process.env.NODE_ENV !== "production") {
  globalRef.AppDataSource = AppDataSource;
}

export async function getDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    
    // Seed default superadmin user if database is empty
    try {
      const userRepo = AppDataSource.getRepository(UserModel);
      const count = await userRepo.count();
      if (count === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const adminUser = userRepo.create({
          userId: 'superadmin',
          name: 'Sundar Sundram',
          email: 'sundar@sundramarchitects.com',
          role: 'Super Admin',
          password: hashedPassword,
        });
        await userRepo.save(adminUser);
        console.log('[Seed] Default superadmin user seeded successfully.');
      }
    } catch (err) {
      console.error('[Seed] Error seeding default admin user:', err);
    }

    // Seed default company if database has no companies
    try {
      const companyRepo = AppDataSource.getRepository(CompanyModel);
      const companyCount = await companyRepo.count();
      if (companyCount === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const defaultCompany = companyRepo.create({
          companyId: 'COM-001',
          name: 'Sundram Architects',
          status: 'Active',
          address: 'Chennai, Tamil Nadu, India',
          email: 'sundar@sundramarchitects.com',
          contactPerson: 'Sundar Sundram',
          mobileNumber: '9876543210',
          designation: 'Proprietor',
          gstNo: '33ABCDE1234F1Z0',
          panNo: 'ABCDE1234F',
          password: hashedPassword,
        });
        await companyRepo.save(defaultCompany);
        console.log('[Seed] Default company seeded successfully.');
      }
    } catch (err) {
      console.error('[Seed] Error seeding default company:', err);
    }
  }
  return AppDataSource;
}
