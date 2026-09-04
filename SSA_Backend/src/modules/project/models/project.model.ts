import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class ProjectModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  projectCode!: string; // e.g. "GVR-2026-001"

  @Column({ type: 'varchar' })
  projectName!: string;

  @Column({ type: 'varchar', default: 'GVR' })
  projectPrefix!: string;

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'integer' })
  sequence!: number;

  @Column({ type: 'varchar', nullable: true })
  clientId?: string;

  @Column({ type: 'varchar', nullable: true })
  clientName?: string;

  @Column({ type: 'varchar', nullable: true })
  companyId?: string;

  @Column({ type: 'varchar', nullable: true })
  projectType?: string;

  @Column({ type: 'varchar', nullable: true })
  projectSubType?: string;

  @Column({ type: 'text', default: '["GF","01","02","03","04","TR"]' })
  floors!: string; // Stored as JSON string array of level codes

  @Column({ type: 'varchar', nullable: true })
  startDate?: string;

  @Column({ type: 'varchar', nullable: true })
  completionDate?: string;

  @Column({ type: 'varchar', default: 'Active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
