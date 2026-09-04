import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  private projectService = new ProjectService();

  async getProjects(req: NextRequest, user: any) {
    try {
      const projects = await this.projectService.getAllProjects();
      return NextResponse.json({ success: true, data: projects });
    } catch (err: any) {
      console.error('[ProjectController] getProjects error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async createProject(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      if (!body.projectName) {
        return NextResponse.json({ success: false, message: 'Project Name is required.' }, { status: 400 });
      }
      const project = await this.projectService.createProject(body);
      return NextResponse.json({ success: true, data: project });
    } catch (err: any) {
      console.error('[ProjectController] createProject error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getProjectById(req: NextRequest, projectId: string, user: any) {
    try {
      const project = await this.projectService.getProjectById(projectId);
      if (!project) {
        return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: project });
    } catch (err: any) {
      console.error('[ProjectController] getProjectById error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getAllDisciplines(req: NextRequest, user: any) {
    try {
      const disciplines = await this.projectService.getAllDisciplines();
      return NextResponse.json({ success: true, data: disciplines });
    } catch (err: any) {
      console.error('[ProjectController] getAllDisciplines error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async createDiscipline(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      if (!body.code || !body.name) {
        return NextResponse.json({ success: false, message: 'Discipline Code and Name are required.' }, { status: 400 });
      }
      const created = await this.projectService.createDisciplineMaster(body);
      return NextResponse.json({ success: true, data: created });
    } catch (err: any) {
      console.error('[ProjectController] createDiscipline error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async addProjectDiscipline(req: NextRequest, projectId: string, user: any) {
    try {
      const body = await req.json();
      if (!body.disciplineCode) {
        return NextResponse.json({ success: false, message: 'Discipline Code is required.' }, { status: 400 });
      }
      const updatedProject = await this.projectService.addProjectDiscipline(projectId, body.disciplineCode);
      return NextResponse.json({ success: true, data: updatedProject });
    } catch (err: any) {
      console.error('[ProjectController] addProjectDiscipline error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async deleteProjectDiscipline(req: NextRequest, projectId: string, disciplineCode: string, user: any) {
    try {
      const updatedProject = await this.projectService.deleteProjectDiscipline(projectId, disciplineCode);
      return NextResponse.json({ success: true, data: updatedProject });
    } catch (err: any) {
      console.error('[ProjectController] deleteProjectDiscipline error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getProjectDrawings(req: NextRequest, projectId: string, user: any) {
    try {
      const { searchParams } = new URL(req.url);
      const disciplineCode = searchParams.get('discipline') || undefined;
      const drawings = await this.projectService.getProjectDrawings(projectId, disciplineCode);
      return NextResponse.json({ success: true, data: drawings });
    } catch (err: any) {
      console.error('[ProjectController] getProjectDrawings error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getDrawingDetails(req: NextRequest, drawingId: string, user: any) {
    try {
      const drawing = await this.projectService.getDrawingDetails(drawingId);
      return NextResponse.json({ success: true, data: drawing });
    } catch (err: any) {
      console.error('[ProjectController] getDrawingDetails error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async addDrawingRevision(req: NextRequest, drawingId: string, user: any) {
    try {
      const body = await req.json();
      const updatedDrawing = await this.projectService.addDrawingRevision({
        drawingId,
        ...body,
        uploadedBy: user?.email || user?.name || 'User'
      });
      return NextResponse.json({ success: true, data: updatedDrawing });
    } catch (err: any) {
      console.error('[ProjectController] addDrawingRevision error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async getDrawingTypes(req: NextRequest, user: any) {
    try {
      const { searchParams } = new URL(req.url);
      const disciplineCode = searchParams.get('discipline') || undefined;
      const types = await this.projectService.getDrawingTypes(disciplineCode);
      return NextResponse.json({ success: true, data: types });
    } catch (err: any) {
      console.error('[ProjectController] getDrawingTypes error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  async saveDrawingType(req: NextRequest, user: any) {
    try {
      const body = await req.json();
      const dt = await this.projectService.saveDrawingType(body);
      return NextResponse.json({ success: true, data: dt });
    } catch (err: any) {
      console.error('[ProjectController] saveDrawingType error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }
}
