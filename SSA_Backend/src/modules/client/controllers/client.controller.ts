import { NextRequest, NextResponse } from 'next/server';
import { ClientService } from '../services/client.service';

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  async getAllClients(req: NextRequest, user: any) {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || undefined;

      const clients = await this.clientService.getAllClients(
        {
          companyId: user.companyId || '',
          branchId: user.branchId || null,
          role: user.role
        },
        search
      );
      return NextResponse.json({ success: true, data: clients });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getClientById(req: NextRequest, id: string) {
    try {
      const client = await this.clientService.getClientById(id);
      return NextResponse.json({ success: true, data: client });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async createClient(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      const client = await this.clientService.createClient(body, {
        companyId: user.companyId || '',
        branchId: user.branchId || null,
        role: user.role,
        userId: user.userId || ''
      });
      return NextResponse.json({ success: true, data: client, message: 'Client created successfully.' }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
  }

  async updateClient(req: NextRequest, id: string, user: any) {
    try {
      const body = await req.json();
      const updated = await this.clientService.updateClient(id, body, {
        companyId: user.companyId || '',
        role: user.role
      });
      return NextResponse.json({ success: true, data: updated, message: 'Client updated successfully.' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async deleteClient(req: NextRequest, id: string, user: any) {
    try {
      await this.clientService.deleteClient(id);
      return NextResponse.json({ success: true, message: 'Client deleted successfully.' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async getClientLeads(req: NextRequest, id: string) {
    try {
      const leads = await this.clientService.getClientLeads(id);
      return NextResponse.json({ success: true, data: leads });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }

  async getClientProjects(req: NextRequest, id: string) {
    try {
      const projects = await this.clientService.getClientProjects(id);
      return NextResponse.json({ success: true, data: projects });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return NextResponse.json({ success: false, message: err.message }, { status });
    }
  }
}
