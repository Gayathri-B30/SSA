import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LeadModel } from './lead.model';

@Entity('lead_requirement_values')
@Unique(['leadId', 'fieldKey'])
export class LeadRequirementValueModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  leadId!: number;

  @ManyToOne(() => LeadModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead?: LeadModel;

  @Column({ type: 'varchar' })
  fieldKey!: string; // Key of the category-specific field (e.g. "bedCount")

  @Column({ type: 'jsonb' })
  value!: any; // Dynamic value of the field (text, number, boolean, array, etc.)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
