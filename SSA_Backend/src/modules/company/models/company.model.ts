import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyStatus } from '../enums/company-status.enum';

@Entity('companies')
export class CompanyModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  companyId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'varchar',
    default: CompanyStatus.ACTIVE
  })
  status!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  contactPerson!: string;

  @Column({ type: 'varchar' })
  mobileNumber!: string;

  @Column({ type: 'varchar', nullable: true })
  designation?: string;

  @Column({ type: 'varchar', nullable: true })
  gstNo?: string;

  @Column({ type: 'varchar', nullable: true })
  panNo?: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
