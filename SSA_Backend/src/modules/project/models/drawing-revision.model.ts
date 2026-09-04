import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DrawingModel } from './drawing.model';

@Entity('drawing_revisions')
export class DrawingRevisionModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  drawingId!: string;

  @ManyToOne(() => DrawingModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drawingId' })
  drawing!: DrawingModel;

  @Column({ type: 'varchar' })
  revisionCode!: string; // R00, R01, R02

  @Column({ type: 'varchar', nullable: true })
  revisionDate?: string;

  @Column({ type: 'varchar', nullable: true })
  preparedBy?: string;

  @Column({ type: 'varchar', nullable: true })
  checkedBy?: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy?: string;

  @Column({ type: 'varchar', default: 'Draft' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
