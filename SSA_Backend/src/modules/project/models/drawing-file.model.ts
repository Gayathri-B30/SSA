import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DrawingRevisionModel } from './drawing-revision.model';

@Entity('files')
export class DrawingFileModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  drawingRevisionId!: string;

  @ManyToOne(() => DrawingRevisionModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drawingRevisionId' })
  drawingRevision!: DrawingRevisionModel;

  @Column({ type: 'varchar' })
  originalFileName!: string; // e.g. "Ground Floor Plan Final.pdf"

  @Column({ type: 'varchar' })
  storedFileName!: string; // e.g. "GVR-2026-001-AR-GF-PLN-001_R02.pdf"

  @Column({ type: 'varchar' })
  storagePath!: string; // e.g. "PROJECTS/GVR-2026-001/AR/GVR-2026-001-AR-GF-PLN-001_R02.pdf"

  @Column({ type: 'varchar', nullable: true })
  fileType?: string; // pdf, dwg, dxf, rvt, jpg, png, docx, xlsx

  @Column({ type: 'integer', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', nullable: true })
  uploadedBy?: string;

  @CreateDateColumn()
  uploadedAt!: Date;
}
