import { NextRequest, NextResponse } from 'next/server';
import { TestService } from '../services/test.service';

export class TestController {
  private testService: TestService;

  constructor() {
    this.testService = new TestService();
  }

  async getTest(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await this.testService.getTestMessage();
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      console.error('Error in TestController:', error);
      return new NextResponse(null, { status: 500 });
    }
  }
}
