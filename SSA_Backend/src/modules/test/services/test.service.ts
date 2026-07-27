export class TestService {
  constructor() {}

  async getTestMessage() {
    return {
      id: 1,
      message: 'Hello directly from the Test Service!',
      status: 'ACTIVE'
    };
  }
}
