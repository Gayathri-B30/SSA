import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LeadModel } from './lead.model';
import { DeliverableTemplateModel } from './deliverable-template.model';

@Entity('lead_deliverables')
export class LeadDeliverableModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  leadId!: number;

  @ManyToOne(() => LeadModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead?: LeadModel;

  @Column({ type: 'integer' })
  templateId!: number;

  @ManyToOne(() => DeliverableTemplateModel)
  @JoinColumn({ name: 'templateId' })
  template?: DeliverableTemplateModel;

  @Column({ type: 'varchar' })
  phase!: string;

  @Column({ type: 'varchar' })
  deliverableName!: string;

  @Column({ type: 'varchar', nullable: true })
  discipline?: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status!: 'Pending' | 'In Progress' | 'Issued' | 'Approved';

  @Column({ type: 'varchar', nullable: true })
  attachmentUrl?: string;

  @Column({ type: 'text', nullable: true })
  decision?: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
