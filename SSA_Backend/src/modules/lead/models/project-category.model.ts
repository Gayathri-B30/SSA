import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('project_categories')
export class ProjectCategoryModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  code!: string; // e.g. "RESIDENTIAL", "HOSPITAL", "SCHOOL"

  @Column({ type: 'varchar' })
  name!: string; // e.g. "Residential"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
