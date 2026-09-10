// Standard KONGUNAD HOSPITAL Project Folder Template Definition

export type FolderType = 'ROOT' | 'TOP_LEVEL' | 'DRAWING_CATEGORY' | 'WORKFLOW' | 'CATEGORY' | 'SUB_CATEGORY' | 'DOCUMENT' | 'CUSTOM';

export interface FolderNodeTemplate {
  name: string;
  folderType?: FolderType;
  sortOrder?: number;
  badgeColor?: string;
  iconType?: 'folder' | 'drawing' | 'workflow' | 'document' | 'report' | 'approval' | 'schedule' | 'cost' | 'handover';
  children?: FolderNodeTemplate[];
}

export interface ProjectFolderItem {
  id: string;
  projectId: string;
  parentFolderId: string | null;
  name: string;
  folderType: string;
  sortOrder: number;
  isSystemFolder: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFileItem {
  id: string;
  projectId: string;
  folderId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DRAWING_WORKFLOW_CHILDREN: FolderNodeTemplate[] = [
  { name: '1. Work In Progress', folderType: 'WORKFLOW', sortOrder: 1, iconType: 'workflow' },
  { name: '2. Shared', folderType: 'WORKFLOW', sortOrder: 2, iconType: 'workflow' },
  { name: '3. Archive', folderType: 'WORKFLOW', sortOrder: 3, iconType: 'workflow' },
];

const BOQ_SUBFOLDERS: FolderNodeTemplate[] = [
  { name: 'Rate Comparison', folderType: 'SUB_CATEGORY', sortOrder: 1, iconType: 'cost' },
  { name: 'Vendor Rates', folderType: 'SUB_CATEGORY', sortOrder: 2, iconType: 'cost' },
];

const TESTING_COMMISSIONING_SUBFOLDERS: FolderNodeTemplate[] = [
  { name: 'Commissioning Report', folderType: 'SUB_CATEGORY', sortOrder: 1, iconType: 'report' },
  { name: 'Test Report', folderType: 'SUB_CATEGORY', sortOrder: 2, iconType: 'report' },
];

export const STANDARD_PROJECT_FOLDER_TEMPLATE: FolderNodeTemplate[] = [
  // 1. PROJECT INFORMATION
  {
    name: '1. PROJECT INFORMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 1,
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    iconType: 'document',
    children: [],
  },

  // 2. SITE INFORMATION
  {
    name: '2. SITE INFORMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 2,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconType: 'document',
    children: [
      { name: '1. Site Survey Report', folderType: 'CATEGORY', sortOrder: 1, iconType: 'report' },
      { name: '2. Topographical Survey', folderType: 'CATEGORY', sortOrder: 2, iconType: 'report' },
      { name: '3. Soil Investigation Report', folderType: 'CATEGORY', sortOrder: 3, iconType: 'report' },
      { name: '4. Geotechnical Investigation', folderType: 'CATEGORY', sortOrder: 4, iconType: 'report' },
      { name: '5. Existing Drawings (if applicable)', folderType: 'CATEGORY', sortOrder: 5, iconType: 'drawing' },
      { name: '6. Site Photos', folderType: 'CATEGORY', sortOrder: 6, iconType: 'document' },
    ],
  },

  // 3. ARCHITECTURAL DRAWINGS
  {
    name: '3. ARCHITECTURAL DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 3,
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconType: 'drawing',
    children: [
      { name: '1. Scheme Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 1, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '2. Working Plan, Elevation & Section Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 2, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '3. Detailed Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 3, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '4. Joinery Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 4, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '5. Staircase, Lift & Ramp Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 5, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '6. Site Development & Landscape Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 6, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '7. Compound Wall Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 7, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '8. Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 8, children: DRAWING_WORKFLOW_CHILDREN },
    ],
  },

  // 4. INTERIOR DRAWINGS
  {
    name: '4. INTERIOR DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 4,
    badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    iconType: 'drawing',
    children: [
      { name: '1. Interior Layouts & False Ceiling Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 1, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '2. RCP Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 2, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '3. Furniture Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 3, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '4. Joinery Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 4, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '5. Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 5, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '6. Flooring Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 6, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '7. Material Finishes Matrix', folderType: 'CATEGORY', sortOrder: 7, iconType: 'document' },
    ],
  },

  // 5. STRUCTURAL DRAWINGS
  {
    name: '5. STRUCTURAL DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 5,
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconType: 'drawing',
    children: [
      { name: '1. Design', folderType: 'CATEGORY', sortOrder: 1, iconType: 'drawing' },
      { name: '2. Foundation & Center Line Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 2, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '3. Plinth & Tie Beam Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 3, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '4. Lintel & Roof Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 4, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '5. Staircase & Lift Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 5, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '6. RCC Tanks & Other Structures Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 6, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '7. Structural Calculations', folderType: 'CATEGORY', sortOrder: 7, iconType: 'document' },
    ],
  },

  // 6. MEP & OTHER SERVICE DRAWINGS
  {
    name: '6. MEP & OTHER SERVICE DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 6,
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    iconType: 'drawing',
    children: [
      { name: 'AUTOMATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 1, iconType: 'drawing' },
      { name: 'COMMUNICATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 2, iconType: 'drawing' },
      { name: 'ELECTRICAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 3, iconType: 'drawing' },
      { name: 'FIRE FIGHTING DRAWINGS', folderType: 'CATEGORY', sortOrder: 4, iconType: 'drawing' },
      { name: 'HVAC DRAWINGS', folderType: 'CATEGORY', sortOrder: 5, iconType: 'drawing' },
      { name: 'IDEC DRAWINGS', folderType: 'CATEGORY', sortOrder: 6, iconType: 'drawing' },
      { name: 'MEDICAL GAS DRAWINGS', folderType: 'CATEGORY', sortOrder: 7, iconType: 'drawing' },
      { name: 'OTHER SERVICES', folderType: 'CATEGORY', sortOrder: 8, iconType: 'drawing' },
      { name: 'PLUMBING DRAWINGS', folderType: 'CATEGORY', sortOrder: 9, iconType: 'drawing' },
      { name: 'PNEUMATIC DRAWINGS', folderType: 'CATEGORY', sortOrder: 10, iconType: 'drawing' },
    ],
  },

  // 7. BOQ & ESTIMATION
  {
    name: '7. BOQ & ESTIMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 7,
    badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    iconType: 'cost',
    children: [
      { name: 'Automation BOQ', folderType: 'CATEGORY', sortOrder: 1, children: BOQ_SUBFOLDERS },
      { name: 'Civil BOQ', folderType: 'CATEGORY', sortOrder: 2, children: BOQ_SUBFOLDERS },
      { name: 'Communication BOQ', folderType: 'CATEGORY', sortOrder: 3, children: BOQ_SUBFOLDERS },
      { name: 'Electrical BOQ', folderType: 'CATEGORY', sortOrder: 4, children: BOQ_SUBFOLDERS },
      { name: 'Fire Fighting BOQ', folderType: 'CATEGORY', sortOrder: 5, children: BOQ_SUBFOLDERS },
      { name: 'HVAC BOQ', folderType: 'CATEGORY', sortOrder: 6, children: BOQ_SUBFOLDERS },
      { name: 'Interior BOQ', folderType: 'CATEGORY', sortOrder: 7, children: BOQ_SUBFOLDERS },
      { name: 'Medical Gas BOQ', folderType: 'CATEGORY', sortOrder: 8, children: BOQ_SUBFOLDERS },
      { name: 'Other Services BOQ', folderType: 'CATEGORY', sortOrder: 9, children: BOQ_SUBFOLDERS },
      { name: 'Plumbing BOQ', folderType: 'CATEGORY', sortOrder: 10, children: BOQ_SUBFOLDERS },
      { name: 'Pneumatic BOQ', folderType: 'CATEGORY', sortOrder: 11, children: BOQ_SUBFOLDERS },
    ],
  },

  // 8. TENDER DOCUMENTS
  {
    name: '8. TENDER DOCUMENTS',
    folderType: 'TOP_LEVEL',
    sortOrder: 8,
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    iconType: 'document',
    children: [],
  },

  // 9. CONSTRUCTION REPORTS
  {
    name: '9. CONSTRUCTION REPORTS',
    folderType: 'TOP_LEVEL',
    sortOrder: 9,
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    iconType: 'report',
    children: [
      { name: 'Inspection Report', folderType: 'CATEGORY', sortOrder: 1, iconType: 'report' },
      { name: 'Mockup Reports', folderType: 'CATEGORY', sortOrder: 2, iconType: 'report' },
      { name: 'Progress Photos', folderType: 'CATEGORY', sortOrder: 3, iconType: 'document' },
      { name: 'QA, QC', folderType: 'CATEGORY', sortOrder: 4, iconType: 'report' },
      { name: 'Site Queries', folderType: 'CATEGORY', sortOrder: 5, iconType: 'report' },
      { name: 'Work Progress Report', folderType: 'CATEGORY', sortOrder: 6, iconType: 'report' },
    ],
  },

  // 10. SUBMITTAL APPROVALS
  {
    name: '10. SUBMITTAL APPROVALS',
    folderType: 'TOP_LEVEL',
    sortOrder: 10,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    iconType: 'approval',
    children: [
      { name: 'Approved Documents', folderType: 'CATEGORY', sortOrder: 1, iconType: 'approval' },
      { name: 'Client Approvals', folderType: 'CATEGORY', sortOrder: 2, iconType: 'approval' },
      { name: 'Consultant Approvals', folderType: 'CATEGORY', sortOrder: 3, iconType: 'approval' },
      { name: 'Equipment Submittals', folderType: 'CATEGORY', sortOrder: 4, iconType: 'approval' },
      { name: 'Material Samples', folderType: 'CATEGORY', sortOrder: 5, iconType: 'approval' },
      { name: 'Material Submittals', folderType: 'CATEGORY', sortOrder: 6, iconType: 'approval' },
      { name: 'Mockup Approvals', folderType: 'CATEGORY', sortOrder: 7, iconType: 'approval' },
      { name: 'Shop Drawings', folderType: 'CATEGORY', sortOrder: 8, iconType: 'drawing' },
      { name: 'Technical Submittals', folderType: 'CATEGORY', sortOrder: 9, iconType: 'approval' },
    ],
  },

  // 11. TECHNICAL QUERIES
  {
    name: '11. TECHNICAL QUERIES',
    folderType: 'TOP_LEVEL',
    sortOrder: 11,
    badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    iconType: 'document',
    children: [
      { name: 'Automation', folderType: 'CATEGORY', sortOrder: 1 },
      { name: 'Civil', folderType: 'CATEGORY', sortOrder: 2 },
      { name: 'Communication', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'Electrical', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'Fire Fighting', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'HVAC', folderType: 'CATEGORY', sortOrder: 6 },
      { name: 'IDEC', folderType: 'CATEGORY', sortOrder: 7 },
      { name: 'Interior', folderType: 'CATEGORY', sortOrder: 8 },
      { name: 'Medical Gas', folderType: 'CATEGORY', sortOrder: 9 },
      { name: 'Other Services', folderType: 'CATEGORY', sortOrder: 10 },
      { name: 'Plumbing', folderType: 'CATEGORY', sortOrder: 11 },
      { name: 'Pneumatic', folderType: 'CATEGORY', sortOrder: 12 },
    ],
  },

  // 12. MEETING CORRESPONDENCE
  {
    name: '12. MEETING CORRESPONDENCE',
    folderType: 'TOP_LEVEL',
    sortOrder: 12,
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    iconType: 'document',
    children: [
      { name: 'Action Tracker', folderType: 'CATEGORY', sortOrder: 1, iconType: 'document' },
      {
        name: 'Correspondence',
        folderType: 'CATEGORY',
        sortOrder: 2,
        children: [
          { name: 'Client', folderType: 'SUB_CATEGORY', sortOrder: 1 },
          { name: 'Consultant', folderType: 'SUB_CATEGORY', sortOrder: 2 },
          { name: 'Contractor', folderType: 'SUB_CATEGORY', sortOrder: 3 },
          { name: 'Vendor', folderType: 'SUB_CATEGORY', sortOrder: 4 },
        ],
      },
      { name: 'E-mail References', folderType: 'CATEGORY', sortOrder: 3, iconType: 'document' },
      { name: 'Meeting Notices', folderType: 'CATEGORY', sortOrder: 4, iconType: 'document' },
      { name: 'MoM', folderType: 'CATEGORY', sortOrder: 5, iconType: 'document' },
      { name: 'Transmittals', folderType: 'CATEGORY', sortOrder: 6, iconType: 'document' },
    ],
  },

  // 13. PROJECT SCHEDULE
  {
    name: '13. PROJECT SCHEDULE',
    folderType: 'TOP_LEVEL',
    sortOrder: 13,
    badgeColor: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    iconType: 'schedule',
    children: [
      { name: '1. Master Programme', folderType: 'CATEGORY', sortOrder: 1, iconType: 'schedule' },
      { name: '2. Baseline', folderType: 'CATEGORY', sortOrder: 2, iconType: 'schedule' },
      { name: '3. Updated Programme', folderType: 'CATEGORY', sortOrder: 3, iconType: 'schedule' },
      { name: '4. Monthly Schedule', folderType: 'CATEGORY', sortOrder: 4, iconType: 'schedule' },
      { name: '5. Delay Analysis', folderType: 'CATEGORY', sortOrder: 5, iconType: 'schedule' },
      { name: '6. Progress Tracking', folderType: 'CATEGORY', sortOrder: 6, iconType: 'schedule' },
    ],
  },

  // 14. COST ACCOUNTS
  {
    name: '14. COST ACCOUNTS',
    folderType: 'TOP_LEVEL',
    sortOrder: 14,
    badgeColor: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/20',
    iconType: 'cost',
    children: [
      { name: '1. Project Budget', folderType: 'CATEGORY', sortOrder: 1, iconType: 'cost' },
      { name: '2. Contractor Value', folderType: 'CATEGORY', sortOrder: 2, iconType: 'cost' },
      { name: '3. RA Bills', folderType: 'CATEGORY', sortOrder: 3, iconType: 'cost' },
      { name: '4. Payment Bills (or) Certificates', folderType: 'CATEGORY', sortOrder: 4, iconType: 'cost' },
      { name: '5. Variations', folderType: 'CATEGORY', sortOrder: 5, iconType: 'cost' },
      { name: '6. Additional Items', folderType: 'CATEGORY', sortOrder: 6, iconType: 'cost' },
      { name: '7. Cost Report', folderType: 'CATEGORY', sortOrder: 7, iconType: 'cost' },
      { name: '8. Final Account', folderType: 'CATEGORY', sortOrder: 8, iconType: 'cost' },
    ],
  },

  // 15. STATUTORY APPROVALS
  {
    name: '15. STATUTORY APPROVALS',
    folderType: 'TOP_LEVEL',
    sortOrder: 15,
    badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    iconType: 'approval',
    children: [
      { name: '1. Building Approval', folderType: 'CATEGORY', sortOrder: 1, iconType: 'approval' },
      { name: '2. Planning Approval', folderType: 'CATEGORY', sortOrder: 2, iconType: 'approval' },
      { name: '3. Fire Approval', folderType: 'CATEGORY', sortOrder: 3, iconType: 'approval' },
      { name: '4. Electrical Approval', folderType: 'CATEGORY', sortOrder: 4, iconType: 'approval' },
      { name: '5. Lift Approval', folderType: 'CATEGORY', sortOrder: 5, iconType: 'approval' },
      { name: '6. Pollution Control', folderType: 'CATEGORY', sortOrder: 6, iconType: 'approval' },
      { name: '7. Environmental', folderType: 'CATEGORY', sortOrder: 7, iconType: 'approval' },
      { name: '8. Water', folderType: 'CATEGORY', sortOrder: 8, iconType: 'approval' },
      { name: '9. Sewage', folderType: 'CATEGORY', sortOrder: 9, iconType: 'approval' },
      { name: '10. Hospital Specific Approvals', folderType: 'CATEGORY', sortOrder: 10, iconType: 'approval' },
      { name: '11. Other Approvals', folderType: 'CATEGORY', sortOrder: 11, iconType: 'approval' },
    ],
  },

  // 16. TESTING & COMMISSIONING
  {
    name: '16. TESTING & COMMISSIONING',
    folderType: 'TOP_LEVEL',
    sortOrder: 16,
    badgeColor: 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-600/20',
    iconType: 'report',
    children: [
      { name: 'Automation', folderType: 'CATEGORY', sortOrder: 1, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Communication', folderType: 'CATEGORY', sortOrder: 2, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Electrical', folderType: 'CATEGORY', sortOrder: 3, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Fire Fighting', folderType: 'CATEGORY', sortOrder: 4, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'HVAC', folderType: 'CATEGORY', sortOrder: 5, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'IDEC', folderType: 'CATEGORY', sortOrder: 6, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Medical Gas', folderType: 'CATEGORY', sortOrder: 7, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Other Services', folderType: 'CATEGORY', sortOrder: 8, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Plumbing', folderType: 'CATEGORY', sortOrder: 9, children: TESTING_COMMISSIONING_SUBFOLDERS },
      { name: 'Pneumatic', folderType: 'CATEGORY', sortOrder: 10, children: TESTING_COMMISSIONING_SUBFOLDERS },
    ],
  },

  // 17. HANDOVER
  {
    name: '17. HANDOVER',
    folderType: 'TOP_LEVEL',
    sortOrder: 17,
    badgeColor: 'bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-600/20',
    iconType: 'handover',
    children: [
      { name: 'AS-BUILT-AUTOMATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 1, iconType: 'drawing' },
      { name: 'AS-BUILT-COMMUNICATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 2, iconType: 'drawing' },
      { name: 'AS-BUILT-ELECTRICAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 3, iconType: 'drawing' },
      { name: 'AS-BUILT-FIRE FIGHTING DRAWINGS', folderType: 'CATEGORY', sortOrder: 4, iconType: 'drawing' },
      { name: 'AS-BUILT-HVAC DRAWINGS', folderType: 'CATEGORY', sortOrder: 5, iconType: 'drawing' },
      { name: 'AS-BUILT-IDEC DRAWINGS', folderType: 'CATEGORY', sortOrder: 6, iconType: 'drawing' },
      { name: 'AS-BUILT-INTERIOR DRAWINGS', folderType: 'CATEGORY', sortOrder: 7, iconType: 'drawing' },
      { name: 'AS-BUILT-MEDICAL GAS DRAWINGS', folderType: 'CATEGORY', sortOrder: 8, iconType: 'drawing' },
      { name: 'AS-BUILT-OTHER SERVICE DRAWINGS', folderType: 'CATEGORY', sortOrder: 9, iconType: 'drawing' },
      { name: 'AS-BUILT-PLUMBING DRAWINGS', folderType: 'CATEGORY', sortOrder: 10, iconType: 'drawing' },
      { name: 'AS-BUILT-PNEUMATIC DRAWINGS', folderType: 'CATEGORY', sortOrder: 11, iconType: 'drawing' },
      { name: 'AS-BUILT-ARCHITECTURAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 12, iconType: 'drawing' },
      { name: 'AS-BUILT-STRUCTURAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 13, iconType: 'drawing' },
      { name: 'FINAL HANDOVER', folderType: 'CATEGORY', sortOrder: 14, iconType: 'handover' },
      { name: 'OPERATIONAL & MAINTENANCE MANUALS', folderType: 'CATEGORY', sortOrder: 15, iconType: 'document' },
      { name: 'TEST CERTIFICATES', folderType: 'CATEGORY', sortOrder: 16, iconType: 'approval' },
      { name: 'TRAINING RECORDS', folderType: 'CATEGORY', sortOrder: 17, iconType: 'report' },
      { name: 'WARRANTIES', folderType: 'CATEGORY', sortOrder: 18, iconType: 'approval' },
    ],
  },
];

/**
 * Helper to generate in-memory mock folders if running in offline / local-storage fallback mode
 */
export function generateLocalHierarchy(projectId: string, projectName: string): ProjectFolderItem[] {
  const result: ProjectFolderItem[] = [];
  let seq = 1;

  // Root
  const rootId = `FLDR-${seq++}`;
  result.push({
    id: rootId,
    projectId,
    parentFolderId: null,
    name: projectName,
    folderType: 'ROOT',
    sortOrder: 0,
    isSystemFolder: true,
    createdBy: 'System',
  });

  const traverse = (nodes: FolderNodeTemplate[], parentId: string) => {
    for (const node of nodes) {
      const currentId = `FLDR-${seq++}`;
      result.push({
        id: currentId,
        projectId,
        parentFolderId: parentId,
        name: node.name,
        folderType: node.folderType || 'CATEGORY',
        sortOrder: node.sortOrder || 0,
        isSystemFolder: true,
        createdBy: 'System',
      });

      if (node.children && node.children.length > 0) {
        traverse(node.children, currentId);
      }
    }
  };

  traverse(STANDARD_PROJECT_FOLDER_TEMPLATE, rootId);
  return result;
}
