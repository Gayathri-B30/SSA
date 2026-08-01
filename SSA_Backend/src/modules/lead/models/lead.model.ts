import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectCategoryModel } from './project-category.model';

@Entity('leads')
export class LeadModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  leadId!: string; // e.g. "LEAD-001"

  @Column({ type: 'varchar' })
  companyId!: string; // Scopes lead to Company level

  @Column({ type: 'varchar', nullable: true })
  branchId!: string | null; // Scopes lead to Branch level

  @Column({ type: 'integer' })
  categoryId!: number; // Selected category (Residential, Hospital, etc.)

  @ManyToOne(() => ProjectCategoryModel)
  @JoinColumn({ name: 'categoryId' })
  category!: ProjectCategoryModel;

  @Column({ type: 'varchar', default: 'Lead' })
  status!: string; // e.g. 'Lead', 'Requirement Collection', 'Client Brief'

  // ==========================================
  // FRONTEND ALIGNMENT FIELDS
  // ==========================================
  @Column({ type: 'varchar', nullable: true })
  leadTitle?: string;

  @Column({ type: 'varchar', nullable: true })
  company?: string;

  @Column({ type: 'varchar', nullable: true })
  contactPerson?: string;

  @Column({ type: 'varchar', nullable: true })
  mobile?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  projectType?: string;

  @Column({ type: 'varchar', nullable: true })
  projectSubType?: string;

  @Column({ name: 'category', type: 'varchar', nullable: true })
  leadCategory?: string;

  @Column({ type: 'text', nullable: true })
  siteAddress?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  siteArea?: string;

  @Column({ type: 'varchar', nullable: true })
  unit?: string;

  @Column({ type: 'varchar', nullable: true })
  estimatedBudget?: string;

  @Column({ type: 'varchar', nullable: true })
  expectedStartDate?: string;

  @Column({ type: 'varchar', nullable: true })
  expectedCompletionDate?: string;

  @Column({ type: 'varchar', nullable: true })
  assignedEmployee?: string;

  @Column({ type: 'varchar', nullable: true })
  branch?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  // ==========================================
  // COMMON REQUIREMENT CAPTURE FIELDS (Section 2)
  // ==========================================

  // 1. Lead & Client
  @Column({ type: 'varchar' })
  clientName!: string;

  @Column({ type: 'varchar', nullable: true })
  organisation?: string;

  @Column({ type: 'text', nullable: true })
  contactDetails?: string;

  @Column({ type: 'varchar', nullable: true })
  leadSource?: string; // referral / website / direct / marketing

  @Column({ type: 'varchar', nullable: true })
  decisionMakers?: string;

  @Column({ type: 'varchar', nullable: true })
  priorProjectsWithSSA?: string;

  // 2. Site Particulars
  @Column({ type: 'text', nullable: true })
  locationAddress?: string;

  @Column({ type: 'varchar', nullable: true })
  siteExtent?: string; // sq.ft / grounds / acres

  @Column({ type: 'varchar', nullable: true })
  surveyNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  landOwnershipDocsAvailable?: string;

  @Column({ type: 'varchar', nullable: true })
  topographyLevels?: string;

  @Column({ type: 'varchar', nullable: true })
  accessRoadWidth?: string;

  @Column({ type: 'varchar', nullable: true })
  orientation?: string;

  @Column({ type: 'varchar', nullable: true })
  existingStructures?: string; // retain / demolish

  @Column({ type: 'varchar', nullable: true })
  soilReportAvailable?: string;

  @Column({ type: 'text', nullable: true })
  adjacentDevelopments?: string;

  // 3. Utilities at Site
  @Column({ type: 'varchar', nullable: true })
  ebSupplySanctionedLoad?: string;

  @Column({ type: 'varchar', nullable: true })
  waterSource?: string; // metro / borewell / tanker

  @Column({ type: 'varchar', nullable: true })
  sewerSeptic?: string; // sewer / septic

  @Column({ type: 'varchar', nullable: true })
  stormDrainage?: string;

  @Column({ type: 'varchar', nullable: true })
  telecom?: string;

  // 4. Regulatory Context
  @Column({ type: 'varchar', nullable: true })
  approvingAuthority?: string; // Corporation / DTCP / CMDA / Panchayat / SIPCOT etc.

  @Column({ type: 'varchar', nullable: true })
  landUseZoning?: string;

  @Column({ type: 'varchar', nullable: true })
  fsiCoverageKnown?: string;

  @Column({ type: 'varchar', nullable: true })
  setbacksHeightRestrictions?: string;

  @Column({ type: 'varchar', nullable: true })
  priorApprovalsViolations?: string;

  @Column({ type: 'text', nullable: true })
  specialRestrictions?: string; // heritage / CRZ / airport-funnel etc.

  // 5. Project Basics
  @Column({ type: 'varchar', nullable: true })
  projectName?: string; // Name of the project

  @Column({ type: 'varchar', nullable: true })
  subType?: string; // e.g. "Individual Homes", "Apartments" (refines category)

  @Column({ type: 'varchar', nullable: true })
  buildType?: string; // new build / renovation / extension

  @Column({ type: 'varchar', nullable: true })
  expectedBuiltUpArea?: string;

  @Column({ type: 'varchar', nullable: true })
  expectedFloors?: string;

  @Column({ type: 'varchar', nullable: true })
  budgetRange?: string;

  @Column({ type: 'varchar', nullable: true })
  timelineExpectation?: string;

  @Column({ type: 'varchar', nullable: true })
  fundingSource?: string; // self / loan / investor

  @Column({ type: 'varchar', nullable: true })
  phasingNeeds?: string;

  // 6. Services Required
  @Column({ type: 'jsonb', nullable: true })
  servicesRequired?: string[]; // Architecture, Interior, Structural, MEP, PMC, etc.

  // 7. Execution Context
  @Column({ type: 'varchar', nullable: true })
  contractorStatus?: string; // appointed / to be selected through SSA

  @Column({ type: 'text', nullable: true })
  preferredVendors?: string;

  @Column({ type: 'varchar', nullable: true })
  siteVisitFrequencyExpectation?: string;

  @Column({ type: 'varchar', nullable: true })
  reportingExpectations?: string;

  // 8. Design Preferences
  @Column({ type: 'text', nullable: true })
  styleReferencesInspiration?: string;

  @Column({ type: 'varchar', nullable: true })
  sustainabilityGoals?: string; // solar, rainwater, green rating

  @Column({ type: 'varchar', nullable: true })
  vaastuOrientationRequirements?: string;

  @Column({ type: 'text', nullable: true })
  materialPreferences?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: { name: string; url: string; size: number; type: string }[];

  // Audit
  @Column({ type: 'varchar', nullable: true })
  createdBy?: string;


  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
