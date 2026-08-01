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

  private checkAdminRole(userRole: string, actionName: string) {
    const allowed = ['Company', 'Super Admin', 'Admin', 'Manager'];
    if (!allowed.includes(userRole)) {
      throw new Error(`Unauthorized: Only Company Admin, Super Admin, or Admin can ${actionName}.`);
    }
  }

  async createCategory(data: { name: string; code?: string; description?: string }, userRole: string) {
    this.checkAdminRole(userRole, 'create project categories');

    if (!data.name || !data.name.trim()) {
      throw new Error('Category name is required.');
    }
    
    // Generate uppercase code if not provided
    let code = data.code && data.code.trim() 
      ? data.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') 
      : data.name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    code = code.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (!code) {
      code = `CAT_${Date.now().toString().slice(-4)}`;
    }

    const existing = await this.leadRepository.findCategoryByCode(code);
    if (existing) {
      code = `${code}_${Date.now().toString().slice(-4)}`;
    }

    return await this.leadRepository.createCategory({
      name: data.name.trim(),
      code,
      description: data.description?.trim() || ''
    });
  }

  async updateCategory(id: number, data: { name?: string; code?: string; description?: string }, userRole: string) {
    this.checkAdminRole(userRole, 'edit project categories');

    const updatePayload: Partial<{ name: string; code: string; description: string }> = {};

    if (data.name !== undefined && data.name.trim()) {
      updatePayload.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updatePayload.description = data.description.trim();
    }
    if (data.code !== undefined && data.code.trim()) {
      let cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      if (cleanCode) {
        const existing = await this.leadRepository.findCategoryByCode(cleanCode);
        if (existing && existing.id !== id) {
          throw new Error(`Category code '${cleanCode}' is already in use by another category.`);
        }
        updatePayload.code = cleanCode;
      }
    }

    return await this.leadRepository.updateCategory(id, updatePayload);
  }

  async deleteCategory(id: number, userRole: string) {
    this.checkAdminRole(userRole, 'delete project categories');
    return await this.leadRepository.deleteCategory(id);
  }

  async getTemplateFields(categoryId: number) {
    const category = await this.leadRepository.findCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found.`);
    }
    return await this.leadRepository.findTemplateFieldsByCategoryId(categoryId);
  }

  async createTemplateField(
    data: {
      categoryId: number;
      fieldName: string;
      fieldKey?: string;
      fieldType: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment';
      fieldOptions?: string[];
      section: string;
      capturedAtStage?: 'Lead' | 'Requirement Collection' | 'Client Brief';
      isRequired?: boolean;
      displayOrder?: number;
    },
    userRole: string
  ) {
    this.checkAdminRole(userRole, 'add lead questions');
    if (!data.categoryId) {
      throw new Error('Category ID is required.');
    }
    if (!data.fieldName || !data.fieldName.trim()) {
      throw new Error('Question / Field Name is required.');
    }
    if (!data.section || !data.section.trim()) {
      throw new Error('Section name is required.');
    }

    const category = await this.leadRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${data.categoryId} not found.`);
    }

    // Auto-generate camelCase fieldKey if not explicitly specified
    let fieldKey = data.fieldKey ? data.fieldKey.trim() : data.fieldName.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
    if (!fieldKey) fieldKey = `custom_${Date.now()}`;

    const existingFields = await this.leadRepository.findTemplateFieldsByCategoryId(data.categoryId);
    if (existingFields.some(f => f.fieldKey === fieldKey)) {
      fieldKey = `${fieldKey}_${Date.now().toString().slice(-4)}`;
    }

    return await this.leadRepository.createTemplateField({
      categoryId: data.categoryId,
      fieldKey,
      fieldName: data.fieldName.trim(),
      fieldType: data.fieldType || 'text',
      fieldOptions: data.fieldOptions || [],
      section: data.section.trim(),
      capturedAtStage: data.capturedAtStage || 'Requirement Collection',
      isRequired: !!data.isRequired,
      displayOrder: data.displayOrder ?? (existingFields.length + 1)
    });
  }

  async updateTemplateField(
    id: number,
    data: {
      fieldName?: string;
      fieldType?: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment';
      fieldOptions?: string[];
      section?: string;
      capturedAtStage?: 'Lead' | 'Requirement Collection' | 'Client Brief';
      isRequired?: boolean;
      displayOrder?: number;
    },
    userRole: string
  ) {
    this.checkAdminRole(userRole, 'edit lead questions');
    return await this.leadRepository.updateTemplateField(id, data);
  }

  async deleteTemplateField(id: number, userRole: string) {
    this.checkAdminRole(userRole, 'delete lead questions');
    return await this.leadRepository.deleteTemplateField(id);
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
      'assignedEmployee', 'branch', 'branchId', 'remarks', 'status', 'attachments',
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
