import { NextRequest } from 'next/server';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';
import { ProjectController } from '../../../src/modules/project/controllers/project.controller';

const projectController = new ProjectController();

export async function GET(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await projectController.getProjects(req, user);
  });
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    return await projectController.createProject(req, user);
  });
}
