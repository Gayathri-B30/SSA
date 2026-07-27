import { TestModel } from '../models/test.model';
import { TestStatus } from '../enums/test.enum';

export class TestRepository {
  async getTestData(): Promise<TestModel> {
    // Mocking a database call for testing purposes
    const test = new TestModel();
    test.id = 1;
    test.message = 'Hello from the Test Repository!';
    test.status = TestStatus.ACTIVE;
    return test;
  }
}
