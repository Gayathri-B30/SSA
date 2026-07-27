// Mock data for the Architectural Consultancy ERP System Super Admin Dashboard.
// To integrate with a real API, replace this service or return promises from here.

// 1. Dashboard Statistics Metrics
export interface StatMetric {
  id: string
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string // Lucide icon string lookup
}

export const initialStats: StatMetric[] = [
  { id: 'stat-employees', label: 'Total Employees', value: 148, change: '+6% vs last month', trend: 'up', icon: 'Users' },
  { id: 'stat-leads', label: 'Total Leads', value: 840, change: '+18% vs last month', trend: 'up', icon: 'Sparkles' },
  { id: 'stat-opps', label: 'Active Opportunities', value: 42, change: '+12% this week', trend: 'up', icon: 'Compass' },
  { id: 'stat-clients', label: 'Active Clients', value: 89, change: '+3% this quarter', trend: 'up', icon: 'Briefcase' },
  { id: 'stat-projects-running', label: 'Running Projects', value: 56, change: '4 started this month', trend: 'up', icon: 'Layers' },
  { id: 'stat-projects-completed', label: 'Completed Projects', value: 312, change: '10 closed last quarter', trend: 'up', icon: 'CheckCircle' },
  { id: 'stat-tasks-open', label: 'Open Tasks', value: 184, change: '-8% vs last week', trend: 'down', icon: 'ClipboardList' },
  { id: 'stat-tasks-overdue', label: 'Overdue Tasks', value: 14, change: '+2 since yesterday', trend: 'down', icon: 'AlertTriangle' },
  { id: 'stat-vendors', label: 'Active Vendors', value: 38, change: '0 changes', trend: 'neutral', icon: 'Truck' },
  { id: 'stat-assets', label: 'Assets Count', value: 524, change: '+18 audits finished', trend: 'up', icon: 'Laptop' },
  { id: 'stat-revenue', label: 'Revenue YTD', value: '₹14.2 Cr', change: '+22.4% YoY', trend: 'up', icon: 'DollarSign' },
  { id: 'stat-approvals', label: 'Pending Approvals', value: 9, change: '-3 resolved today', trend: 'down', icon: 'FileCheck' },
]

// 2. Chart Datasets
export const leadFunnelData = [
  { name: 'Initial Contact', value: 840, fill: '#830117' },
  { name: 'Meeting Scheduled', value: 512, fill: '#1F2937' },
  { name: 'Proposal Sent', value: 284, fill: '#C59D5F' },
  { name: 'Negotiation', value: 142, fill: '#6B7280' },
  { name: 'Converted', value: 89, fill: '#2E7D32' },
]

export const revenueAnalyticsData = [
  { month: 'Jan', billing: 6200000, collection: 5800000, pipeline: 8000000 },
  { month: 'Feb', billing: 7800000, collection: 7200000, pipeline: 9200000 },
  { month: 'Mar', billing: 9500000, collection: 8900000, pipeline: 11000000 },
  { month: 'Apr', billing: 8200000, collection: 8000000, pipeline: 10500000 },
  { month: 'May', billing: 11000000, collection: 10200000, pipeline: 13000000 },
  { month: 'Jun', billing: 14200000, collection: 13500000, pipeline: 16000000 },
]

export const projectProgressData = [
  { stage: 'Pre-Design', count: 8 },
  { stage: 'Concept', count: 12 },
  { stage: 'Schematic', count: 10 },
  { stage: 'Design Dev', count: 14 },
  { stage: 'Tender', count: 4 },
  { stage: 'Construction', count: 6 },
  { stage: 'As-Built', count: 2 },
]

export const resourceUtilizationData = [
  { name: 'Architecture', value: 48, fill: '#830117' },
  { name: 'Structure', value: 24, fill: '#1F2937' },
  { name: 'MEP Services', value: 20, fill: '#6B7280' },
  { name: 'BIM & Rendering', value: 36, fill: '#C59D5F' },
  { name: 'Site Operations', value: 20, fill: '#2E7D32' },
]

export const vendorPerformanceData = [
  { subject: 'BIM Modeler', A: 92, B: 85, fullMark: 100 },
  { subject: 'Structural C.', A: 88, B: 90, fullMark: 100 },
  { subject: 'HVAC Specialist', A: 76, B: 80, fullMark: 100 },
  { subject: 'MEP Consultant', A: 84, B: 82, fullMark: 100 },
  { subject: 'LIDAR Surveyor', A: 95, B: 85, fullMark: 100 },
  { subject: 'Landscape Arch', A: 90, B: 93, fullMark: 100 },
]

export const departmentPerformanceData = [
  { month: 'Jan', design: 85, site: 75, billing: 90 },
  { month: 'Feb', design: 88, site: 78, billing: 92 },
  { month: 'Mar', design: 90, site: 82, billing: 88 },
  { month: 'Apr', design: 87, site: 85, billing: 94 },
  { month: 'May', design: 93, site: 88, billing: 91 },
  { month: 'Jun', design: 95, site: 92, billing: 95 },
]

export const employeeUtilizationData = [
  { name: 'High Alloc (80-100%)', count: 65, color: '#2E7D32' },
  { name: 'Medium Alloc (50-80%)', count: 52, color: '#C59D5F' },
  { name: 'Under Alloc (<50%)', count: 21, color: '#6B7280' },
  { name: 'Unassigned (0%)', count: 10, color: '#830117' },
]

// 3. Company Setup Data
export interface CompanySetup {
  id: string
  name: string
  legalEntity: string
  gstNumber: string
  panNumber: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  email: string
  website: string
}

export const initialCompanies: CompanySetup[] = [
  {
    id: 'comp-1',
    name: 'Sundar Sundram Architects Pvt Ltd',
    legalEntity: 'Private Limited Company',
    gstNumber: '33AABCS1234D1Z2',
    panNumber: 'AABCS1234D',
    address: 'Suite 402, Pinnacle Towers, OMR Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    phone: '+91 44 4890 1200',
    email: 'contact@sundaramarchitects.com',
    website: 'https://sundaramarchitects.com',
  },
  {
    id: 'comp-2',
    name: 'SSA Consultants (Middle East)',
    legalEntity: 'Limited Liability Partnership',
    gstNumber: 'NOT-APPLICABLE',
    panNumber: 'AAACS5678F',
    address: 'Floor 12, Marina Business Bay',
    city: 'Dubai',
    state: 'Dubai',
    country: 'UAE',
    phone: '+971 4 555 8899',
    email: 'dubai@sundaramarchitects.com',
    website: 'https://sundaramarchitects.ae',
  }
]

// 4. RBAC Data
export const availableRoles = [
  'Super Admin',
  'Principal Architect',
  'Studio Director',
  'Technical Director',
  'Project Architect',
  'Architect',
  'Junior Architect',
  'Intern',
  'Consultant',
  'Site Engineer',
  'Client'
]

export const availablePermissions = [
  'Create',
  'Read',
  'Update',
  'Delete',
  'Approve',
  'Export'
]

export interface AccessMatrixRow {
  role: string
  permissions: {
    [permission: string]: boolean
  }
}

export const initialAccessMatrix: AccessMatrixRow[] = [
  {
    role: 'Super Admin',
    permissions: { Create: true, Read: true, Update: true, Delete: true, Approve: true, Export: true },
  },
  {
    role: 'Principal Architect',
    permissions: { Create: true, Read: true, Update: true, Delete: false, Approve: true, Export: true },
  },
  {
    role: 'Studio Director',
    permissions: { Create: true, Read: true, Update: true, Delete: false, Approve: true, Export: true },
  },
  {
    role: 'Technical Director',
    permissions: { Create: true, Read: true, Update: true, Delete: false, Approve: true, Export: true },
  },
  {
    role: 'Project Architect',
    permissions: { Create: true, Read: true, Update: true, Delete: false, Approve: false, Export: true },
  },
  {
    role: 'Architect',
    permissions: { Create: false, Read: true, Update: true, Delete: false, Approve: false, Export: false },
  },
  {
    role: 'Junior Architect',
    permissions: { Create: false, Read: true, Update: false, Delete: false, Approve: false, Export: false },
  },
  {
    role: 'Intern',
    permissions: { Create: false, Read: true, Update: false, Delete: false, Approve: false, Export: false },
  },
  {
    role: 'Consultant',
    permissions: { Create: false, Read: true, Update: true, Delete: false, Approve: false, Export: true },
  },
  {
    role: 'Site Engineer',
    permissions: { Create: false, Read: true, Update: true, Delete: false, Approve: false, Export: false },
  },
  {
    role: 'Client',
    permissions: { Create: false, Read: true, Update: false, Delete: false, Approve: false, Export: false },
  },
]

// 5. Employees Data
export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  designation: string
  manager: string
  joiningDate: string
  status: 'Active' | 'On Leave' | 'Suspended'
  avatar?: string
  branchId?: string
  isBranchEmployee?: boolean
}

export const initialEmployees: Employee[] = [
  { id: 'EMP-001', name: 'Sundar Sundram', email: 'sundar@sundaramarchitects.com', phone: '+91 98400 11223', department: 'Executive Office', designation: 'Principal Architect', manager: 'None', joiningDate: '2012-04-01', status: 'Active' },
  { id: 'EMP-002', name: 'Rajeev Mehta', email: 'rajeev.mehta@sundaramarchitects.com', phone: '+91 98400 44556', department: 'Studio A', designation: 'Studio Director', manager: 'Sundar Sundram', joiningDate: '2015-06-15', status: 'Active' },
  { id: 'EMP-003', name: 'Priya Ranganathan', email: 'priya.r@sundaramarchitects.com', phone: '+91 99620 99887', department: 'Structural Engineering', designation: 'Technical Director', manager: 'Sundar Sundram', joiningDate: '2016-08-01', status: 'Active' },
  { id: 'EMP-004', name: 'Ananya Deshmukh', email: 'ananya.d@sundaramarchitects.com', phone: '+91 95000 88221', department: 'Studio A', designation: 'Project Architect', manager: 'Rajeev Mehta', joiningDate: '2018-10-10', status: 'Active' },
  { id: 'EMP-005', name: 'Vikram Malhotra', email: 'vikram.m@sundaramarchitects.com', phone: '+91 98840 77665', department: 'Studio B', designation: 'Project Architect', manager: 'Rajeev Mehta', joiningDate: '2019-02-20', status: 'Active' },
  { id: 'EMP-006', name: 'Siddharth Sen', email: 'siddharth.s@sundaramarchitects.com', phone: '+91 97900 12345', department: 'BIM & Rendering', designation: 'Architect', manager: 'Ananya Deshmukh', joiningDate: '2020-07-01', status: 'Active' },
  { id: 'EMP-007', name: 'Meera Nair', email: 'meera.n@sundaramarchitects.com', phone: '+91 94440 54321', department: 'Studio A', designation: 'Junior Architect', manager: 'Ananya Deshmukh', joiningDate: '2022-09-15', status: 'Active' },
  { id: 'EMP-008', name: 'Rahul Sharma', email: 'rahul.s@sundaramarchitects.com', phone: '+91 91760 98765', department: 'MEP Services', designation: 'Consultant', manager: 'Priya Ranganathan', joiningDate: '2021-11-01', status: 'Active' },
  { id: 'EMP-009', name: 'Kunal Kapoor', email: 'kunal.k@sundaramarchitects.com', phone: '+91 98401 22334', department: 'Site Operations', designation: 'Site Engineer', manager: 'Vikram Malhotra', joiningDate: '2022-01-10', status: 'On Leave' },
  { id: 'EMP-010', name: 'Aditi Rao', email: 'aditi.r@sundaramarchitects.com', phone: '+91 90030 11224', department: 'Studio B', designation: 'Intern', manager: 'Vikram Malhotra', joiningDate: '2024-01-02', status: 'Active' },
]

// Attendance Summary
export interface AttendanceRecord {
  employeeId: string
  name: string
  present: number
  absent: number
  late: number
  percentage: number
}

export const mockAttendance: AttendanceRecord[] = [
  { employeeId: 'EMP-001', name: 'Sundar Sundram', present: 20, absent: 0, late: 0, percentage: 100 },
  { employeeId: 'EMP-002', name: 'Rajeev Mehta', present: 19, absent: 1, late: 0, percentage: 95 },
  { employeeId: 'EMP-003', name: 'Priya Ranganathan', present: 18, absent: 1, late: 1, percentage: 90 },
  { employeeId: 'EMP-004', name: 'Ananya Deshmukh', present: 20, absent: 0, late: 0, percentage: 100 },
  { employeeId: 'EMP-005', name: 'Vikram Malhotra', present: 17, absent: 2, late: 1, percentage: 85 },
  { employeeId: 'EMP-006', name: 'Siddharth Sen', present: 19, absent: 0, late: 1, percentage: 95 },
]

// Leaves Summary
export interface LeaveRequest {
  id: string
  employeeId: string
  name: string
  type: 'Casual' | 'Sick' | 'Privilege' | 'Maternity'
  startDate: string
  endDate: string
  days: number
  status: 'Pending' | 'Approved' | 'Rejected'
}

export const initialLeaves: LeaveRequest[] = [
  { id: 'LV-401', employeeId: 'EMP-009', name: 'Kunal Kapoor', type: 'Casual', startDate: '2026-06-19', endDate: '2026-06-22', days: 3, status: 'Pending' },
  { id: 'LV-402', employeeId: 'EMP-007', name: 'Meera Nair', type: 'Sick', startDate: '2026-06-15', endDate: '2026-06-16', days: 2, status: 'Approved' },
  { id: 'LV-403', employeeId: 'EMP-010', name: 'Aditi Rao', type: 'Casual', startDate: '2026-06-25', endDate: '2026-06-26', days: 2, status: 'Pending' },
  { id: 'LV-404', employeeId: 'EMP-005', name: 'Vikram Malhotra', type: 'Privilege', startDate: '2026-07-01', endDate: '2026-07-08', days: 7, status: 'Approved' },
]

// 6. CRM Module Data
export interface Lead {
  id: string
  dbId?: number
  leadName: string
  company: string
  contactPerson: string
  mobile: string
  email: string
  source: 'Website' | 'Reference' | 'Cold Call' | 'Social Media' | 'Partner'
  assignedTo: string
  status: 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Negotiation' | 'Qualified' | 'Lost'
}

export const initialLeads: Lead[] = [
  { id: 'LD-901', leadName: 'Signature IT Corridor Commercial Complex', company: 'Signature Infra Developers', contactPerson: 'Mr. Ramesh K.', mobile: '+91 94450 11223', email: 'ramesh@signatureinfra.com', source: 'Reference', assignedTo: 'Rajeev Mehta', status: 'Qualified' },
  { id: 'LD-902', leadName: 'Green Meadows Luxury Villas', company: 'Elysium Greens Group', contactPerson: 'Mrs. Shweta Singh', mobile: '+91 98410 44558', email: 'shweta@elysiumgreens.com', source: 'Website', assignedTo: 'Ananya Deshmukh', status: 'Negotiation' },
  { id: 'LD-903', leadName: 'Metro Mall Expansion Ph-2', company: 'Metro Retail Malls Ltd', contactPerson: 'Mr. John Abraham', mobile: '+91 99620 55667', email: 'j.abraham@metromalls.in', source: 'Cold Call', assignedTo: 'Vikram Malhotra', status: 'Proposal' },
  { id: 'LD-904', leadName: 'Oakwood Premium Residences', company: 'Oakwood Realty', contactPerson: 'Mr. Varun Dhawan', mobile: '+91 95000 11334', email: 'varun@oakwoodrealty.com', source: 'Social Media', assignedTo: 'Ananya Deshmukh', status: 'Meeting' },
  { id: 'LD-905', leadName: 'Technopark SEZ Masterplan', company: 'Kochi IT Hub Corp', contactPerson: 'Ms. Susan Verghese', mobile: '+91 97900 88990', email: 'susan@kochithub.org', source: 'Partner', assignedTo: 'Rajeev Mehta', status: 'New' },
]

export interface Opportunity {
  id: string
  leadId: string
  leadName: string
  company: string
  opportunityValue: number
  probability: number // Percentage
  expectedClosureDate: string
  stage: 'Proposal Preparation' | 'Presentation' | 'Contract Negotiation' | 'Verbal Agreement'
}

export const initialOpportunities: Opportunity[] = [
  { id: 'OPP-301', leadId: 'LD-901', leadName: 'Signature IT Corridor Commercial Complex', company: 'Signature Infra Developers', opportunityValue: 8500000, probability: 90, expectedClosureDate: '2026-06-30', stage: 'Contract Negotiation' },
  { id: 'OPP-302', leadId: 'LD-902', leadName: 'Green Meadows Luxury Villas', company: 'Elysium Greens Group', opportunityValue: 12000000, probability: 75, expectedClosureDate: '2026-07-15', stage: 'Proposal Preparation' },
  { id: 'OPP-303', leadId: 'LD-903', leadName: 'Metro Mall Expansion Ph-2', company: 'Metro Retail Malls Ltd', opportunityValue: 4500000, probability: 50, expectedClosureDate: '2026-08-01', stage: 'Presentation' },
]

export interface Client {
  id: string
  clientName: string
  company: string
  mobile: string
  email: string
  contractValue: number
  contractStatus: 'Active' | 'Completed' | 'Pending Renewal' | 'Terminated'
  projectsCount: number
}

export const initialClients: Client[] = [
  { id: 'CL-101', clientName: 'Gokul Ramakrishnan', company: 'GR Prestige Projects', mobile: '+91 99620 12001', email: 'gokul@grprestige.in', contractValue: 25000000, contractStatus: 'Active', projectsCount: 3 },
  { id: 'CL-102', clientName: 'Dr. Archana Sen', company: 'Fortis Health City Hub', mobile: '+91 98400 66881', email: 'asen@fortis.com', contractValue: 18000000, contractStatus: 'Active', projectsCount: 2 },
  { id: 'CL-103', clientName: 'Kapil Aggarwal', company: 'Nexus Warehousing', mobile: '+91 95000 88220', email: 'kapil@nexuswarehouses.com', contractValue: 8500000, contractStatus: 'Completed', projectsCount: 1 },
  { id: 'CL-104', clientName: 'Farhan Akhtar', company: 'Zoya Creative Studios', mobile: '+91 98840 99882', email: 'farhan@zoyacreative.com', contractValue: 14500000, contractStatus: 'Pending Renewal', projectsCount: 1 },
]

// 7. Projects Data
export interface Project {
  id: string
  projectCode: string
  projectName: string
  client: string
  location: string
  projectType: 'Commercial' | 'Residential' | 'Healthcare' | 'Industrial' | 'Institutional' | 'Hospitality'
  siteArea: string // Sq.Ft or Acres
  builtUpArea: string
  budget: number
  timeline: string // Start to End
  status: 'Pre Design' | 'Concept' | 'Schematic' | 'Design Development' | 'Tender' | 'Construction' | 'As Built'
  progress: number // Percentage
}

export const initialProjects: Project[] = [
  {
    id: 'PRJ-101',
    projectCode: 'SSA-CH-GR01',
    projectName: 'GR Heights IT Tech Park',
    client: 'GR Prestige Projects',
    location: 'Sholinganallur, Chennai',
    projectType: 'Commercial',
    siteArea: '4.5 Acres',
    builtUpArea: '4,50,000 Sq.Ft',
    budget: 85000000,
    timeline: 'Jan 2025 - Dec 2027',
    status: 'Construction',
    progress: 45,
  },
  {
    id: 'PRJ-102',
    projectCode: 'SSA-BLR-FH02',
    projectName: 'Fortis Oncology Wing expansion',
    client: 'Fortis Health City Hub',
    location: 'Bannerghatta Road, Bangalore',
    projectType: 'Healthcare',
    siteArea: '1.2 Acres',
    builtUpArea: '85,000 Sq.Ft',
    budget: 38000000,
    timeline: 'Jun 2025 - Mar 2027',
    status: 'Design Development',
    progress: 25,
  },
  {
    id: 'PRJ-103',
    projectCode: 'SSA-MUM-ZS03',
    projectName: 'Zoya Office Complex',
    client: 'Zoya Creative Studios',
    location: 'Andheri West, Mumbai',
    projectType: 'Commercial',
    siteArea: '0.8 Acres',
    builtUpArea: '32,000 Sq.Ft',
    budget: 15000000,
    timeline: 'Aug 2025 - Sep 2026',
    status: 'Concept',
    progress: 15,
  },
  {
    id: 'PRJ-104',
    projectCode: 'SSA-COI-NW04',
    projectName: 'Nexus Logistics Hub',
    client: 'Nexus Warehousing',
    location: 'Sulur, Coimbatore',
    projectType: 'Industrial',
    siteArea: '12.0 Acres',
    builtUpArea: '1,80,000 Sq.Ft',
    budget: 22000000,
    timeline: 'Mar 2024 - Apr 2025',
    status: 'As Built',
    progress: 100,
  },
  {
    id: 'PRJ-105',
    projectCode: 'SSA-DEL-LD901',
    projectName: 'Signature Commercial IT Hub',
    client: 'Signature Infra Developers',
    location: 'Noida Sec 62, NCR',
    projectType: 'Commercial',
    siteArea: '3.0 Acres',
    builtUpArea: '2,80,000 Sq.Ft',
    budget: 72000000,
    timeline: 'Jul 2026 - Dec 2028',
    status: 'Pre Design',
    progress: 5,
  }
]

// 8. Task Data
export interface Task {
  id: string
  taskName: string
  assignedTo: string // Employee Name
  assignedToId: string
  priority: 'High' | 'Medium' | 'Low'
  startDate: string
  dueDate: string
  status: 'Backlog' | 'In Progress' | 'Under Review' | 'Done'
  progress: number // Percentage
  projectCode: string
}

export const initialTasks: Task[] = [
  { id: 'TSK-1001', taskName: 'Prepare Schematic Site Plan', assignedTo: 'Siddharth Sen', assignedToId: 'EMP-006', priority: 'High', startDate: '2026-06-15', dueDate: '2026-06-20', status: 'In Progress', progress: 60, projectCode: 'SSA-CH-GR01' },
  { id: 'TSK-1002', taskName: 'Design Review for Lift Core MEP Coordinates', assignedTo: 'Rahul Sharma', assignedToId: 'EMP-008', priority: 'High', startDate: '2026-06-18', dueDate: '2026-06-22', status: 'Under Review', progress: 90, projectCode: 'SSA-BLR-FH02' },
  { id: 'TSK-1003', taskName: 'BIM Model Update - Rev 2', assignedTo: 'Siddharth Sen', assignedToId: 'EMP-006', priority: 'Medium', startDate: '2026-06-10', dueDate: '2026-06-18', status: 'Done', progress: 100, projectCode: 'SSA-CH-GR01' },
  { id: 'TSK-1004', taskName: 'Client Brief Compilation', assignedTo: 'Aditi Rao', assignedToId: 'EMP-010', priority: 'Low', startDate: '2026-06-17', dueDate: '2026-06-25', status: 'Backlog', progress: 0, projectCode: 'SSA-MUM-ZS03' },
  { id: 'TSK-1005', taskName: 'Foundation Site Inspection Report', assignedTo: 'Kunal Kapoor', assignedToId: 'EMP-009', priority: 'High', startDate: '2026-06-12', dueDate: '2026-06-17', status: 'Done', progress: 100, projectCode: 'SSA-CH-GR01' },
  { id: 'TSK-1006', taskName: 'Facade Detail Renderings', assignedTo: 'Siddharth Sen', assignedToId: 'EMP-006', priority: 'Medium', startDate: '2026-06-20', dueDate: '2026-06-28', status: 'Backlog', progress: 10, projectCode: 'SSA-MUM-ZS03' },
  { id: 'TSK-1007', taskName: 'Tender Drawing Checklist Check', assignedTo: 'Ananya Deshmukh', assignedToId: 'EMP-004', priority: 'High', startDate: '2026-06-21', dueDate: '2026-06-26', status: 'In Progress', progress: 30, projectCode: 'SSA-BLR-FH02' },
]

// 9. Resource Allocation
export interface ResourceAllocation {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  projectId: string
  projectName: string
  allocationPercentage: number
  weeklyHours: number
  budgetAllocation: number // Rupees
}

export const initialAllocations: ResourceAllocation[] = [
  { id: 'AL-201', employeeId: 'EMP-004', employeeName: 'Ananya Deshmukh', designation: 'Project Architect', projectId: 'PRJ-101', projectName: 'GR Heights IT Tech Park', allocationPercentage: 60, weeklyHours: 24, budgetAllocation: 250000 },
  { id: 'AL-202', employeeId: 'EMP-004', employeeName: 'Ananya Deshmukh', designation: 'Project Architect', projectId: 'PRJ-102', projectName: 'Fortis Oncology Wing expansion', allocationPercentage: 40, weeklyHours: 16, budgetAllocation: 150000 },
  { id: 'AL-203', employeeId: 'EMP-006', employeeName: 'Siddharth Sen', designation: 'Architect', projectId: 'PRJ-101', projectName: 'GR Heights IT Tech Park', allocationPercentage: 100, weeklyHours: 40, budgetAllocation: 200000 },
  { id: 'AL-204', employeeId: 'EMP-008', employeeName: 'Rahul Sharma', designation: 'Consultant', projectId: 'PRJ-102', projectName: 'Fortis Oncology Wing expansion', allocationPercentage: 50, weeklyHours: 20, budgetAllocation: 180000 },
  { id: 'AL-205', employeeId: 'EMP-010', employeeName: 'Aditi Rao', designation: 'Intern', projectId: 'PRJ-103', projectName: 'Zoya Office Complex', allocationPercentage: 80, weeklyHours: 32, budgetAllocation: 50000 },
]

// 10. Vendor & Contractor Data
export interface Vendor {
  id: string
  vendorName: string
  category: 'BIM services' | 'Structural Consultant' | 'MEP Consultant' | 'LIDAR Surveying' | 'HVAC Expert' | 'Geotechnical Survey' | 'Landscape consultant'
  contactPerson: string
  mobile: string
  email: string
  approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected'
  rating: number // 1 to 5 stars
}

export const initialVendors: Vendor[] = [
  { id: 'VEN-501', vendorName: 'Apex BIM Solutions Ltd', category: 'BIM services', contactPerson: 'Mr. Arvind Swamy', mobile: '+91 98450 66112', email: 'arvind@apexbim.com', approvalStatus: 'Approved', rating: 4.8 },
  { id: 'VEN-502', vendorName: 'Vikas Structural Labs', category: 'Structural Consultant', contactPerson: 'Dr. Vikas Gowda', mobile: '+91 99000 88220', email: 'vgowda@vikaslabs.in', approvalStatus: 'Approved', rating: 4.5 },
  { id: 'VEN-503', vendorName: 'EcoAir HVAC Engineering', category: 'HVAC Expert', contactPerson: 'Mr. Salim Merchant', mobile: '+91 97410 55661', email: 'salim@ecoairhvac.com', approvalStatus: 'Pending Approval', rating: 3.8 },
  { id: 'VEN-504', vendorName: 'Matrix MEP Consultancies', category: 'MEP Consultant', contactPerson: 'Mrs. Rekha Iyer', mobile: '+91 98841 22330', email: 'rekha@matrixmep.com', approvalStatus: 'Approved', rating: 4.2 },
  { id: 'VEN-505', vendorName: 'Vanguard Geospatial Surveys', category: 'Geotechnical Survey', contactPerson: 'Mr. Mathew Thomas', mobile: '+91 90030 99881', email: 'm.thomas@vanguardgeo.com', approvalStatus: 'Rejected', rating: 2.5 },
]

// 11. Inventory & Assets
export interface Asset {
  id: string
  assetId: string
  assetName: string
  assetType: 'Workstation' | 'Server' | 'VR Headset' | 'Plotting Device' | 'Tablet' | 'BIM Software License'
  department: string
  assignedTo: string
  purchaseDate: string
  warrantyDate: string
  status: 'Assigned' | 'In Stock' | 'Under Repair' | 'Retired'
}

export const initialAssets: Asset[] = [
  { id: 'AST-701', assetId: 'SSA-WS-004', assetName: 'Precision 7920 Workstation', assetType: 'Workstation', department: 'BIM & Rendering', assignedTo: 'Siddharth Sen', purchaseDate: '2024-03-12', warrantyDate: '2027-03-12', status: 'Assigned' },
  { id: 'AST-702', assetId: 'SSA-SRV-02', assetName: 'PowerEdge T550 Core Server', assetType: 'Server', department: 'IT Operations', assignedTo: 'None', purchaseDate: '2023-08-01', warrantyDate: '2026-08-01', status: 'In Stock' },
  { id: 'AST-703', assetId: 'SSA-VR-01', assetName: 'Oculus Quest Pro 256GB', assetType: 'VR Headset', department: 'Studio A', assignedTo: 'Ananya Deshmukh', purchaseDate: '2025-01-10', warrantyDate: '2026-01-10', status: 'Assigned' },
  { id: 'AST-704', assetId: 'SSA-PLT-01', assetName: 'HP DesignJet Z9 Wide Plotter', assetType: 'Plotting Device', department: 'Admin Office', assignedTo: 'None', purchaseDate: '2022-11-20', warrantyDate: '2025-11-20', status: 'Under Repair' },
  { id: 'AST-705', assetId: 'SSA-LIC-08', assetName: 'Autodesk Revit AEC Collection Subscription', assetType: 'BIM Software License', department: 'Studio B', assignedTo: 'Aditi Rao', purchaseDate: '2025-05-01', warrantyDate: '2026-05-01', status: 'Assigned' },
]

export interface MaterialStock {
  id: string
  materialName: string
  category: string
  stockLevel: number
  unit: string
  reorderPoint: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export const initialMaterials: MaterialStock[] = [
  { id: 'MAT-801', materialName: 'A0 Plotting Paper Roll (80gsm)', category: 'Plotting Supplies', stockLevel: 25, unit: 'Rolls', reorderPoint: 10, status: 'In Stock' },
  { id: 'MAT-802', materialName: 'A1 Plotting Paper Roll (120gsm)', category: 'Plotting Supplies', stockLevel: 8, unit: 'Rolls', reorderPoint: 12, status: 'Low Stock' },
  { id: 'MAT-803', materialName: 'BIM Server Fiber Connectors', category: 'Networking', stockLevel: 45, unit: 'Units', reorderPoint: 15, status: 'In Stock' },
  { id: 'MAT-804', materialName: 'Matte Finish Texture Sample Boards', category: 'Design Materials', stockLevel: 0, unit: 'Kits', reorderPoint: 5, status: 'Out of Stock' },
]

// 12. Document Control (Drawings Register)
export interface Drawing {
  id: string
  drawingNumber: string
  drawingTitle: string
  revisionNumber: string
  revisionDate: string
  preparedBy: string
  approvedBy: string
  status: 'Approved' | 'For Review' | 'Revision Required' | 'Draft'
  projectCode: string
}

export const initialDrawings: Drawing[] = [
  { id: 'DWG-901', drawingNumber: 'SSA-CH-GR01-ARC-PL-001', drawingTitle: 'Ground Floor Furniture & Partition Layout', revisionNumber: 'R2', revisionDate: '2026-06-10', preparedBy: 'Siddharth Sen', approvedBy: 'Ananya Deshmukh', status: 'Approved', projectCode: 'SSA-CH-GR01' },
  { id: 'DWG-902', drawingNumber: 'SSA-CH-GR01-STR-FD-005', drawingTitle: 'Foundation Tie Beam Rebar Details', revisionNumber: 'R1', revisionDate: '2026-06-12', preparedBy: 'Priya Ranganathan', approvedBy: 'Sundar Sundram', status: 'Approved', projectCode: 'SSA-CH-GR01' },
  { id: 'DWG-903', drawingNumber: 'SSA-BLR-FH02-MEP-HVAC-010', drawingTitle: 'Third Floor AHU Duct Routing Layout', revisionNumber: 'R0', revisionDate: '2026-06-17', preparedBy: 'Rahul Sharma', approvedBy: 'Rajeev Mehta', status: 'For Review', projectCode: 'SSA-BLR-FH02' },
  { id: 'DWG-904', drawingNumber: 'SSA-MUM-ZS03-ARC-EL-002', drawingTitle: 'Facade North and East Elevation Details', revisionNumber: 'R0', revisionDate: '2026-06-18', preparedBy: 'Aditi Rao', approvedBy: 'Vikram Malhotra', status: 'Revision Required', projectCode: 'SSA-MUM-ZS03' },
]

// 13. Document Templates
export interface TemplateDoc {
  id: string
  title: string
  category: 'Contract' | 'Technical' | 'Log' | 'Checklist'
  description: string
  code: string
}

export const mockTemplates: TemplateDoc[] = [
  { id: 'TMP-001', title: 'Client Brief Template', category: 'Technical', description: 'Initial requirements analysis checklist to gather project objectives, area needs, and preferences.', code: 'SSA-T-CB-01' },
  { id: 'TMP-002', title: 'Area Statement Spreadsheet', category: 'Technical', description: 'FSI calculation grid comparing proposed vs permitted ground coverage, car parks, and built-up area.', code: 'SSA-T-AS-02' },
  { id: 'TMP-003', title: 'Minutes of Meeting (MOM)', category: 'Technical', description: 'Standardized layout for listing points of discussion, action items, target dates, and assignees.', code: 'SSA-T-MOM-03' },
  { id: 'TMP-004', title: 'Site Inspection Report', category: 'Technical', description: 'Field observation report containing columns for photographs, design compliance checks, and concrete pour reviews.', code: 'SSA-T-SR-04' },
  { id: 'TMP-005', title: 'RFI Log Master sheet', category: 'Log', description: 'Request for Information tracking log for coordinating developer/contractor technical queries.', code: 'SSA-T-RFI-05' },
  { id: 'TMP-006', title: 'Submittal Log', category: 'Log', description: 'Material sample and drawing approval submittal logs for document control.', code: 'SSA-T-SL-06' },
  { id: 'TMP-007', title: 'Drawing Issue Register', category: 'Log', description: 'Transmittal sheet recording drawing numbers, revisions, scale, issue purposes, and date stamps.', code: 'SSA-T-DIR-07' },
  { id: 'TMP-008', title: 'Design Review Checklist', category: 'Checklist', description: 'Stage-wise checklist checking fire safety clearances, setback boundaries, and column grid clearances.', code: 'SSA-T-DRC-08' },
  { id: 'TMP-009', title: 'QA/QC Checklist for Drawings', category: 'Checklist', description: 'Checklist checking sheet layouts, standard layer systems, line-weights, abbreviations, and matching revisions.', code: 'SSA-T-QAC-09' },
  { id: 'TMP-010', title: 'Fee Proposal Master', category: 'Contract', description: 'Quotation template detailing phase-wise scope, fee structures (percentage vs square-footage rates), and milestones.', code: 'SSA-T-FP-10' },
  { id: 'TMP-011', title: 'Consultant Agreement Draft', category: 'Contract', description: 'Legal contract draft for hiring associate MEP, landscaping, or acoustic specialty consultants.', code: 'SSA-T-CA-11' },
  { id: 'TMP-012', title: 'Material Approval Sheet (MAS)', category: 'Checklist', description: 'Formal template to obtain principal/client approval for specific stone, wood, tile, or sanitary samples.', code: 'SSA-T-MAS-12' },
]

// 14. SOPs
export interface SopDoc {
  id: string
  title: string
  category: 'Process' | 'Technical'
  description: string
  steps: string[]
}

export const mockSops: SopDoc[] = [
  {
    id: 'SOP-001',
    title: 'Project Kickoff SOP',
    category: 'Process',
    description: 'Procedure to transition a signed fee proposal into an active structural design file.',
    steps: [
      'Create project folder under SSA Shared Drive with project code.',
      'Initialize entries in CRM, Client Portal, and Project Management list.',
      'Conduct a 30-minute kickoff meeting with the assigned Studio Director and Project Architect.',
      'Gather and upload client brief, plot contours, and site photos to archives.',
      'Email initial RFI regarding local municipal zoning rules to the client.'
    ]
  },
  {
    id: 'SOP-002',
    title: 'Drawing Issue SOP',
    category: 'Technical',
    description: 'Protocol to issue any architectural, structural, or MEP drawing to site contractors.',
    steps: [
      'Run standard QA/QC checklist on sheet title blocks and layers.',
      'Obtain structural signature from Principal Architect or Technical Director.',
      'Update the Revision block (e.g. from R1 to R2) and mark the revision date.',
      'Record in the Drawing Register, export to PDF, and upload to the Project Vault.',
      'Send formal Transmittal sheet email to site contractor, CC-ing the developer.'
    ]
  },
  {
    id: 'SOP-003',
    title: 'Client Meeting SOP',
    category: 'Process',
    description: 'Checklist for handling weekly design progress reviews with client stakeholders.',
    steps: [
      'Export latest 3D render files and floor plan blueprints 2 hours before the session.',
      'Load rendering software (Enscape/Lumion) inside the VR suite or main studio screen.',
      'Record meeting notes, comments, and approvals on drawing markups.',
      'Draft and distribute the formal Minutes of Meeting (MOM) within 24 hours.',
      'Add revised items as fresh subtasks under the Project Kanban board.'
    ]
  },
  {
    id: 'SOP-004',
    title: 'Site Visit SOP',
    category: 'Process',
    description: 'Safety and technical review guidelines for Project Architects during site checks.',
    steps: [
      'Coordinate visit with Project Manager 48 hours prior and arrange PPE.',
      'Pack printed set of GFC (Good For Construction) drawings and measurements kit.',
      'Inspect concrete reinforcement layouts or masonry layouts against structural blueprints.',
      'Take high-resolution site photos of critical column joints and beam setups.',
      'Compile site inspection report and issue site instruction log if discrepancies are found.'
    ]
  },
  {
    id: 'SOP-005',
    title: 'BIM Coordination SOP',
    category: 'Technical',
    description: 'Process to coordinate structural Revit elements with MEP ducts to prevent clashes.',
    steps: [
      'Extract weekly model files from MEP and Structural contractors by Thursday 5:00 PM.',
      'Perform collision analysis in Navisworks/BIMcollab.',
      'Assign identified clashes to specific modelers with severity indicators (High/Med/Low).',
      'Resolve critical structural-MEP clashes before generating GFC drawings.',
      'Upload coordinated federated model to project portal.'
    ]
  },
  {
    id: 'SOP-006',
    title: 'Material Approval SOP',
    category: 'Process',
    description: 'System to catalog and secure validation of finishing materials by developer representative.',
    steps: [
      'Request material samples (wood cladding, marble slabs, tiles) from vendors.',
      'Review samples under uniform studio natural light index.',
      'Create Material Approval Sheet (MAS) detailing manufacturer, specifications, and warranty.',
      'Schedule physical review meeting with client/architect to sign the MAS board.',
      'Label approved samples and store in the project archives library for reference.'
    ]
  },
  {
    id: 'SOP-007',
    title: 'File Naming SOP',
    category: 'Technical',
    description: 'Mandatory standard for all architectural and engineering computer-aided drawings (CAD/BIM).',
    steps: [
      'Use the standard format: [ProjectCode]-[Originator]-[Level]-[Discipline]-[Type]-[SeqNumber].',
      'Example: SSA_CH_GR01-ARC-L01-PL-005.dwg for First Floor Plan by Architectural team.',
      'Never use spaces or generic words like "final", "latest_updated" or "new_version".',
      'Track version numbers strictly inside the file properties metadata.'
    ]
  },
  {
    id: 'SOP-008',
    title: 'Rendering Workflow SOP',
    category: 'Technical',
    description: 'Optimized workflow for architectural visualizations using Rhino/Revit to Twinmotion/V-Ray.',
    steps: [
      'Clean up excess meshes and unused components from the model file.',
      'Export using Datasmith link or native FBX with organized material layers.',
      'Apply standard architectural light shaders (PBR textures) and environmental HDRIs.',
      'Render drafts at 1080p, inspect lighting balances with Studio Director.',
      'Queue final output rendering in 4K resolution on the rendering server.'
    ]
  }
]

// 15. Mock Notifications
export interface AppNotification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  category: 'lead' | 'project' | 'approval' | 'system'
}

export const initialNotifications: AppNotification[] = [
  { id: 'not-1', title: 'New Lead Qualified', message: 'Signature IT Corridor Complex has been qualified by Rajeev Mehta.', time: '10 mins ago', unread: true, category: 'lead' },
  { id: 'not-2', title: 'Leave Approval Requested', message: 'Kunal Kapoor submitted a Sick Leave request for 3 days.', time: '45 mins ago', unread: true, category: 'approval' },
  { id: 'not-3', title: 'Drawing uploaded', message: 'Third Floor AHU Duct Routing Layout drawing uploaded for review.', time: '2 hours ago', unread: true, category: 'project' },
  { id: 'not-4', title: 'Asset Audit Due', message: 'Workstation Dell Precision 7920 is scheduled for annual review tomorrow.', time: '5 hours ago', unread: false, category: 'system' },
  { id: 'not-5', title: 'Low Stock Alert', message: 'A1 Plotting Paper Roll is below reorder threshold.', time: '1 day ago', unread: false, category: 'system' },
]
