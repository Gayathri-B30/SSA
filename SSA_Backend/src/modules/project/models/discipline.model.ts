import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('disciplines')
export class DisciplineModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string; // AR, IN, ST, EL, PL, FF, HV, MG, LV, VT, SP

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'integer', default: 1 })
  sequenceOrder!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: 'Active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
