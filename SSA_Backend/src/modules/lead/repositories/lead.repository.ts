import { getDataSource } from '../../../shared/config/data-source';
import { LeadModel } from '../models/lead.model';
import { ProjectCategoryModel } from '../models/project-category.model';
import { CategoryTemplateFieldModel } from '../models/category-template-field.model';
import { LeadRequirementValueModel } from '../models/lead-requirement-value.model';
import { DeliverableTemplateModel } from '../models/deliverable-template.model';
import { LeadDeliverableModel } from '../models/lead-deliverable.model';
import { Repository, IsNull } from 'typeorm';

export class LeadRepository {
  private async getLeadRepo(): Promise<Repository<LeadModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('LeadModel');
  }

  private async getCategoryRepo(): Promise<Repository<ProjectCategoryModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('ProjectCategoryModel');
  }

  private async getFieldRepo(): Promise<Repository<CategoryTemplateFieldModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('CategoryTemplateFieldModel');
  }

  private async getValueRepo(): Promise<Repository<LeadRequirementValueModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('LeadRequirementValueModel');
  }

  private async getDeliverableTemplateRepo(): Promise<Repository<DeliverableTemplateModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('DeliverableTemplateModel');
  }

  private async getLeadDeliverableRepo(): Promise<Repository<LeadDeliverableModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('LeadDeliverableModel');
  }

  // Categories
  async findAllCategories(): Promise<ProjectCategoryModel[]> {
    const repo = await this.getCategoryRepo();
    return await repo.find({ order: { id: 'ASC' } });
  }

  async findCategoryById(id: number): Promise<ProjectCategoryModel | null> {
    const repo = await this.getCategoryRepo();
    return await repo.findOne({ where: { id } });
  }

  async findCategoryByCode(code: string): Promise<ProjectCategoryModel | null> {
    const repo = await this.getCategoryRepo();
    return await repo.findOne({ where: { code } });
  }

  async createCategory(categoryData: Partial<ProjectCategoryModel>): Promise<ProjectCategoryModel> {
    const repo = await this.getCategoryRepo();
    const category = repo.create(categoryData);
    return await repo.save(category);
  }

  async updateCategory(id: number, categoryData: Partial<ProjectCategoryModel>): Promise<ProjectCategoryModel> {
    const repo = await this.getCategoryRepo();
    const category = await repo.findOne({ where: { id } });
    if (!category) throw new Error(`Category with ID ${id} not found.`);
    Object.assign(category, categoryData);
    return await repo.save(category);
  }

  async deleteCategory(id: number): Promise<void> {
    const repo = await this.getCategoryRepo();
    await repo.delete(id);
  }

  // Template Fields
  async findTemplateFieldsByCategoryId(categoryId: number): Promise<CategoryTemplateFieldModel[]> {
    const repo = await this.getFieldRepo();
    return await repo.find({
      where: { categoryId },
      order: { displayOrder: 'ASC', id: 'ASC' }
    });
  }

  async findTemplateFieldById(id: number): Promise<CategoryTemplateFieldModel | null> {
    const repo = await this.getFieldRepo();
    return await repo.findOne({ where: { id } });
  }

  async createTemplateField(fieldData: Partial<CategoryTemplateFieldModel>): Promise<CategoryTemplateFieldModel> {
    const repo = await this.getFieldRepo();
    const field = repo.create(fieldData);
    return await repo.save(field);
  }

  async updateTemplateField(id: number, fieldData: Partial<CategoryTemplateFieldModel>): Promise<CategoryTemplateFieldModel> {
    const repo = await this.getFieldRepo();
    const field = await repo.findOne({ where: { id } });
    if (!field) throw new Error(`Template field with ID ${id} not found.`);
    Object.assign(field, fieldData);
    return await repo.save(field);
  }

  async deleteTemplateField(id: number): Promise<void> {
    const repo = await this.getFieldRepo();
    await repo.delete(id);
  }

  // Leads
  async getNextLeadId(): Promise<string> {
    const repo = await this.getLeadRepo();
    const leads = await repo.find();
    let maxNum = 0;
    for (const l of leads) {
      const match = l.leadId.match(/^LEAD-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `LEAD-${String(maxNum + 1).padStart(3, '0')}`;
  }

  async createLead(leadData: Partial<LeadModel>): Promise<LeadModel> {
    const repo = await this.getLeadRepo();
    const lead = repo.create(leadData);
    return await repo.save(lead);
  }

  async deleteLead(id: number): Promise<void> {
    const repo = await this.getLeadRepo();
    await repo.delete(id);
  }

  async findLeadById(id: number): Promise<LeadModel | null> {
    const repo = await this.getLeadRepo();
    return await repo.findOne({
      where: { id },
      relations: { category: true }
    });
  }

  async findLeadByLeadId(leadId: string): Promise<LeadModel | null> {
    const repo = await this.getLeadRepo();
    return await repo.findOne({
      where: { leadId },
      relations: { category: true }
    });
  }

  async findAllLeads(companyId: string, branchId: string | null, role: string): Promise<LeadModel[]> {
    const repo = await this.getLeadRepo();
    const query = repo.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.category', 'category');

    // Scoping leads based on company and branch roles
    if (role === 'Company') {
      query.andWhere('lead.companyId = :companyId', { companyId });
    } else if (role === 'Branch') {
      query.andWhere('lead.companyId = :companyId', { companyId });
      if (branchId) {
        query.andWhere('lead.branchId = :branchId', { branchId });
      }
    } else if (role !== 'Super Admin' && role !== 'Employee') {
      // Default fallback: limit to own company for security
      query.andWhere('lead.companyId = :companyId', { companyId });
    }

    return await query.orderBy('lead.id', 'DESC').getMany();
  }

  // Lead Requirement Values
  async saveRequirementValues(leadId: number, values: Record<string, any>): Promise<LeadRequirementValueModel[]> {
    const repo = await this.getValueRepo();
    const results: LeadRequirementValueModel[] = [];

    const isValueEmpty = (val: any): boolean => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'number' && Number.isNaN(val)) return true;
      if (typeof val === 'string' && val.trim() === '') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    };

    for (const [fieldKey, val] of Object.entries(values)) {
      let existing = await repo.findOne({ where: { leadId, fieldKey } });
      if (isValueEmpty(val)) {
        if (existing) {
          await repo.remove(existing);
        }
      } else {
        if (existing) {
          existing.value = val;
          results.push(await repo.save(existing));
        } else {
          const newVal = repo.create({ leadId, fieldKey, value: val });
          results.push(await repo.save(newVal));
        }
      }
    }
    return results;
  }

  async findRequirementValuesByLeadId(leadId: number): Promise<LeadRequirementValueModel[]> {
    const repo = await this.getValueRepo();
    return await repo.find({ where: { leadId } });
  }

  // Deliverables Templates
  async findDeliverableTemplatesByCategoryId(categoryId: number): Promise<DeliverableTemplateModel[]> {
    const repo = await this.getDeliverableTemplateRepo();
    return await repo.find({
      where: [
        { categoryId: IsNull() }, // Common deliverables
        { categoryId }            // Category specific deliverables
      ]
    });
  }

  // Lead Deliverables
  async createLeadDeliverables(deliverables: Partial<LeadDeliverableModel>[]): Promise<LeadDeliverableModel[]> {
    const repo = await this.getLeadDeliverableRepo();
    const created = repo.create(deliverables);
    return await repo.save(created);
  }

  async findDeliverablesByLeadId(leadId: number): Promise<LeadDeliverableModel[]> {
    const repo = await this.getLeadDeliverableRepo();
    return await repo.find({
      where: { leadId },
      order: { id: 'ASC' }
    });
  }
}
