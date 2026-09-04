import { getDataSource } from '../../../shared/config/data-source';
import { ClientModel } from '../models/client.model';
import { LeadModel } from '../../lead/models/lead.model';
import { ProjectModel } from '../../project/models/project.model';
import { Repository, Like, FindOptionsWhere } from 'typeorm';

export class ClientRepository {
  private async getClientRepo(): Promise<Repository<ClientModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(ClientModel);
  }

  private async getLeadRepo(): Promise<Repository<LeadModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(LeadModel);
  }

  private async getProjectRepo(): Promise<Repository<ProjectModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(ProjectModel);
  }

  async findAll(companyId?: string, branchId?: string | null, search?: string): Promise<ClientModel[]> {
    const repo = await this.getClientRepo();
    const where: FindOptionsWhere<ClientModel> = {};

    if (companyId) {
      where.companyId = companyId;
    }
    if (branchId) {
      where.branchId = branchId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      return await repo.find({
        where: [
          { ...where, clientName: Like(`%${q}%`) },
          { ...where, company: Like(`%${q}%`) },
          { ...where, clientCode: Like(`%${q}%`) },
          { ...where, contactPerson: Like(`%${q}%`) },
          { ...where, email: Like(`%${q}%`) },
          { ...where, mobile: Like(`%${q}%`) },
        ],
        order: { createdAt: 'DESC' }
      });
    }

    return await repo.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<ClientModel | null> {
    const repo = await this.getClientRepo();
    return await repo.findOne({ where: { id } });
  }

  async findByCode(clientCode: string): Promise<ClientModel | null> {
    const repo = await this.getClientRepo();
    return await repo.findOne({ where: { clientCode } });
  }

  async findByMobile(mobile: string, companyId?: string): Promise<ClientModel | null> {
    const repo = await this.getClientRepo();
    const cleanMobile = mobile.replace(/[\s\-+]/g, '');
    const qb = repo.createQueryBuilder('client');
    if (companyId) {
      qb.where('client.companyId = :companyId', { companyId });
      qb.andWhere(
        '(client.mobile = :mobile OR regexp_replace(COALESCE(client.mobile, \'\'), \'[^0-9]\', \'\', \'g\') = :cleanMobile)',
        { mobile: mobile.trim(), cleanMobile }
      );
    } else {
      qb.where(
        '(client.mobile = :mobile OR regexp_replace(COALESCE(client.mobile, \'\'), \'[^0-9]\', \'\', \'g\') = :cleanMobile)',
        { mobile: mobile.trim(), cleanMobile }
      );
    }
    return await qb.getOne();
  }

  async countClients(companyId?: string): Promise<number> {
    const repo = await this.getClientRepo();
    if (companyId) {
      return await repo.count({ where: { companyId } });
    }
    return await repo.count();
  }

  async create(data: Partial<ClientModel>): Promise<ClientModel> {
    const repo = await this.getClientRepo();
    const client = repo.create(data);
    return await repo.save(client);
  }

  async update(id: string, data: Partial<ClientModel>): Promise<ClientModel | null> {
    const repo = await this.getClientRepo();
    await repo.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const repo = await this.getClientRepo();
    const res = await repo.delete(id);
    return (res.affected ?? 0) > 0;
  }

  // Relations: Leads for a client
  async findLeadsByClientId(clientId: string, clientName?: string): Promise<LeadModel[]> {
    const repo = await this.getLeadRepo();
    const query = repo.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.category', 'category')
      .where('lead.clientId = :clientId', { clientId });

    if (clientName) {
      query.orWhere('lead.clientName = :clientName', { clientName })
           .orWhere('lead.company = :clientName', { clientName });
    }

    return await query.orderBy('lead.createdAt', 'DESC').getMany();
  }

  // Relations: Projects for a client
  async findProjectsByClientId(clientId: string, clientName?: string): Promise<ProjectModel[]> {
    const repo = await this.getProjectRepo();
    const query = repo.createQueryBuilder('project')
      .where('project.clientId = :clientId', { clientId });

    if (clientName) {
      query.orWhere('project.clientName = :clientName', { clientName });
    }

    return await query.orderBy('project.createdAt', 'DESC').getMany();
  }
}
