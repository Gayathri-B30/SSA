import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branches')
export class BranchModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  branchId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  manager!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar', default: 'Active' })
  status!: string;

  @Column({ type: 'varchar' })
  companyId!: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
