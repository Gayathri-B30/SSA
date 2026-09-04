import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../../../../src/modules/auth/middlewares/auth.middleware';
import { ProjectController } from '../../../../../../src/modules/project/controllers/project.controller';

const projectController = new ProjectController();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> }
) {
  const resolvedParams = await params;
  return await authMiddleware(req, async (user: any) => {
    return await projectController.deleteProjectDiscipline(req, resolvedParams.id, resolvedParams.code, user);
  });
}
