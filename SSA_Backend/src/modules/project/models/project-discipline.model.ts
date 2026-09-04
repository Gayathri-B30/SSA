import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectModel } from './project.model';

@Entity('project_disciplines')
export class ProjectDisciplineModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  projectId!: string;

  @ManyToOne(() => ProjectModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: ProjectModel;

  @Column({ type: 'varchar' })
  disciplineCode!: string; // AR, ST, EL, etc.

  @Column({ type: 'varchar' })
  folderCode!: string; // e.g. "GVR-2026-001-AR"

  @Column({ type: 'varchar', default: 'Active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
