import { NextRequest } from 'next/server';
import { TestController, testMiddleware } from '../../../src/modules/test';

const testController = new TestController();

export async function GET(req: NextRequest) {
  // Wrap controller call with the middleware
  return await testMiddleware(req, async () => {
    return await testController.getTest(req);
  });
}
