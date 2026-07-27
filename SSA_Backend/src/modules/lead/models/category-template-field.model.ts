import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectCategoryModel } from './project-category.model';

@Entity('category_template_fields')
export class CategoryTemplateFieldModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  categoryId!: number;

  @ManyToOne(() => ProjectCategoryModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category?: ProjectCategoryModel;

  @Column({ type: 'varchar' })
  fieldKey!: string; // e.g. "bedCount", "householdSize"

  @Column({ type: 'varchar' })
  fieldName!: string; // e.g. "Bed Count", "Household Size"

  @Column({ type: 'varchar' })
  fieldType!: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment';

  @Column({ type: 'jsonb', nullable: true })
  fieldOptions?: string[]; // Selection options if applicable

  @Column({ type: 'varchar' })
  section!: string; // e.g. "Space Programme", "Household Profile"

  @Column({ type: 'varchar', default: 'Lead' })
  capturedAtStage!: 'Lead' | 'Requirement Collection' | 'Client Brief';

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
