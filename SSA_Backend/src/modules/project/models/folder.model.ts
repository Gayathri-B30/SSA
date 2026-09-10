import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type FolderType = 'ROOT' | 'TOP_LEVEL' | 'DRAWING_CATEGORY' | 'WORKFLOW' | 'CATEGORY' | 'SUB_CATEGORY' | 'CUSTOM';

@Entity('folders')
export class FolderModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  projectId!: string;

  @Column({ type: 'varchar', nullable: true })
  parentFolderId!: string | null;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', default: 'CUSTOM' })
  folderType!: string;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: false })
  isSystemFolder!: boolean;

  @Column({ type: 'varchar', nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
