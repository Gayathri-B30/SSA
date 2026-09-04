import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectModel } from './project.model';
import { DrawingTypeModel } from './drawing-type.model';

@Entity('drawings')
export class DrawingModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  projectId!: string;

  @ManyToOne(() => ProjectModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: ProjectModel;

  @Column({ type: 'varchar' })
  disciplineCode!: string; // AR, ST, EL, etc.

  @Column({ type: 'varchar', nullable: true })
  drawingTypeId?: string;

  @ManyToOne(() => DrawingTypeModel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'drawingTypeId' })
  drawingType?: DrawingTypeModel;

  @Column({ type: 'varchar', unique: true })
  drawingCode!: string; // e.g. "GVR-2026-001-AR-GF-PLN-001" (PERMANENT)

  @Column({ type: 'varchar' })
  drawingTitle!: string;

  @Column({ type: 'varchar' })
  level!: string; // GF, 01, 02, TR, ALL, SITE, B1

  @Column({ type: 'integer', default: 1 })
  sequenceNum!: number;

  @Column({ type: 'varchar', default: 'Draft' })
  status!: string; // Draft, Submitted, Under Review, Revision Required, Approved, Issued for Construction, Superseded, Rejected, On Hold, Cancelled, Coordination Required

  @Column({ type: 'varchar', default: 'R00' })
  currentRevision!: string; // R00, R01, R02

  @Column({ type: 'boolean', default: false })
  coordinationFlag!: boolean; // Set to true if upstream architecture drawing was revised

  @Column({ type: 'text', nullable: true })
  coordinationNote?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
