import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('drawing_types')
export class DrawingTypeModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  disciplineCode!: string; // AR, ST, EL, PL, FF, HV, MG, LV, VT, SP, IN

  @Column({ type: 'varchar' })
  code!: string; // PLN, SEC, ELE, DET, SCH, SLD, PWR, LTG, WTR, DRN, DUCT, RCP, COL, SLB

  @Column({ type: 'varchar' })
  title!: string; // e.g. "Floor Plan", "Building Sections"

  @Column({ type: 'text', nullable: true })
  purpose?: string; // Plain-language description of document use

  @Column({ type: 'varchar', default: 'Per floor' })
  levelType!: string; // "Per floor", "All", "Terrace", "Site", "Basement"

  @Column({ type: 'boolean', default: false })
  isPerFloor!: boolean; // true = per floor drawing, false = one-off

  @Column({ type: 'integer', default: 1 })
  sequenceOrder!: number;

  @Column({ type: 'varchar', default: 'Active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
