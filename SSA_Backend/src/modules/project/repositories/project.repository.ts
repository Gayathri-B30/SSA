import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/data-source';
import {
  ProjectModel,
  DisciplineModel,
  ProjectDisciplineModel,
  DrawingTypeModel,
  DrawingModel,
  DrawingRevisionModel,
  DrawingFileModel,
  FolderModel,
  ProjectFileModel
} from '../models';

export class ProjectRepository {
  private projectRepo(): Repository<ProjectModel> {
    return AppDataSource.getRepository(ProjectModel);
  }

  private disciplineRepo(): Repository<DisciplineModel> {
    return AppDataSource.getRepository(DisciplineModel);
  }

  private projectDisciplineRepo(): Repository<ProjectDisciplineModel> {
    return AppDataSource.getRepository(ProjectDisciplineModel);
  }

  private drawingTypeRepo(): Repository<DrawingTypeModel> {
    return AppDataSource.getRepository(DrawingTypeModel);
  }

  private drawingRepo(): Repository<DrawingModel> {
    return AppDataSource.getRepository(DrawingModel);
  }

  private drawingRevisionRepo(): Repository<DrawingRevisionModel> {
    return AppDataSource.getRepository(DrawingRevisionModel);
  }

  private drawingFileRepo(): Repository<DrawingFileModel> {
    return AppDataSource.getRepository(DrawingFileModel);
  }

  private folderRepo(): Repository<FolderModel> {
    return AppDataSource.getRepository(FolderModel);
  }

  private projectFileRepo(): Repository<ProjectFileModel> {
    return AppDataSource.getRepository(ProjectFileModel);
  }

  // --- PROJECTS ---
  async getNextProjectSequence(prefix: string, year: number): Promise<number> {
    const repo = this.projectRepo();
    const count = await repo.count({ where: { projectPrefix: prefix, year } });
    return count + 1;
  }

  async createProject(projectData: Partial<ProjectModel>): Promise<ProjectModel> {
    const repo = this.projectRepo();
    const project = repo.create(projectData);
    return await repo.save(project);
  }

  async findAllProjects(): Promise<ProjectModel[]> {
    return await this.projectRepo().find({ order: { createdAt: 'DESC' } });
  }

  async findProjectById(id: string): Promise<ProjectModel | null> {
    return await this.projectRepo().findOne({ where: { id } });
  }

  async findProjectByCode(projectCode: string): Promise<ProjectModel | null> {
    return await this.projectRepo().findOne({ where: { projectCode } });
  }

  // --- DISCIPLINES ---
  getDisciplineRepository(): Repository<DisciplineModel> {
    return this.disciplineRepo();
  }

  async findAllDisciplines(): Promise<DisciplineModel[]> {
    return await this.disciplineRepo().find({ order: { sequenceOrder: 'ASC' } });
  }

  async seedDefaultDisciplines(): Promise<DisciplineModel[]> {
    const repo = this.disciplineRepo();
    const existing = await repo.find();
    if (existing.length > 0) return existing;

    const defaultDisciplines = [
      { code: 'PI', name: 'PROJECT INFORMATION', sequenceOrder: 1, description: 'Project brief, client details, charter, key contacts, milestones' },
      { code: 'SI', name: 'SITE INFORMATION', sequenceOrder: 2, description: 'Survey drawings, soil test reports, site photos, boundary & contour data' },
      { code: 'AR', name: 'ARCHITECTURAL DRAWINGS', sequenceOrder: 3, description: 'Base architectural plans, sections, elevations, schedules, scheme & working drawings' },
      { code: 'IN', name: 'INTERIOR', sequenceOrder: 4, description: 'Furniture layouts, flooring, RCP ceilings, millwork, FF&E schedules' },
      { code: 'ST', name: 'STRUCTURAL', sequenceOrder: 5, description: 'Columns, footings, tie beams, slab rebar, BBS, structural notes' },
      { code: 'MEP', name: 'MEP & OTHER SERVICE DRAWINGS', sequenceOrder: 6, description: 'Combined MEP & Services (Electrical, Plumbing, Fire Fighting, HVAC, ELV, Gas, Transport)' },
      { code: 'BQ', name: 'BOQ & ESTIMATION', sequenceOrder: 7, description: 'Bill of quantities, cost estimates, rate analysis, material quantity takeoffs' },
      { code: 'TD', name: 'TENDER DOCUMENTS', sequenceOrder: 8, description: 'NIT, tender drawings, conditions of contract, specifications, addenda' },
      { code: 'CR', name: 'CONSTRUCTION REPORTS', sequenceOrder: 9, description: 'Daily Progress Reports (DPR), weekly/monthly reports, QA/QC checklists, site logs' },
      { code: 'SA', name: 'SUBMITTAL APPROVALS', sequenceOrder: 10, description: 'Material submittals, technical data sheets, sample approvals, shop drawings' },
      { code: 'TQ', name: 'TECHNICAL QUERIES', sequenceOrder: 11, description: 'Technical Queries (RFIs), consultant clarifications & site instructions' },
      { code: 'MC', name: 'MEETING CORRESPONDENCE', sequenceOrder: 12, description: 'Minutes of Meetings (MOM), client/consultant letters, official correspondence' },
      { code: 'PS', name: 'PROJECT SCHEDULE', sequenceOrder: 13, description: 'Master baseline schedule, look-ahead plans, milestone tracking, delay analysis' },
      { code: 'CA', name: 'COST ACCOUNTS', sequenceOrder: 14, description: 'RA bills, contractor payment certificates, variations, extra item claims, cashflows' },
      { code: 'AP', name: 'STATUTORY APPROVALS', sequenceOrder: 15, description: 'Building sanctions, fire NOC, environmental clearance, local authority permits' },
      { code: 'TC', name: 'TESTING & COMMISSIONING', sequenceOrder: 16, description: 'Pre-commissioning checklists, hydro testing, MEP test reports, snag lists' },
      { code: 'HO', name: 'HANDOVER', sequenceOrder: 17, description: 'As-built drawings, O&M manuals, warranty certificates, completion certificates' },
      // Sub-Disciplines under MEP
      { code: 'EL', name: 'Electrical (MEP)', sequenceOrder: 18, description: 'SLD, power, lighting, panel schedules, cable trays, DG/UPS' },
      { code: 'PL', name: 'Plumbing (MEP)', sequenceOrder: 19, description: 'Water supply, drainage, storm water, pump room, STP/WTP' },
      { code: 'FF', name: 'Fire Fighting (MEP)', sequenceOrder: 20, description: 'Sprinklers, hydrants, hose reels, fire pumps, static storage' },
      { code: 'HV', name: 'HVAC (MEP)', sequenceOrder: 21, description: 'Chillers/AHUs, ducts, chilled water, VRF, OT ventilation' },
      { code: 'MG', name: 'Medical Gas (MEP)', sequenceOrder: 22, description: 'Manifold room, pipeline routing, bed outlets, zone valves' },
      { code: 'LV', name: 'ELV / Low Voltage (MEP)', sequenceOrder: 23, description: 'Structured cabling, CCTV, access control, BMS, nurse call' },
      { code: 'VT', name: 'Vertical Transport (MEP)', sequenceOrder: 24, description: 'Lift layout, shaft details, machine room, load calcs' },
      { code: 'SP', name: 'Other Special Services (MEP)', sequenceOrder: 25, description: 'Kitchen, laundry, pneumatic tube, solar PV, landscape' },
    ];

    const entities = repo.create(defaultDisciplines);
    return await repo.save(entities);
  }

  async saveProjectDisciplines(disciplines: Partial<ProjectDisciplineModel>[]): Promise<ProjectDisciplineModel[]> {
    const repo = this.projectDisciplineRepo();
    const entities = repo.create(disciplines);
    return await repo.save(entities);
  }

  async findProjectDisciplines(projectId: string): Promise<ProjectDisciplineModel[]> {
    return await this.projectDisciplineRepo().find({ where: { projectId } });
  }

  async deleteProjectDiscipline(projectId: string, disciplineCode: string): Promise<void> {
    await this.projectDisciplineRepo().delete({ projectId, disciplineCode });
    await this.drawingRepo().delete({ projectId, disciplineCode });
  }

  // --- DRAWING TYPES MASTER ---
  async findAllDrawingTypes(): Promise<DrawingTypeModel[]> {
    return await this.drawingTypeRepo().find({ order: { disciplineCode: 'ASC', sequenceOrder: 'ASC' } });
  }

  async findDrawingTypesByDiscipline(disciplineCode: string): Promise<DrawingTypeModel[]> {
    return await this.drawingTypeRepo().find({
      where: { disciplineCode, status: 'Active' },
      order: { sequenceOrder: 'ASC' }
    });
  }

  async createOrUpdateDrawingType(data: Partial<DrawingTypeModel>): Promise<DrawingTypeModel> {
    const repo = this.drawingTypeRepo();
    let dt = data.id ? await repo.findOne({ where: { id: data.id } }) : null;
    if (dt) {
      Object.assign(dt, data);
    } else {
      dt = repo.create(data);
    }
    return await repo.save(dt);
  }

  // --- DRAWINGS & REVISONS ---
  async createDrawing(drawingData: Partial<DrawingModel>): Promise<DrawingModel> {
    const repo = this.drawingRepo();
    const drawing = repo.create(drawingData);
    return await repo.save(drawing);
  }

  async findDrawingsByProjectId(projectId: string, disciplineCode?: string): Promise<DrawingModel[]> {
    const repo = this.drawingRepo();
    const where: any = { projectId };
    if (disciplineCode && disciplineCode !== 'ALL') {
      where.disciplineCode = disciplineCode;
    }
    return await repo.find({ where, order: { disciplineCode: 'ASC', level: 'ASC', sequenceNum: 'ASC' } });
  }

  async findDrawingById(id: string): Promise<DrawingModel | null> {
    return await this.drawingRepo().findOne({ where: { id } });
  }

  async findDrawingByCode(drawingCode: string): Promise<DrawingModel | null> {
    return await this.drawingRepo().findOne({ where: { drawingCode } });
  }

  async updateDrawing(id: string, updates: Partial<DrawingModel>): Promise<DrawingModel> {
    const repo = this.drawingRepo();
    await repo.update(id, updates);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) throw new Error('Drawing not found after update.');
    return updated;
  }

  async createRevision(revisionData: Partial<DrawingRevisionModel>): Promise<DrawingRevisionModel> {
    const repo = this.drawingRevisionRepo();
    const rev = repo.create(revisionData);
    return await repo.save(rev);
  }

  async findRevisionsByDrawingId(drawingId: string): Promise<DrawingRevisionModel[]> {
    return await this.drawingRevisionRepo().find({ where: { drawingId }, order: { createdAt: 'DESC' } });
  }

  async saveFileRecord(fileData: Partial<DrawingFileModel>): Promise<DrawingFileModel> {
    const repo = this.drawingFileRepo();
    const file = repo.create(fileData);
    return await repo.save(file);
  }

  async findFilesByRevisionId(drawingRevisionId: string): Promise<DrawingFileModel[]> {
    return await this.drawingFileRepo().find({ where: { drawingRevisionId } });
  }

  async findDependentDrawings(projectId: string, level: string): Promise<DrawingModel[]> {
    const repo = this.drawingRepo();
    const query = repo.createQueryBuilder('drawing')
      .where('drawing.projectId = :projectId', { projectId })
      .andWhere('drawing.disciplineCode != :ar', { ar: 'AR' })
      .andWhere('(drawing.level = :level OR drawing.level = :all)', { level, all: 'ALL' });
    return await query.getMany();
  }

  // --- FOLDERS ---
  async createFolder(folderData: Partial<FolderModel>): Promise<FolderModel> {
    const repo = this.folderRepo();
    const folder = repo.create(folderData);
    return await repo.save(folder);
  }

  async createFoldersBatch(foldersData: Partial<FolderModel>[]): Promise<FolderModel[]> {
    const repo = this.folderRepo();
    const entities = repo.create(foldersData);
    return await repo.save(entities);
  }

  async findFoldersByProjectId(projectId: string): Promise<FolderModel[]> {
    return await this.folderRepo().find({
      where: { projectId },
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
  }

  async findFolderById(id: string): Promise<FolderModel | null> {
    return await this.folderRepo().findOne({ where: { id } });
  }

  async updateFolder(id: string, updates: Partial<FolderModel>): Promise<FolderModel> {
    const repo = this.folderRepo();
    await repo.update(id, updates);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) throw new Error('Folder not found after update.');
    return updated;
  }

  async deleteFolder(id: string): Promise<void> {
    // Delete all child folders recursively
    const repo = this.folderRepo();
    const children = await repo.find({ where: { parentFolderId: id } });
    for (const child of children) {
      await this.deleteFolder(child.id);
    }
    // Delete files associated with this folder
    await this.projectFileRepo().delete({ folderId: id });
    // Delete the folder itself
    await repo.delete(id);
  }

  // --- PROJECT FILES ---
  async findProjectFiles(projectId: string, folderId?: string): Promise<ProjectFileModel[]> {
    const where: any = { projectId };
    if (folderId) {
      where.folderId = folderId;
    }
    return await this.projectFileRepo().find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  async findProjectFileById(id: string): Promise<ProjectFileModel | null> {
    return await this.projectFileRepo().findOne({ where: { id } });
  }

  async createProjectFile(fileData: Partial<ProjectFileModel>): Promise<ProjectFileModel> {
    const repo = this.projectFileRepo();
    const file = repo.create(fileData);
    return await repo.save(file);
  }

  async updateProjectFile(id: string, updates: Partial<ProjectFileModel>): Promise<ProjectFileModel> {
    const repo = this.projectFileRepo();
    await repo.update(id, updates);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) throw new Error('Project file not found after update.');
    return updated;
  }

  async deleteProjectFile(id: string): Promise<void> {
    await this.projectFileRepo().delete(id);
  }
}

