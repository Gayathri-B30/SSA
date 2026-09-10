export interface FolderTemplateNode {
  name: string;
  folderType?: 'TOP_LEVEL' | 'DRAWING_CATEGORY' | 'WORKFLOW' | 'CATEGORY' | 'SUB_CATEGORY' | 'DOCUMENT' | 'CUSTOM';
  sortOrder?: number;
  children?: FolderTemplateNode[];
}

const DRAWING_WORKFLOW_CHILDREN: FolderTemplateNode[] = [
  { name: '1. Work In Progress', folderType: 'WORKFLOW', sortOrder: 1 },
  { name: '2. Shared', folderType: 'WORKFLOW', sortOrder: 2 },
  { name: '3. Archive', folderType: 'WORKFLOW', sortOrder: 3 },
];

const BOQ_SUBFOLDERS: FolderTemplateNode[] = [
  { name: 'Rate Comparison', folderType: 'SUB_CATEGORY', sortOrder: 1 },
  { name: 'Vendor Rates', folderType: 'SUB_CATEGORY', sortOrder: 2 },
];

const TESTING_COMMISSIONING_SUBFOLDERS: FolderTemplateNode[] = [
  { name: 'Commissioning Report', folderType: 'SUB_CATEGORY', sortOrder: 1 },
  { name: 'Test Report', folderType: 'SUB_CATEGORY', sortOrder: 2 },
];

export const STANDARD_PROJECT_FOLDER_TEMPLATE: FolderTemplateNode[] = [
  // 1. PROJECT INFORMATION
  {
    name: '1. PROJECT INFORMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 1,
    children: [],
  },

  // 2. SITE INFORMATION
  {
    name: '2. SITE INFORMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 2,
    children: [
      { name: '1. Site Survey Report', folderType: 'CATEGORY', sortOrder: 1 },
      { name: '2. Topographical Survey', folderType: 'CATEGORY', sortOrder: 2 },
      { name: '3. Soil Investigation Report', folderType: 'CATEGORY', sortOrder: 3 },
      { name: '4. Geotechnical Investigation', folderType: 'CATEGORY', sortOrder: 4 },
      { name: '5. Existing Drawings (if applicable)', folderType: 'CATEGORY', sortOrder: 5 },
      { name: '6. Site Photos', folderType: 'CATEGORY', sortOrder: 6 },
    ],
  },

  // 3. ARCHITECTURAL DRAWINGS
  {
    name: '3. ARCHITECTURAL DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 3,
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
    children: [
      { name: '1. Interior Layouts & False Ceiling Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 1, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '2. RCP Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 2, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '3. Furniture Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 3, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '4. Joinery Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 4, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '5. Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 5, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '6. Flooring Layout Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 6, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '7. Material Finishes Matrix', folderType: 'CATEGORY', sortOrder: 7 },
    ],
  },

  // 5. STRUCTURAL DRAWINGS
  {
    name: '5. STRUCTURAL DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 5,
    children: [
      { name: '1. Design', folderType: 'CATEGORY', sortOrder: 1 },
      { name: '2. Foundation & Center Line Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 2, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '3. Plinth & Tie Beam Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 3, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '4. Lintel & Roof Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 4, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '5. Staircase & Lift Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 5, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '6. RCC Tanks & Other Structures Detail Drawings', folderType: 'DRAWING_CATEGORY', sortOrder: 6, children: DRAWING_WORKFLOW_CHILDREN },
      { name: '7. Structural Calculations', folderType: 'CATEGORY', sortOrder: 7 },
    ],
  },

  // 6. MEP & OTHER SERVICE DRAWINGS
  {
    name: '6. MEP & OTHER SERVICE DRAWINGS',
    folderType: 'TOP_LEVEL',
    sortOrder: 6,
    children: [
      { name: 'AUTOMATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 1 },
      { name: 'COMMUNICATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 2 },
      { name: 'ELECTRICAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'FIRE FIGHTING DRAWINGS', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'HVAC DRAWINGS', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'IDEC DRAWINGS', folderType: 'CATEGORY', sortOrder: 6 },
      { name: 'MEDICAL GAS DRAWINGS', folderType: 'CATEGORY', sortOrder: 7 },
      { name: 'OTHER SERVICES', folderType: 'CATEGORY', sortOrder: 8 },
      { name: 'PLUMBING DRAWINGS', folderType: 'CATEGORY', sortOrder: 9 },
      { name: 'PNEUMATIC DRAWINGS', folderType: 'CATEGORY', sortOrder: 10 },
    ],
  },

  // 7. BOQ & ESTIMATION
  {
    name: '7. BOQ & ESTIMATION',
    folderType: 'TOP_LEVEL',
    sortOrder: 7,
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
    children: [],
  },

  // 9. CONSTRUCTION REPORTS
  {
    name: '9. CONSTRUCTION REPORTS',
    folderType: 'TOP_LEVEL',
    sortOrder: 9,
    children: [
      { name: 'Inspection Report', folderType: 'CATEGORY', sortOrder: 1 },
      { name: 'Mockup Reports', folderType: 'CATEGORY', sortOrder: 2 },
      { name: 'Progress Photos', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'QA, QC', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'Site Queries', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'Work Progress Report', folderType: 'CATEGORY', sortOrder: 6 },
    ],
  },

  // 10. SUBMITTAL APPROVALS
  {
    name: '10. SUBMITTAL APPROVALS',
    folderType: 'TOP_LEVEL',
    sortOrder: 10,
    children: [
      { name: 'Approved Documents', folderType: 'CATEGORY', sortOrder: 1 },
      { name: 'Client Approvals', folderType: 'CATEGORY', sortOrder: 2 },
      { name: 'Consultant Approvals', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'Equipment Submittals', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'Material Samples', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'Material Submittals', folderType: 'CATEGORY', sortOrder: 6 },
      { name: 'Mockup Approvals', folderType: 'CATEGORY', sortOrder: 7 },
      { name: 'Shop Drawings', folderType: 'CATEGORY', sortOrder: 8 },
      { name: 'Technical Submittals', folderType: 'CATEGORY', sortOrder: 9 },
    ],
  },

  // 11. TECHNICAL QUERIES
  {
    name: '11. TECHNICAL QUERIES',
    folderType: 'TOP_LEVEL',
    sortOrder: 11,
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
    children: [
      { name: 'Action Tracker', folderType: 'CATEGORY', sortOrder: 1 },
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
      { name: 'E-mail References', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'Meeting Notices', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'MoM', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'Transmittals', folderType: 'CATEGORY', sortOrder: 6 },
    ],
  },

  // 13. PROJECT SCHEDULE
  {
    name: '13. PROJECT SCHEDULE',
    folderType: 'TOP_LEVEL',
    sortOrder: 13,
    children: [
      { name: '1. Master Programme', folderType: 'CATEGORY', sortOrder: 1 },
      { name: '2. Baseline', folderType: 'CATEGORY', sortOrder: 2 },
      { name: '3. Updated Programme', folderType: 'CATEGORY', sortOrder: 3 },
      { name: '4. Monthly Schedule', folderType: 'CATEGORY', sortOrder: 4 },
      { name: '5. Delay Analysis', folderType: 'CATEGORY', sortOrder: 5 },
      { name: '6. Progress Tracking', folderType: 'CATEGORY', sortOrder: 6 },
    ],
  },

  // 14. COST ACCOUNTS
  {
    name: '14. COST ACCOUNTS',
    folderType: 'TOP_LEVEL',
    sortOrder: 14,
    children: [
      { name: '1. Project Budget', folderType: 'CATEGORY', sortOrder: 1 },
      { name: '2. Contractor Value', folderType: 'CATEGORY', sortOrder: 2 },
      { name: '3. RA Bills', folderType: 'CATEGORY', sortOrder: 3 },
      { name: '4. Payment Bills (or) Certificates', folderType: 'CATEGORY', sortOrder: 4 },
      { name: '5. Variations', folderType: 'CATEGORY', sortOrder: 5 },
      { name: '6. Additional Items', folderType: 'CATEGORY', sortOrder: 6 },
      { name: '7. Cost Report', folderType: 'CATEGORY', sortOrder: 7 },
      { name: '8. Final Account', folderType: 'CATEGORY', sortOrder: 8 },
    ],
  },

  // 15. STATUTORY APPROVALS
  {
    name: '15. STATUTORY APPROVALS',
    folderType: 'TOP_LEVEL',
    sortOrder: 15,
    children: [
      { name: '1. Building Approval', folderType: 'CATEGORY', sortOrder: 1 },
      { name: '2. Planning Approval', folderType: 'CATEGORY', sortOrder: 2 },
      { name: '3. Fire Approval', folderType: 'CATEGORY', sortOrder: 3 },
      { name: '4. Electrical Approval', folderType: 'CATEGORY', sortOrder: 4 },
      { name: '5. Lift Approval', folderType: 'CATEGORY', sortOrder: 5 },
      { name: '6. Pollution Control', folderType: 'CATEGORY', sortOrder: 6 },
      { name: '7. Environmental', folderType: 'CATEGORY', sortOrder: 7 },
      { name: '8. Water', folderType: 'CATEGORY', sortOrder: 8 },
      { name: '9. Sewage', folderType: 'CATEGORY', sortOrder: 9 },
      { name: '10. Hospital Specific Approvals', folderType: 'CATEGORY', sortOrder: 10 },
      { name: '11. Other Approvals', folderType: 'CATEGORY', sortOrder: 11 },
    ],
  },

  // 16. TESTING & COMMISSIONING
  {
    name: '16. TESTING & COMMISSIONING',
    folderType: 'TOP_LEVEL',
    sortOrder: 16,
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
    children: [
      { name: 'AS-BUILT-AUTOMATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 1 },
      { name: 'AS-BUILT-COMMUNICATION DRAWINGS', folderType: 'CATEGORY', sortOrder: 2 },
      { name: 'AS-BUILT-ELECTRICAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 3 },
      { name: 'AS-BUILT-FIRE FIGHTING DRAWINGS', folderType: 'CATEGORY', sortOrder: 4 },
      { name: 'AS-BUILT-HVAC DRAWINGS', folderType: 'CATEGORY', sortOrder: 5 },
      { name: 'AS-BUILT-IDEC DRAWINGS', folderType: 'CATEGORY', sortOrder: 6 },
      { name: 'AS-BUILT-INTERIOR DRAWINGS', folderType: 'CATEGORY', sortOrder: 7 },
      { name: 'AS-BUILT-MEDICAL GAS DRAWINGS', folderType: 'CATEGORY', sortOrder: 8 },
      { name: 'AS-BUILT-OTHER SERVICE DRAWINGS', folderType: 'CATEGORY', sortOrder: 9 },
      { name: 'AS-BUILT-PLUMBING DRAWINGS', folderType: 'CATEGORY', sortOrder: 10 },
      { name: 'AS-BUILT-PNEUMATIC DRAWINGS', folderType: 'CATEGORY', sortOrder: 11 },
      { name: 'AS-BUILT-ARCHITECTURAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 12 },
      { name: 'AS-BUILT-STRUCTURAL DRAWINGS', folderType: 'CATEGORY', sortOrder: 13 },
      { name: 'FINAL HANDOVER', folderType: 'CATEGORY', sortOrder: 14 },
      { name: 'OPERATIONAL & MAINTENANCE MANUALS', folderType: 'CATEGORY', sortOrder: 15 },
      { name: 'TEST CERTIFICATES', folderType: 'CATEGORY', sortOrder: 16 },
      { name: 'TRAINING RECORDS', folderType: 'CATEGORY', sortOrder: 17 },
      { name: 'WARRANTIES', folderType: 'CATEGORY', sortOrder: 18 },
    ],
  },
];
