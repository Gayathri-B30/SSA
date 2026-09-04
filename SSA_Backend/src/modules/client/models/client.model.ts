import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('clients')
export class ClientModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  clientCode!: string; // e.g. "CL-2026-001" or "CL-001"

  @Column({ type: 'varchar' })
  companyId!: string; // Scopes client to Company level

  @Column({ type: 'varchar', nullable: true })
  branchId!: string | null; // Scopes client to Branch level

  @Column({ type: 'varchar' })
  clientName!: string; // Primary Name / Individual / Company Representative

  @Column({ type: 'varchar', nullable: true })
  company?: string; // Organization / Entity Name

  @Column({ type: 'varchar', nullable: true })
  contactPerson?: string;

  @Column({ type: 'varchar', nullable: true })
  mobile?: string;

  @Column({ type: 'varchar', nullable: true })
  alternatePhone?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  pincode?: string;

  @Column({ type: 'varchar', nullable: true })
  gstNo?: string;

  @Column({ type: 'varchar', nullable: true })
  panNo?: string;

  @Column({ type: 'varchar', nullable: true })
  aadharNo?: string;

  @Column({ type: 'varchar', default: 'Corporate' })
  clientType!: string; // 'Corporate' | 'Individual Developer' | 'Government' | 'Institutional' | 'Commercial'

  @Column({ type: 'varchar', default: 'Active' })
  status!: string; // 'Active' | 'Inactive' | 'Archived'

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
