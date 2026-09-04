import { ProjectRepository } from '../repositories/project.repository';
import {
  ProjectModel,
  DisciplineModel,
  ProjectDisciplineModel,
  DrawingTypeModel,
  DrawingModel,
  DrawingRevisionModel,
  DrawingFileModel
} from '../models';

export class ProjectService {
  private projectRepo = new ProjectRepository();

  // --- SEED DEFAULT MASTER DATA ---
  async seedMasterData() {
    await this.projectRepo.seedDefaultDisciplines();
    await this.seedDefaultDrawingTypes();
  }

  private async seedDefaultDrawingTypes() {
    const existing = await this.projectRepo.findAllDrawingTypes();
    if (existing.length > 0) return;

    const templates: Partial<DrawingTypeModel>[] = [
      // Architecture (AR)
      { disciplineCode: 'AR', code: 'PLN', title: 'Floor Plan', purpose: 'Master plan of each floor — all rooms, walls, doors, dimensions. Every other discipline draws on top of this.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 1 },
      { disciplineCode: 'AR', code: 'PLN', title: 'Roof / Terrace Plan', purpose: 'Terrace layout — parapets, tanks, machine rooms, slopes for drainage.', levelType: 'Terrace', isPerFloor: false, sequenceOrder: 2 },
      { disciplineCode: 'AR', code: 'SEC', title: 'Building Sections', purpose: 'Vertical cuts through the building showing floor heights and levels.', levelType: 'All', isPerFloor: false, sequenceOrder: 3 },
      { disciplineCode: 'AR', code: 'ELE', title: 'Elevations (4 sides)', purpose: 'Outside face of the building — look, openings, finishes, heights.', levelType: 'All', isPerFloor: false, sequenceOrder: 4 },
      { disciplineCode: 'AR', code: 'DET', title: 'Staircase Details', purpose: 'Enlarged detail of each staircase — riser, tread, railing.', levelType: 'All', isPerFloor: false, sequenceOrder: 5 },
      { disciplineCode: 'AR', code: 'DET', title: 'Toilet / Core Details', purpose: 'Blown-up detail of toilet blocks and service cores with fittings.', levelType: 'All', isPerFloor: false, sequenceOrder: 6 },
      { disciplineCode: 'AR', code: 'SCH', title: 'Door & Window Schedule', purpose: 'List of every door and window — size, type, material, quantity.', levelType: 'All', isPerFloor: false, sequenceOrder: 7 },
      { disciplineCode: 'AR', code: 'SCH', title: 'Wall & Finish Schedule', purpose: 'What each wall is built of and its finish (paint, tile, cladding).', levelType: 'All', isPerFloor: false, sequenceOrder: 8 },
      { disciplineCode: 'AR', code: 'PLN', title: 'Site & Setting-out Plan', purpose: 'Building position on the plot with grid — used to mark out on ground.', levelType: 'Site', isPerFloor: false, sequenceOrder: 9 },
      { disciplineCode: 'AR', code: 'SCH', title: 'Area Statement', purpose: 'Floor-wise built-up / carpet area figures — for approvals and billing.', levelType: 'All', isPerFloor: false, sequenceOrder: 10 },

      // Interior (IN)
      { disciplineCode: 'IN', code: 'PLN', title: 'Furniture Layout', purpose: 'Where each piece of furniture sits in every room.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 1 },
      { disciplineCode: 'IN', code: 'PLN', title: 'Flooring Layout', purpose: 'Flooring material and pattern for each space (tile, vinyl, etc.).', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 2 },
      { disciplineCode: 'IN', code: 'RCP', title: 'Reflected Ceiling Plan', purpose: 'Ceiling design — false ceiling, light and diffuser positions.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 3 },
      { disciplineCode: 'IN', code: 'ELE', title: 'Wall Elevations', purpose: 'Interior wall faces — panelling, cladding, feature walls.', levelType: 'All', isPerFloor: false, sequenceOrder: 4 },
      { disciplineCode: 'IN', code: 'SCH', title: 'Finish & FF&E Schedule', purpose: 'List of all finishes and loose furniture with specifications.', levelType: 'All', isPerFloor: false, sequenceOrder: 5 },

      // Structural (ST)
      { disciplineCode: 'ST', code: 'NTS', title: 'General Notes & Specs', purpose: 'Material grades, design codes and general instructions for site.', levelType: 'All', isPerFloor: false, sequenceOrder: 1 },
      { disciplineCode: 'ST', code: 'PLN', title: 'Foundation & Footing Layout', purpose: 'Position and size of all footings — the base that carries the building.', levelType: 'GF', isPerFloor: false, sequenceOrder: 2 },
      { disciplineCode: 'ST', code: 'PLN', title: 'Column Layout', purpose: 'Where every column stands on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 3 },
      { disciplineCode: 'ST', code: 'SCH', title: 'Column Schedule', purpose: 'Size and steel reinforcement of every column.', levelType: 'All', isPerFloor: false, sequenceOrder: 4 },
      { disciplineCode: 'ST', code: 'PLN', title: 'Slab & Beam Layout', purpose: 'Beams and slab thickness for each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 5 },
      { disciplineCode: 'ST', code: 'SCH', title: 'Beam Schedule / BBS', purpose: 'Reinforcement details and bar-bending schedule for steel cutting.', levelType: 'All', isPerFloor: false, sequenceOrder: 6 },

      // Electrical (EL)
      { disciplineCode: 'EL', code: 'SLD', title: 'Single Line Diagram', purpose: 'The full electrical tree — from incoming supply to every panel.', levelType: 'All', isPerFloor: false, sequenceOrder: 1 },
      { disciplineCode: 'EL', code: 'SCH', title: 'Load Schedule', purpose: 'Power demand of every area — used to size cables and boards.', levelType: 'All', isPerFloor: false, sequenceOrder: 2 },
      { disciplineCode: 'EL', code: 'PWR', title: 'Power Layout', purpose: 'Socket and equipment power points on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 3 },
      { disciplineCode: 'EL', code: 'LTG', title: 'Lighting Layout', purpose: 'Light fitting positions and their circuits on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 4 },
      { disciplineCode: 'EL', code: 'SCH', title: 'DB & Panel Schedules', purpose: 'What each distribution board feeds and its ratings.', levelType: 'All', isPerFloor: false, sequenceOrder: 5 },

      // Plumbing (PL)
      { disciplineCode: 'PL', code: 'WTR', title: 'Water Supply Layout', purpose: 'Fresh-water pipe routing to every fixture.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 1 },
      { disciplineCode: 'PL', code: 'DRN', title: 'Drainage & Sewerage Layout', purpose: 'Waste and soil pipe routing on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 2 },
      { disciplineCode: 'PL', code: 'PLN', title: 'Storm Water Layout', purpose: 'Rainwater collection and discharge.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 3 },
      { disciplineCode: 'PL', code: 'DGM', title: 'Riser Diagrams', purpose: 'Vertical stack of water and drain pipes across floors.', levelType: 'All', isPerFloor: false, sequenceOrder: 4 },

      // Fire Fighting (FF)
      { disciplineCode: 'FF', code: 'PLN', title: 'Sprinkler Layout', purpose: 'Automatic sprinkler head positions and piping.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 1 },
      { disciplineCode: 'FF', code: 'PLN', title: 'Hydrant & Hose Reel Layout', purpose: 'Fire hydrant points and hose reels on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 2 },
      { disciplineCode: 'FF', code: 'DGM', title: 'Fire Riser Diagram', purpose: 'Vertical fire-water piping across all floors.', levelType: 'All', isPerFloor: false, sequenceOrder: 3 },

      // HVAC (HV)
      { disciplineCode: 'HV', code: 'PLN', title: 'Equipment (Chiller/AHU) Layout', purpose: 'Position of chillers, AHUs and cooling towers.', levelType: 'Terrace', isPerFloor: false, sequenceOrder: 1 },
      { disciplineCode: 'HV', code: 'DUCT', title: 'Duct Layout', purpose: 'Air supply and return ductwork on each floor.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 2 },
      { disciplineCode: 'HV', code: 'PLN', title: 'Chilled Water Piping', purpose: 'Chilled-water pipe routing to the AHUs.', levelType: 'Per floor', isPerFloor: true, sequenceOrder: 3 },
    ];

    for (const item of templates) {
      await this.projectRepo.createOrUpdateDrawingType(item);
    }
  }

  // --- PROJECT CREATION & CODE GENERATION ---
  async createProject(input: {
    projectName: string;
    projectPrefix?: string;
    clientName?: string;
    clientId?: string;
    companyId?: string;
    projectType?: string;
    projectSubType?: string;
    floors?: string[]; // e.g. ["GF", "01", "02", "03", "04", "TR"]
    disciplines?: string[]; // e.g. ["AR", "ST", "EL", "PL", "FF", "HV", "IN"]
    startDate?: string;
    completionDate?: string;
  }) {
    await this.seedMasterData();

    const prefix = (input.projectPrefix || 'GVR').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const currentYear = new Date().getFullYear();
    const seq = await this.projectRepo.getNextProjectSequence(prefix, currentYear);
    const seqPadded = String(seq).padStart(3, '0');

    // Project Code format: [PROJECT_PREFIX]-[YEAR]-[SEQUENCE]
    const projectCode = `${prefix}-${currentYear}-${seqPadded}`;
    const configuredFloors = input.floors && input.floors.length > 0
      ? input.floors
      : ['GF', '01', '02', '03', '04', 'TR'];

    // 1. Create Project
    const project = await this.projectRepo.createProject({
      projectCode,
      projectName: input.projectName,
      projectPrefix: prefix,
      year: currentYear,
      sequence: seq,
      clientId: input.clientId,
      clientName: input.clientName,
      companyId: input.companyId,
      projectType: input.projectType || 'Commercial',
      projectSubType: input.projectSubType || 'Standard',
      floors: JSON.stringify(configuredFloors),
      startDate: input.startDate || new Date().toISOString().split('T')[0],
      completionDate: input.completionDate || '',
      status: 'Active',
    });

    // 2. Activate Selected Disciplines (Only create what user selected)
    const activeDisciplineCodes = Array.isArray(input.disciplines)
      ? input.disciplines
      : [];

    const projectDisciplines: Partial<ProjectDisciplineModel>[] = activeDisciplineCodes.map(code => ({
      projectId: project.id,
      disciplineCode: code,
      folderCode: `${projectCode}-${code}`,
      status: 'Active'
    }));

    await this.projectRepo.saveProjectDisciplines(projectDisciplines);

    // 3. Auto-Generate Master Drawing Register
    await this.generateMasterDrawingRegister(project, activeDisciplineCodes, configuredFloors);

    return await this.getProjectById(project.id);
  }

  // --- AUTO GENERATE MASTER DRAWING REGISTER ---
  private async generateMasterDrawingRegister(
    project: ProjectModel,
    disciplineCodes: string[],
    floors: string[]
  ) {
    let globalSeqCounter = 1;

    for (const discCode of disciplineCodes) {
      const drawingTypes = await this.projectRepo.findDrawingTypesByDiscipline(discCode);

      for (const dt of drawingTypes) {
        if (dt.isPerFloor) {
          // Generate 1 record per floor
          for (const floorCode of floors) {
            const seqStr = String(globalSeqCounter).padStart(3, '0');
            const levelCode = floorCode.toUpperCase();
            // Drawing Code: [PROJECT_CODE]-[DISCIPLINE_CODE]-[LEVEL]-[DRAWING_TYPE]-[SEQUENCE]
            const drawingCode = `${project.projectCode}-${discCode}-${levelCode}-${dt.code}-${seqStr}`;

            const drawing = await this.projectRepo.createDrawing({
              projectId: project.id,
              disciplineCode: discCode,
              drawingTypeId: dt.id,
              drawingCode,
              drawingTitle: `${dt.title} - ${levelCode}`,
              level: levelCode,
              sequenceNum: globalSeqCounter,
              status: 'Draft',
              currentRevision: 'R00'
            });

            // Initial R00 revision record
            await this.projectRepo.createRevision({
              drawingId: drawing.id,
              revisionCode: 'R00',
              revisionDate: new Date().toISOString().split('T')[0],
              preparedBy: 'System Auto-Generated',
              status: 'Draft',
              remarks: `Initial master register item for ${levelCode}`
            });

            globalSeqCounter++;
          }
        } else {
          // One-Off drawing: level = ALL or levelType
          const seqStr = String(globalSeqCounter).padStart(3, '0');
          let levelCode = 'ALL';
          if (dt.levelType === 'Terrace' || dt.levelType === 'TR') levelCode = 'TR';
          else if (dt.levelType === 'Site') levelCode = 'SITE';
          else if (dt.levelType === 'GF') levelCode = 'GF';
          else if (dt.levelType === 'B1') levelCode = 'B1';

          const drawingCode = `${project.projectCode}-${discCode}-${levelCode}-${dt.code}-${seqStr}`;

          const drawing = await this.projectRepo.createDrawing({
            projectId: project.id,
            disciplineCode: discCode,
            drawingTypeId: dt.id,
            drawingCode,
            drawingTitle: dt.title,
            level: levelCode,
            sequenceNum: globalSeqCounter,
            status: 'Draft',
            currentRevision: 'R00'
          });

          await this.projectRepo.createRevision({
            drawingId: drawing.id,
            revisionCode: 'R00',
            revisionDate: new Date().toISOString().split('T')[0],
            preparedBy: 'System Auto-Generated',
            status: 'Draft',
            remarks: `Initial master register item for ${dt.title}`
          });

          globalSeqCounter++;
        }
      }
    }
  }

  // --- DISCIPLINE MASTER METHODS ---
  async getAllDisciplines() {
    await this.seedMasterData();
    return await this.projectRepo.findAllDisciplines();
  }

  async createDisciplineMaster(input: { code: string; name: string; description?: string }) {
    await this.seedMasterData();
    const code = input.code.toUpperCase().trim();
    const repo = this.projectRepo.getDisciplineRepository();
    const existing = await repo.findOne({ where: { code } });
    if (existing) {
      existing.name = input.name || existing.name;
      if (input.description) existing.description = input.description;
      return await repo.save(existing);
    }
    const count = await repo.count();
    const newDiscipline = repo.create({
      code,
      name: input.name,
      description: input.description || `${input.name} drawings and documentation`,
      sequenceOrder: count + 1,
      status: 'Active'
    });
    return await repo.save(newDiscipline);
  }

  // --- QUERY METHODS ---
  async getAllProjects() {
    await this.seedMasterData();
    const projects = await this.projectRepo.findAllProjects();
    const result = [];
    for (const p of projects) {
      const disciplines = await this.projectRepo.findProjectDisciplines(p.id);
      const drawings = await this.projectRepo.findDrawingsByProjectId(p.id);
      result.push({
        ...p,
        floors: JSON.parse(p.floors || '[]'),
        disciplines: disciplines.map((d: any) => ({ code: d.disciplineCode, folderCode: d.folderCode })),
        drawingsCount: drawings.length
      });
    }
    return result;
  }

  async getProjectById(idOrCode: string) {
    let project = await this.projectRepo.findProjectById(idOrCode);
    if (!project) {
      project = await this.projectRepo.findProjectByCode(idOrCode);
    }
    if (!project) return null;

    const disciplines = await this.projectRepo.findProjectDisciplines(project.id);
    const drawings = await this.projectRepo.findDrawingsByProjectId(project.id);

    return {
      ...project,
      floors: JSON.parse(project.floors || '[]'),
      disciplines: disciplines.map((d: any) => ({ code: d.disciplineCode, folderCode: d.folderCode })),
      drawingsCount: drawings.length
    };
  }

  async getProjectDrawings(projectId: string, disciplineCode?: string) {
    const drawings = await this.projectRepo.findDrawingsByProjectId(projectId, disciplineCode);
    const result = [];

    for (const d of drawings) {
      const revisions = await this.projectRepo.findRevisionsByDrawingId(d.id);
      const latestRev = revisions[0] || null;
      let files: DrawingFileModel[] = [];
      if (latestRev) {
        files = await this.projectRepo.findFilesByRevisionId(latestRev.id);
      }

      result.push({
        ...d,
        revisionsCount: revisions.length,
        latestRevision: latestRev,
        latestFiles: files
      });
    }

    return result;
  }

  async getDrawingDetails(drawingId: string) {
    const drawing = await this.projectRepo.findDrawingById(drawingId);
    if (!drawing) throw new Error('Drawing not found.');

    const project = await this.projectRepo.findProjectById(drawing.projectId);
    const revisions = await this.projectRepo.findRevisionsByDrawingId(drawing.id);

    const populatedRevisions = [];
    for (const rev of revisions) {
      const files = await this.projectRepo.findFilesByRevisionId(rev.id);
      populatedRevisions.push({
        ...rev,
        files
      });
    }

    return {
      ...drawing,
      projectCode: project?.projectCode,
      projectName: project?.projectName,
      revisions: populatedRevisions
    };
  }

  // --- REVISION UPLOAD & DISCIPLINE DEPENDENCY CASCADE ---
  async addDrawingRevision(input: {
    drawingId: string;
    revisionCode: string; // e.g. "R01", "R02"
    preparedBy?: string;
    checkedBy?: string;
    approvedBy?: string;
    status?: string; // Draft, Under Review, Approved, Issued for Construction
    remarks?: string;
    fileUrl?: string;
    originalFileName?: string;
    fileType?: string;
    fileSize?: number;
    uploadedBy?: string;
  }) {
    const drawing = await this.projectRepo.findDrawingById(input.drawingId);
    if (!drawing) throw new Error('Drawing not found.');

    // 1. Create new revision record
    const revCode = input.revisionCode || `R${String(parseInt(drawing.currentRevision.replace(/[^0-9]/g, '') || '0') + 1).padStart(2, '0')}`;

    const revision = await this.projectRepo.createRevision({
      drawingId: drawing.id,
      revisionCode: revCode,
      revisionDate: new Date().toISOString().split('T')[0],
      preparedBy: input.preparedBy || 'Architect / Engineer',
      checkedBy: input.checkedBy || '',
      approvedBy: input.approvedBy || '',
      status: input.status || 'Under Review',
      remarks: input.remarks || `Uploaded revision ${revCode}`
    });

    // 2. Standardized File Naming: [DRAWING_CODE]_[REVISION_CODE].[ext]
    if (input.originalFileName && input.fileUrl) {
      const ext = input.originalFileName.includes('.') ? input.originalFileName.split('.').pop() : 'pdf';
      const storedFileName = `${drawing.id}_${revCode}.${ext}`;
      const storagePath = `PROJECTS/${drawing.projectId}/${drawing.disciplineCode}/${storedFileName}`;

      await this.projectRepo.saveFileRecord({
        drawingRevisionId: revision.id,
        originalFileName: input.originalFileName,
        storedFileName: storedFileName,
        storagePath: input.fileUrl || storagePath,
        fileType: input.fileType || ext,
        fileSize: input.fileSize || 0,
        uploadedBy: input.uploadedBy || input.preparedBy || 'User'
      });
    }

    // 3. Update Drawing's currentRevision & status
    await this.projectRepo.updateDrawing(drawing.id, {
      currentRevision: revCode,
      status: input.status || 'Under Review',
      coordinationFlag: false,
      coordinationNote: undefined
    });

    // 4. DISCIPLINE DEPENDENCY CASCADE: If Architecture (AR) drawing is revised, flag downstream discipline drawings!
    if (drawing.disciplineCode === 'AR') {
      const dependentDrawings = await this.projectRepo.findDependentDrawings(drawing.projectId, drawing.level);
      for (const dep of dependentDrawings) {
        await this.projectRepo.updateDrawing(dep.id, {
          coordinationFlag: true,
          status: 'Coordination Required',
          coordinationNote: `Architecture base plan (${drawing.drawingCode}) was revised to ${revCode}. Review & coordination required.`
        });
      }
    }

    return await this.getDrawingDetails(drawing.id);
  }

  // --- DRAWING TYPE MASTER MANAGEMENT ---
  async getDrawingTypes(disciplineCode?: string) {
    await this.seedMasterData();
    if (disciplineCode && disciplineCode !== 'ALL') {
      return await this.projectRepo.findDrawingTypesByDiscipline(disciplineCode);
    }
    return await this.projectRepo.findAllDrawingTypes();
  }

  async saveDrawingType(data: Partial<DrawingTypeModel>) {
    return await this.projectRepo.createOrUpdateDrawingType(data);
  }

  // --- MANUALLY CREATE DISCIPLINE FOLDER ---
  async addProjectDiscipline(idOrCode: string, disciplineCode: string) {
    await this.seedMasterData();
    let project = await this.projectRepo.findProjectById(idOrCode);
    if (!project) {
      project = await this.projectRepo.findProjectByCode(idOrCode);
    }
    if (!project) throw new Error('Project not found.');

    const existingDisciplines = await this.projectRepo.findProjectDisciplines(project.id);
    const code = disciplineCode.toUpperCase();
    if (existingDisciplines.some((d: any) => d.disciplineCode === code)) {
      throw new Error(`Discipline folder ${project.projectCode}-${code} already exists for this project.`);
    }

    // 1. Save Discipline Folder
    const folderCode = `${project.projectCode}-${code}`;
    await this.projectRepo.saveProjectDisciplines([{
      projectId: project.id,
      disciplineCode: code,
      folderCode,
      status: 'Active'
    }]);

    // 2. Generate Drawing Register for this discipline
    const floors = JSON.parse(project.floors || '["GF","01","02","03","04","TR"]');
    const existingDrawings = await this.projectRepo.findDrawingsByProjectId(project.id);
    let startSeq = existingDrawings.length + 1;

    const drawingTypes = await this.projectRepo.findDrawingTypesByDiscipline(code);
    for (const dt of drawingTypes) {
      if (dt.isPerFloor) {
        for (const floorCode of floors) {
          const seqStr = String(startSeq).padStart(3, '0');
          const levelCode = floorCode.toUpperCase();
          const drawingCode = `${project.projectCode}-${code}-${levelCode}-${dt.code}-${seqStr}`;

          const drawing = await this.projectRepo.createDrawing({
            projectId: project.id,
            disciplineCode: code,
            drawingTypeId: dt.id,
            drawingCode,
            drawingTitle: `${dt.title} - ${levelCode}`,
            level: levelCode,
            sequenceNum: startSeq,
            status: 'Draft',
            currentRevision: 'R00'
          });

          await this.projectRepo.createRevision({
            drawingId: drawing.id,
            revisionCode: 'R00',
            revisionDate: new Date().toISOString().split('T')[0],
            preparedBy: 'System Initialized',
            status: 'Draft',
            remarks: `Discipline folder ${folderCode} manually created`
          });

          startSeq++;
        }
      } else {
        const seqStr = String(startSeq).padStart(3, '0');
        let levelCode = 'ALL';
        if (dt.levelType === 'Terrace' || dt.levelType === 'TR') levelCode = 'TR';
        else if (dt.levelType === 'Site') levelCode = 'SITE';
        else if (dt.levelType === 'GF') levelCode = 'GF';

        const drawingCode = `${project.projectCode}-${code}-${levelCode}-${dt.code}-${seqStr}`;

        const drawing = await this.projectRepo.createDrawing({
          projectId: project.id,
          disciplineCode: code,
          drawingTypeId: dt.id,
          drawingCode,
          drawingTitle: dt.title,
          level: levelCode,
          sequenceNum: startSeq,
          status: 'Draft',
          currentRevision: 'R00'
        });

        await this.projectRepo.createRevision({
          drawingId: drawing.id,
          revisionCode: 'R00',
          revisionDate: new Date().toISOString().split('T')[0],
          preparedBy: 'System Initialized',
          status: 'Draft',
          remarks: `Discipline folder ${folderCode} manually created`
        });

        startSeq++;
      }
    }

    return await this.getProjectById(project.id);
  }

  async deleteProjectDiscipline(idOrCode: string, disciplineCode: string) {
    let project = await this.projectRepo.findProjectById(idOrCode);
    if (!project) {
      project = await this.projectRepo.findProjectByCode(idOrCode);
    }
    if (project) {
      await this.projectRepo.deleteProjectDiscipline(project.id, disciplineCode);
      return await this.getProjectById(project.id);
    }
    return null;
  }
}
