import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '../services/lead.service';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  async getCategories(req: NextRequest) {
    try {
      const categories = await this.leadService.getCategories();
      return NextResponse.json({ success: true, data: categories });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async createCategory(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      const category = await this.leadService.createCategory(body, user.role);
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async updateCategory(req: NextRequest, id: number, user: any) {
    try {
      const body = await req.json();
      const category = await this.leadService.updateCategory(id, body, user.role);
      return NextResponse.json({ success: true, data: category });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async deleteCategory(req: NextRequest, id: number, user: any) {
    try {
      await this.leadService.deleteCategory(id, user.role);
      return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async getTemplateFields(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const categoryIdStr = searchParams.get('categoryId');
      if (!categoryIdStr) {
        return NextResponse.json({ success: false, message: 'categoryId query parameter is required.' }, { status: 400 });
      }
      const categoryId = parseInt(categoryIdStr, 10);
      if (isNaN(categoryId)) {
        return NextResponse.json({ success: false, message: 'Invalid categoryId.' }, { status: 400 });
      }

      const fields = await this.leadService.getTemplateFields(categoryId);
      return NextResponse.json({ success: true, data: fields });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async createTemplateField(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      const field = await this.leadService.createTemplateField(body, user.role);
      return NextResponse.json({ success: true, data: field }, { status: 201 });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async updateTemplateField(req: NextRequest, id: number, user: any) {
    try {
      const body = await req.json();
      const field = await this.leadService.updateTemplateField(id, body, user.role);
      return NextResponse.json({ success: true, data: field });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async deleteTemplateField(req: NextRequest, id: number, user: any) {
    try {
      await this.leadService.deleteTemplateField(id, user.role);
      return NextResponse.json({ success: true, message: 'Question deleted successfully.' });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async createLead(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      const { categoryValues, ...leadData } = body;

      // Extract context details from authenticated user
      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role,
        userId: user.userId || user.companyId || user.branchId || 'system'
      };

      const result = await this.leadService.createLead(leadData, categoryValues || {}, userContext);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
  }

  async getAllLeads(req: NextRequest, user: any) {
    try {
      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role
      };

      const leads = await this.leadService.getAllLeads(userContext);
      return NextResponse.json({ success: true, data: leads });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getLeadById(req: NextRequest, id: number, user: any) {
    try {
      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role
      };

      const lead = await this.leadService.getLeadById(id, userContext);
      return NextResponse.json({ success: true, data: lead });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async updateLead(req: NextRequest, id: number, user: any) {
    try {
      const body = await req.json();
      const { categoryValues, ...leadData } = body;

      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role
      };

      const result = await this.leadService.updateLead(id, leadData, categoryValues || {}, userContext);
      return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : err.message.includes('not found') ? 404 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async getLeadDeliverables(req: NextRequest, id: number, user: any) {
    try {
      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role
      };

      const deliverables = await this.leadService.getLeadDeliverables(id, userContext);
      return NextResponse.json({ success: true, data: deliverables });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async deleteLead(req: NextRequest, id: number, user: any) {
    try {
      const userContext = {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role
      };

      await this.leadService.deleteLead(id, userContext);
      return NextResponse.json({ success: true, message: 'Lead deleted successfully.' });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }
}
