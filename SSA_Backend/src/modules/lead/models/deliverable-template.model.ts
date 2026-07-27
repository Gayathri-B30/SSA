import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectCategoryModel } from './project-category.model';

@Entity('deliverable_templates')
export class DeliverableTemplateModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: true })
  categoryId!: number | null; // NULL represents common deliverables (Section 4.1)

  @ManyToOne(() => ProjectCategoryModel, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: ProjectCategoryModel;

  @Column({ type: 'varchar' })
  phase!: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 5'; // Phase 1 to Phase 5 based on SOP and deliverables matrix

  @Column({ type: 'varchar' })
  deliverableName!: string;

  @Column({ type: 'varchar', nullable: true })
  discipline?: 'Architecture' | 'Structure' | 'MEP-Electrical' | 'MEP-Plumbing & Fire' | 'HVAC' | 'Interior';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
