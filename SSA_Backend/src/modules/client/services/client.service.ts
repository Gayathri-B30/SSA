import { ClientRepository } from '../repositories/client.repository';
import { ClientModel } from '../models/client.model';

export class ClientService {
  private clientRepo: ClientRepository;

  constructor() {
    this.clientRepo = new ClientRepository();
  }

  async getAllClients(
    userContext: { companyId: string; branchId: string | null; role: string },
    search?: string
  ): Promise<any[]> {
    const isSuper = userContext.role === 'Super Admin' || userContext.role === 'Super Administrator';
    const companyId = isSuper ? undefined : (userContext.companyId && userContext.companyId.trim() ? userContext.companyId.trim() : undefined);
    const branchId = isSuper || userContext.role === 'Company' ? null : (userContext.branchId && userContext.branchId.trim() ? userContext.branchId.trim() : null);

    const clients = await this.clientRepo.findAll(companyId, branchId, search);

    // Populate computed statistics (leads count, projects count, contract value)
    const result = await Promise.all(
      clients.map(async (c) => {
        const leads = await this.clientRepo.findLeadsByClientId(c.id, c.clientName || c.company);
        const projects = await this.clientRepo.findProjectsByClientId(c.id, c.clientName || c.company);

        const totalContractValue = leads.reduce((sum, l) => {
          const val = parseFloat(String(l.estimatedBudget || '').replace(/[^0-9.]/g, '')) || 0;
          return sum + val;
        }, 0);

        const activeLeadsCount = leads.filter(l => (l.status || '').toLowerCase() !== 'won' && (l.status || '').toLowerCase() !== 'lost').length;
        const wonLeadsCount = leads.filter(l => (l.status || '').toLowerCase() === 'won').length;

        return {
          ...c,
          leadsCount: leads.length,
          activeLeadsCount,
          wonLeadsCount,
          projectsCount: projects.length,
          totalContractValue,
          leads: leads.map(l => ({
            id: l.id,
            leadId: l.leadId,
            leadTitle: l.leadTitle || l.clientName,
            status: l.status,
            projectType: l.projectType,
            estimatedBudget: l.estimatedBudget,
            createdAt: l.createdAt
          })),
          projects: projects.map(p => ({
            id: p.id,
            projectCode: p.projectCode,
            projectName: p.projectName,
            status: p.status,
            createdAt: p.createdAt
          }))
        };
      })
    );

    return result;
  }

  async getClientById(id: string): Promise<any> {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found.`);
    }

    const leads = await this.clientRepo.findLeadsByClientId(client.id, client.clientName || client.company);
    const projects = await this.clientRepo.findProjectsByClientId(client.id, client.clientName || client.company);

    const totalContractValue = leads.reduce((sum, l) => {
      const val = parseFloat(String(l.estimatedBudget || '').replace(/[^0-9.]/g, '')) || 0;
      return sum + val;
    }, 0);

    return {
      ...client,
      leadsCount: leads.length,
      projectsCount: projects.length,
      totalContractValue,
      leads,
      projects
    };
  }

  async createClient(
    data: Partial<ClientModel>,
    userContext: { companyId: string; branchId: string | null; role: string; userId: string }
  ): Promise<ClientModel> {
    if (!data.clientName || !data.clientName.trim()) {
      throw new Error('Client Name is required.');
    }
    if (data.clientName.trim().length < 2 || data.clientName.trim().length > 100) {
      throw new Error('Client Name must be between 2 and 100 characters.');
    }
    if (data.company && (data.company.trim().length < 2 || data.company.trim().length > 150)) {
      throw new Error('Company name must be between 2 and 150 characters.');
    }
    if (data.contactPerson && (data.contactPerson.trim().length < 2 || data.contactPerson.trim().length > 100)) {
      throw new Error('Contact person name must be between 2 and 100 characters.');
    }
    if (!data.mobile || !data.mobile.trim()) {
      throw new Error('Mobile number is required.');
    }
    const cleanMobileDigits = data.mobile.replace(/\D/g, '');
    if (cleanMobileDigits.length !== 10) {
      throw new Error('Mobile number must be a valid 10-digit number.');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('Email address is required.');
    }
    if (data.email.trim().length < 5 || data.email.trim().length > 100) {
      throw new Error('Email address must be between 5 and 100 characters.');
    }
    if (!data.address || !data.address.trim()) {
      throw new Error('Address is required.');
    }
    if (data.address.trim().length < 5 || data.address.trim().length > 250) {
      throw new Error('Address must be between 5 and 250 characters.');
    }
    if (!data.city || !data.city.trim()) {
      throw new Error('City is required.');
    }
    if (data.city.trim().length < 2 || data.city.trim().length > 60) {
      throw new Error('City must be between 2 and 60 characters.');
    }
    if (!data.state || !data.state.trim()) {
      throw new Error('State is required.');
    }
    if (data.state.trim().length < 2 || data.state.trim().length > 60) {
      throw new Error('State must be between 2 and 60 characters.');
    }
    if (data.gstNo && data.gstNo.trim() && data.gstNo.trim().length !== 15) {
      throw new Error('GST number must be 15 characters.');
    }
    if (data.panNo && data.panNo.trim() && data.panNo.trim().length !== 10) {
      throw new Error('PAN number must be 10 characters.');
    }
    if (data.aadharNo && data.aadharNo.trim()) {
      const aadharDigits = data.aadharNo.replace(/\D/g, '');
      if (aadharDigits.length !== 12) {
        throw new Error('Aadhar number must be 12 digits.');
      }
    }
    if (data.remarks && data.remarks.length > 250) {
      throw new Error('Remarks cannot exceed 250 characters.');
    }

    const scopedCompanyId = data.companyId || userContext.companyId;
    const scopedBranchId = data.branchId !== undefined ? data.branchId : userContext.branchId;

    // Check if client with this mobile number already exists
    const cleanMobile = data.mobile.trim();
    const existingClientWithMobile = await this.clientRepo.findByMobile(cleanMobile, scopedCompanyId);
    if (existingClientWithMobile) {
      throw new Error(`A client with mobile number "${cleanMobile}" already exists in the system (${existingClientWithMobile.clientName} - ${existingClientWithMobile.clientCode || 'Existing'}).`);
    }

    // Generate clientCode if not provided (e.g. CL-2026-001)
    let clientCode = data.clientCode;
    if (!clientCode) {
      const total = await this.clientRepo.countClients(scopedCompanyId);
      const year = new Date().getFullYear();
      const seq = String(total + 1).padStart(3, '0');
      clientCode = `CL-${year}-${seq}`;
    }

    const newClient = await this.clientRepo.create({
      ...data,
      clientCode,
      companyId: scopedCompanyId,
      branchId: scopedBranchId,
      status: data.status || 'Active',
      clientType: data.clientType || 'Corporate'
    });

    return newClient;
  }

  async updateClient(
    id: string,
    data: Partial<ClientModel>,
    userContext: { companyId: string; role: string }
  ): Promise<ClientModel> {
    const existing = await this.clientRepo.findById(id);
    if (!existing) {
      throw new Error(`Client with ID ${id} not found.`);
    }

    if (data.clientName && (data.clientName.trim().length < 2 || data.clientName.trim().length > 100)) {
      throw new Error('Client Name must be between 2 and 100 characters.');
    }
    if (data.company && (data.company.trim().length < 2 || data.company.trim().length > 150)) {
      throw new Error('Company name must be between 2 and 150 characters.');
    }
    if (data.contactPerson && (data.contactPerson.trim().length < 2 || data.contactPerson.trim().length > 100)) {
      throw new Error('Contact person name must be between 2 and 100 characters.');
    }
    if (data.email && (data.email.trim().length < 5 || data.email.trim().length > 100)) {
      throw new Error('Email address must be between 5 and 100 characters.');
    }
    if (data.address && (data.address.trim().length < 5 || data.address.trim().length > 250)) {
      throw new Error('Address must be between 5 and 250 characters.');
    }
    if (data.city && (data.city.trim().length < 2 || data.city.trim().length > 60)) {
      throw new Error('City must be between 2 and 60 characters.');
    }
    if (data.state && (data.state.trim().length < 2 || data.state.trim().length > 60)) {
      throw new Error('State must be between 2 and 60 characters.');
    }
    if (data.gstNo && data.gstNo.trim() && data.gstNo.trim().length !== 15) {
      throw new Error('GST number must be 15 characters.');
    }
    if (data.panNo && data.panNo.trim() && data.panNo.trim().length !== 10) {
      throw new Error('PAN number must be 10 characters.');
    }
    if (data.aadharNo && data.aadharNo.trim()) {
      const aadharDigits = data.aadharNo.replace(/\D/g, '');
      if (aadharDigits.length !== 12) {
        throw new Error('Aadhar number must be 12 digits.');
      }
    }
    if (data.remarks && data.remarks.length > 250) {
      throw new Error('Remarks cannot exceed 250 characters.');
    }

    if (data.mobile && data.mobile.trim() && data.mobile.trim() !== existing.mobile) {
      const cleanMobileDigits = data.mobile.replace(/\D/g, '');
      if (cleanMobileDigits.length !== 10) {
        throw new Error('Mobile number must be a valid 10-digit number.');
      }
      const duplicate = await this.clientRepo.findByMobile(data.mobile.trim(), userContext.companyId);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`A client with mobile number "${data.mobile.trim()}" already exists in the system (${duplicate.clientName} - ${duplicate.clientCode || 'Existing'}).`);
      }
    }

    const updated = await this.clientRepo.update(id, data);
    return updated!;
  }

  async deleteClient(id: string): Promise<boolean> {
    const existing = await this.clientRepo.findById(id);
    if (!existing) {
      throw new Error(`Client with ID ${id} not found.`);
    }
    return await this.clientRepo.delete(id);
  }

  async getClientLeads(id: string) {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found.`);
    }
    return await this.clientRepo.findLeadsByClientId(client.id, client.clientName || client.company);
  }

  async getClientProjects(id: string) {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found.`);
    }
    return await this.clientRepo.findProjectsByClientId(client.id, client.clientName || client.company);
  }
}
