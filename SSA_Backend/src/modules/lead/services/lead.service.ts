import { LeadRepository } from '../repositories/lead.repository';
import { LeadModel } from '../models/lead.model';

export class LeadService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  async getCategories() {
    return await this.leadRepository.findAllCategories();
  }

  async getTemplateFields(categoryId: number) {
    const category = await this.leadRepository.findCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found.`);
    }
    return await this.leadRepository.findTemplateFieldsByCategoryId(categoryId);
  }

  async createLead(
    leadData: Partial<LeadModel>, 
    requirementValues: Record<string, any>,
    userContext: { companyId: string; branchId: string | null; role: string; userId: string }
  ): Promise<any> {
    if (!leadData.clientName) {
      throw new Error('Client Name is required.');
    }
    if (!leadData.categoryId) {
      throw new Error('Project Category ID is required.');
    }

    // Enforce company scope based on token
    let scopedCompanyId = userContext.companyId;
    let scopedBranchId = userContext.branchId;

    if (userContext.role === 'Super Admin' || userContext.role === 'Employee' || userContext.role === 'Company') {
      // If admin/employee/company, allow custom payload scoping
      scopedCompanyId = leadData.companyId || userContext.companyId;
      scopedBranchId = leadData.branchId !== undefined ? leadData.branchId : userContext.branchId;
    }

    const category = await this.leadRepository.findCategoryById(leadData.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${leadData.categoryId} not found.`);
    }

    const templateFields = await this.leadRepository.findTemplateFieldsByCategoryId(leadData.categoryId);

    // Validate category-specific required fields (skip if saving as Draft)
    if (leadData.status !== 'Draft') {
      for (const field of templateFields) {
        if (field.isRequired && (requirementValues[field.fieldKey] === undefined || requirementValues[field.fieldKey] === null || requirementValues[field.fieldKey] === '')) {
          throw new Error(`Field '${field.fieldName}' is required for ${category.name} projects.`);
        }
      }
    }

    // Generate unique sequential leadId
    const leadId = await this.leadRepository.getNextLeadId();

    leadData.leadId = leadId;
    leadData.companyId = scopedCompanyId;
    leadData.branchId = scopedBranchId;
    leadData.createdBy = userContext.userId;
    leadData.status = leadData.status || 'Lead';

    const lead = await this.leadRepository.createLead(leadData);

    // Save category-specific values
    let savedValues: any[] = [];
    if (requirementValues && Object.keys(requirementValues).length > 0) {
      // Filter values to only save known template fields
      const cleanValues: Record<string, any> = {};
      for (const field of templateFields) {
        if (requirementValues[field.fieldKey] !== undefined) {
          cleanValues[field.fieldKey] = requirementValues[field.fieldKey];
        }
      }
      savedValues = await this.leadRepository.saveRequirementValues(lead.id, cleanValues);
    }

    // Auto-generate deliverables checklist (Common + Category Specific)
    let deliverables: any[] = [];
    try {
      const templates = await this.leadRepository.findDeliverableTemplatesByCategoryId(lead.categoryId);
      if (templates.length > 0) {
        const leadDeliverables = templates.map(t => ({
          leadId: lead.id,
          templateId: t.id,
          phase: t.phase,
          deliverableName: t.deliverableName,
          discipline: t.discipline,
          status: 'Pending' as const
        }));
        deliverables = await this.leadRepository.createLeadDeliverables(leadDeliverables);
        console.log(`[LeadService] Auto-generated ${deliverables.length} deliverables for Lead ${lead.leadId}`);
      }
    } catch (err: any) {
      console.error('[LeadService] Failed to auto-generate deliverables checklist:', err.message);
    }

    return {
      ...lead,
      categoryValues: savedValues.reduce((acc, curr) => {
        acc[curr.fieldKey] = curr.value;
        return acc;
      }, {} as Record<string, any>),
      deliverablesCount: deliverables.length
    };
  }

  async getAllLeads(userContext: { companyId: string; branchId: string | null; role: string }): Promise<any[]> {
    const leads = await this.leadRepository.findAllLeads(userContext.companyId, userContext.branchId, userContext.role);
    
    // Merge category values into each lead record for easy frontend consumption
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const values = await this.leadRepository.findRequirementValuesByLeadId(lead.id);
        const categoryValues = values.reduce((acc, curr) => {
          acc[curr.fieldKey] = curr.value;
          return acc;
        }, {} as Record<string, any>);

        return {
          ...lead,
          categoryValues
        };
      })
    );
    return enrichedLeads;
  }

  async getLeadById(id: number, userContext: { companyId: string; branchId: string | null; role: string }): Promise<any> {
    const lead = await this.leadRepository.findLeadById(id);
    if (!lead) {
      throw new Error('Lead not found.');
    }

    // Verify company/branch permissions
    if (userContext.role !== 'Super Admin' && userContext.role !== 'Employee') {
      if (lead.companyId !== userContext.companyId) {
        throw new Error('Unauthorized to view this lead.');
      }
      if (userContext.role === 'Branch' && userContext.branchId && lead.branchId !== userContext.branchId) {
        throw new Error('Unauthorized to view this lead.');
      }
    }

    const values = await this.leadRepository.findRequirementValuesByLeadId(lead.id);
    const categoryValues = values.reduce((acc, curr) => {
      acc[curr.fieldKey] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    return {
      ...lead,
      categoryValues
    };
  }

  async updateLead(
    id: number, 
    leadData: Partial<LeadModel>, 
    requirementValues: Record<string, any>,
    userContext: { companyId: string; branchId: string | null; role: string }
  ): Promise<any> {
    const lead = await this.leadRepository.findLeadById(id);
    if (!lead) {
      throw new Error('Lead not found.');
    }

    // Verify permissions
    if (userContext.role !== 'Super Admin' && userContext.role !== 'Employee') {
      if (lead.companyId !== userContext.companyId) {
        throw new Error('Unauthorized to modify this lead.');
      }
      if (userContext.role === 'Branch' && userContext.branchId && lead.branchId !== userContext.branchId) {
        throw new Error('Unauthorized to modify this lead.');
      }
    }

    // Update properties dynamically (excluding read-only fields)
    const mutableFields = [
      // Lead / client identification
      'clientName', 'leadTitle', 'company', 'contactPerson', 'email', 'mobile',
      'organisation', 'leadSource', 'decisionMakers', 'priorProjectsWithSSA',
      // Project classification
      'projectType', 'projectSubType', 'leadCategory', 'subType', 'buildType',
      // Site location
      'siteAddress', 'locationAddress', 'city', 'state', 'country',
      'surveyNumber', 'siteArea', 'unit', 'siteExtent',
      // Site details
      'landOwnershipDocsAvailable', 'topographyLevels', 'accessRoadWidth',
      'orientation', 'existingStructures', 'soilReportAvailable', 'adjacentDevelopments',
      // Utilities
      'ebSupplySanctionedLoad', 'waterSource', 'sewerSeptic', 'stormDrainage', 'telecom',
      // Regulatory
      'approvingAuthority', 'landUseZoning', 'fsiCoverageKnown', 'setbacksHeightRestrictions',
      'priorApprovalsViolations', 'specialRestrictions',
      // Project basics / budget
      'projectName', 'expectedBuiltUpArea', 'expectedFloors',
      'budgetRange', 'estimatedBudget', 'timelineExpectation',
      'expectedStartDate', 'expectedCompletionDate',
      'fundingSource', 'phasingNeeds', 'servicesRequired',
      // Execution
      'contractorStatus', 'preferredVendors', 'siteVisitFrequencyExpectation', 'reportingExpectations',
      // Design preferences
      'styleReferencesInspiration', 'sustainabilityGoals', 'vaastuOrientationRequirements', 'materialPreferences',
      // Assignment & status
      'assignedEmployee', 'branch', 'branchId', 'remarks', 'status',
    ];

    for (const key of mutableFields) {
      if ((leadData as any)[key] !== undefined) {
        (lead as any)[key] = (leadData as any)[key];
      }
    }

    // Save lead core
    const updatedLead = await this.leadRepository.createLead(lead);

    // Save/update requirement values if provided
    let savedValues: any[] = [];
    if (requirementValues && Object.keys(requirementValues).length > 0) {
      const templateFields = await this.leadRepository.findTemplateFieldsByCategoryId(lead.categoryId);
      const cleanValues: Record<string, any> = {};
      for (const field of templateFields) {
        if (requirementValues[field.fieldKey] !== undefined) {
          cleanValues[field.fieldKey] = requirementValues[field.fieldKey];
        }
      }
      savedValues = await this.leadRepository.saveRequirementValues(lead.id, cleanValues);
    } else {
      savedValues = await this.leadRepository.findRequirementValuesByLeadId(lead.id);
    }

    return {
      ...updatedLead,
      categoryValues: savedValues.reduce((acc, curr) => {
        acc[curr.fieldKey] = curr.value;
        return acc;
      }, {} as Record<string, any>)
    };
  }

  async getLeadDeliverables(leadId: number, userContext: { companyId: string; branchId: string | null; role: string }) {
    const lead = await this.leadRepository.findLeadById(leadId);
    if (!lead) {
      throw new Error('Lead not found.');
    }

    // Verify company/branch permissions
    if (userContext.role !== 'Super Admin' && userContext.role !== 'Employee') {
      if (lead.companyId !== userContext.companyId) {
        throw new Error('Unauthorized to view deliverables for this lead.');
      }
      if (userContext.role === 'Branch' && userContext.branchId && lead.branchId !== userContext.branchId) {
        throw new Error('Unauthorized to view deliverables for this lead.');
      }
    }

    return await this.leadRepository.findDeliverablesByLeadId(leadId);
  }

  async deleteLead(id: number, userContext: { companyId: string; branchId: string | null; role: string }): Promise<void> {
    const lead = await this.leadRepository.findLeadById(id);
    if (!lead) {
      throw new Error('Lead not found.');
    }

    // Verify permissions
    if (userContext.role !== 'Super Admin' && userContext.role !== 'Employee') {
      if (lead.companyId !== userContext.companyId) {
        throw new Error('Unauthorized to delete this lead.');
      }
      if (userContext.role === 'Branch' && userContext.branchId && lead.branchId !== userContext.branchId) {
        throw new Error('Unauthorized to delete this lead.');
      }
    }

    await this.leadRepository.deleteLead(id);
  }
}
