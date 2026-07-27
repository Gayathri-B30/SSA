import { getDataSource } from '../../../shared/config/data-source';
import { UserModel } from '../models/user.model';
import { Repository } from 'typeorm';

export class UserRepository {
  private async getRepository(): Promise<Repository<UserModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository('UserModel');
  }

  async findById(id: number): Promise<UserModel | null> {
    const repo = await this.getRepository();
    return await repo.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<UserModel | null> {
    const repo = await this.getRepository();
    return await repo.createQueryBuilder('user')
      .where('LOWER(user.userId) = :userId', { userId: userId.toLowerCase() })
      .getOne();
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const repo = await this.getRepository();
    return await repo.findOne({ where: { email } });
  }

  async createUser(userData: Partial<UserModel>): Promise<UserModel> {
    const repo = await this.getRepository();
    const user = repo.create(userData);
    return await repo.save(user);
  }

  async countUsers(): Promise<number> {
    const repo = await this.getRepository();
    return await repo.count();
  }
}
