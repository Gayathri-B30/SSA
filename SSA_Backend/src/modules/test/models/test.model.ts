import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TestStatus } from '../enums/test.enum';

@Entity('tests')
export class TestModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  message!: string;

  @Column({
    type: 'enum',
    enum: TestStatus,
    default: TestStatus.ACTIVE
  })
  status!: TestStatus;
}
