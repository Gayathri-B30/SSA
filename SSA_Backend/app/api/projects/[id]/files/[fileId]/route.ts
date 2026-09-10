import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../../../src/modules/auth/middlewares/auth.middleware';
import { ProjectController } from '../../../../../../src/modules/project/controllers/project.controller';

const projectController = new ProjectController();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { fileId } = await params;
  return await authMiddleware(req, async (user: any) => {
    return await projectController.renameProjectFile(req, fileId, user);
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { fileId } = await params;
  return await authMiddleware(req, async (user: any) => {
    return await projectController.deleteProjectFile(req, fileId, user);
  });
}
