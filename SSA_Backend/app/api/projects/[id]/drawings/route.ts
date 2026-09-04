import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../../src/modules/auth/middlewares/auth.middleware';
import { ProjectController } from '../../../../../src/modules/project/controllers/project.controller';

const projectController = new ProjectController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return await authMiddleware(req, async (user: any) => {
    return await projectController.getProjectDrawings(req, resolvedParams.id, user);
  });
}
