import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('project_files')
export class ProjectFileModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  projectId!: string;

  @Column({ type: 'varchar' })
  folderId!: string;

  @Column({ type: 'varchar' })
  fileName!: string;

  @Column({ type: 'varchar' })
  filePath!: string;

  @Column({ type: 'varchar', nullable: true })
  fileType?: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', nullable: true })
  uploadedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
