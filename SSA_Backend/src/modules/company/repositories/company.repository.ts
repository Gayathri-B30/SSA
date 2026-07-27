import { getDataSource } from '../../../shared/config/data-source';
import { CompanyModel } from '../models/company.model';
import { Repository } from 'typeorm';

export class CompanyRepository {
  private async getRepository(): Promise<Repository<CompanyModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('CompanyModel');
  }

  async findAll(): Promise<CompanyModel[]> {
    const repo = await this.getRepository();
    return await repo.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<CompanyModel | null> {
    const repo = await this.getRepository();
    return await repo.findOne({ where: { id } });
  }

  async findByCompanyId(companyId: string): Promise<CompanyModel | null> {
    const repo = await this.getRepository();
    return await repo.findOne({ where: { companyId } });
  }

  async findByContactPerson(contactPerson: string): Promise<CompanyModel | null> {
    const repo = await this.getRepository();
    return await repo.createQueryBuilder('company')
      .where('LOWER(company.contactPerson) = :contactPerson', { contactPerson: contactPerson.toLowerCase() })
      .getOne();
  }

  async findByEmail(email: string): Promise<CompanyModel | null> {
    const repo = await this.getRepository();
    return await repo.findOne({ where: { email } });
  }

  async createCompany(companyData: Partial<CompanyModel>): Promise<CompanyModel> {
    const repo = await this.getRepository();
    const company = repo.create(companyData);
    return await repo.save(company);
  }

  async getNextCompanyId(): Promise<string> {
    const repo = await this.getRepository();
    const companies = await repo.find();
    let maxNum = 0;
    for (const c of companies) {
      const match = c.companyId.match(/^COM-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `COM-${String(maxNum + 1).padStart(3, '0')}`;
  }

  async deleteByCompanyId(companyId: string): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete({ companyId });
    return (result.affected ?? 0) > 0;
  }
}
