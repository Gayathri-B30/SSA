// Hospital Requirement Capture & Department Room Selector Data Catalog (Annexure A)
// Based on SSA ERP Specifications Document v1.0

export interface HospitalModuleItem {
  id: string
  section: string // e.g. A.1 Front of House, A.2 OPD, A.4 Diagnostics, etc.
  name: string
  isCore?: boolean
  rooms: string[]
  defaultSelected?: boolean
  category: 'Public' | 'OPD' | 'SuperSpeciality' | 'Diagnostics' | 'Radiotherapy' | 'Emergency' | 'ICU' | 'OT' | 'Wards' | 'Admin' | 'Support' | 'Engineering' | 'Services'
  estAreaSqFt: number // Estimated base area per module in sq.ft
}

export const HOSPITAL_ANNEXURE_CATALOG: HospitalModuleItem[] = [
  // A.1 Front-of-House & Public Areas (core)
  { id: 'MOD-A1-1', section: 'A.1 Front-of-House', name: 'Entrance Area', isCore: true, defaultSelected: true, category: 'Public', estAreaSqFt: 1200, rooms: ['Entrance lobby', 'Trolley park', 'General waiting', 'Public utilities'] },
  { id: 'MOD-A1-2', section: 'A.1 Front-of-House', name: 'Reception & Counters', isCore: true, defaultSelected: true, category: 'Public', estAreaSqFt: 800, rooms: ['Enquiry counter', 'Registration counter', 'Queuing tracks', 'Records', 'Admission counter', 'Discharge counter', 'Cash counter', 'Health-insurance counter'] },
  { id: 'MOD-A1-3', section: 'A.1 Front-of-House', name: 'Pharmacy Block', isCore: true, defaultSelected: true, category: 'Public', estAreaSqFt: 1500, rooms: ['Storage & disbursing hall', 'Bulk storage', 'Cold room', 'Expiry medicine room', 'Cut-strip sorting room', 'Pharmacist office'] },
  { id: 'MOD-A1-4', section: 'A.1 Front-of-House', name: 'Commercial Arcade', isCore: false, defaultSelected: false, category: 'Public', estAreaSqFt: 1000, rooms: ['Temple/Prayer room', 'Snack counter', 'Book shop', 'Gift shop', 'ATM'] },
  { id: 'MOD-A1-5', section: 'A.1 Front-of-House', name: 'Control Rooms & Security', isCore: true, defaultSelected: true, category: 'Public', estAreaSqFt: 600, rooms: ['Security control', 'Housekeeping hub', 'Fire safety room', 'Water & Electrical control', 'Ambulance desk'] },

  // A.2 OPD Speciality Blocks
  { id: 'MOD-A2-1', section: 'A.2 OPD Specialities', name: 'General Medicine OPD', isCore: true, defaultSelected: true, category: 'OPD', estAreaSqFt: 900, rooms: ['Standard OPD consultation set', 'Examination cubicles', 'Sub-waiting'] },
  { id: 'MOD-A2-2', section: 'A.2 OPD Specialities', name: 'General Surgery OPD', isCore: true, defaultSelected: true, category: 'OPD', estAreaSqFt: 1400, rooms: ['Male & female dressing rooms', 'Endoscopy room', 'Minor OT', 'Change room', 'Sluice room'] },
  { id: 'MOD-A2-3', section: 'A.2 OPD Specialities', name: 'Ophthalmology Clinic', isCore: false, defaultSelected: true, category: 'OPD', estAreaSqFt: 1100, rooms: ['Refraction room', 'Orthopty room', 'Treatment room', 'Dark room', 'Dressing room'] },
  { id: 'MOD-A2-4', section: 'A.2 OPD Specialities', name: 'ENT Clinic', isCore: false, defaultSelected: true, category: 'OPD', estAreaSqFt: 850, rooms: ['Audiometry lab', 'ENG lab', 'Speech therapy room'] },
  { id: 'MOD-A2-5', section: 'A.2 OPD Specialities', name: 'Dental Suite', isCore: false, defaultSelected: true, category: 'OPD', estAreaSqFt: 1200, rooms: ['Dental chairs', 'Dental laboratory', 'Dental X-ray', 'Dental surgery', 'Prosthetic dentistry'] },
  { id: 'MOD-A2-6', section: 'A.2 OPD Specialities', name: 'Obstetrics & Gynaecology', isCore: true, defaultSelected: true, category: 'OPD', estAreaSqFt: 1800, rooms: ['D&C room', 'IVF clinic', 'Antenatal clinic', 'Family welfare clinic', 'Ultrasound room', 'Colposcopy room'] },
  { id: 'MOD-A2-7', section: 'A.2 OPD Specialities', name: 'Paediatrics OPD', isCore: true, defaultSelected: true, category: 'OPD', estAreaSqFt: 1300, rooms: ['Play area', 'Child welfare & immunization clinic', 'Child guidance', 'Rehabilitation (speech/OT)', 'Counselling'] },
  { id: 'MOD-A2-8', section: 'A.2 OPD Specialities', name: 'Orthopaedics Clinic', isCore: true, defaultSelected: true, category: 'OPD', estAreaSqFt: 1000, rooms: ['Plaster room', 'Plaster-cutting room', 'Splint store'] },

  // A.4 Diagnostics Modalities
  { id: 'MOD-A4-1', section: 'A.4 Diagnostics', name: 'X-Ray & Radiography', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 1600, rooms: ['DR / X-ray rooms', 'IITV & fluoroscopy room', '60 mA mobile X-ray', 'Change rooms', 'Barium preparation', 'CR room'] },
  { id: 'MOD-A4-2', section: 'A.4 Diagnostics', name: 'Ultrasound Suite', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 800, rooms: ['Scan rooms', 'Change rooms', 'Toilets', 'Sub-waiting'] },
  { id: 'MOD-A4-3', section: 'A.4 Diagnostics', name: 'CT Scan Suite', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 1500, rooms: ['CT room', 'Control room', 'UPS room', 'Change room', 'Store'] },
  { id: 'MOD-A4-4', section: 'A.4 Diagnostics', name: 'MRI Suite (RF-Shielded)', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 2200, rooms: ['RF-shielded Scan room', 'Control room', 'UPS room', 'Machine room', 'Change room', 'Store'] },
  { id: 'MOD-A4-5', section: 'A.4 Diagnostics', name: 'Clinical Pathology Labs', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 2500, rooms: ['Sample collection', 'Biochemistry', 'Microbiology', 'Pathology', 'Histopathology', 'Cytology', 'Washing & disinfection', 'Reagent store'] },
  { id: 'MOD-A4-6', section: 'A.4 Diagnostics', name: 'Blood Bank', isCore: true, defaultSelected: true, category: 'Diagnostics', estAreaSqFt: 1800, rooms: ['Bleeding room', 'Apheresis room', 'Refreshment rest room', 'Blood testing', 'Blood storage', 'Doctors rest room'] },

  // A.7 Critical Care (ICUs)
  { id: 'MOD-A7-1', section: 'A.7 Critical Care', name: 'MICU & SICU (Intensive Care)', isCore: true, defaultSelected: true, category: 'ICU', estAreaSqFt: 3500, rooms: ['Patient beds / intensive-care beds', 'Clean utility & equipment park', 'Dirty utility / sluice', 'Formula room', 'Attendant waiting'] },
  { id: 'MOD-A7-2', section: 'A.7 Critical Care', name: 'CCU (Cardiac Care Unit)', isCore: true, defaultSelected: true, category: 'ICU', estAreaSqFt: 2800, rooms: ['Cardiac intensive beds', 'Central monitoring desk', 'Clean utility', 'Doctors duty'] },
  { id: 'MOD-A7-3', section: 'A.7 Critical Care', name: 'Neonatal ICU (NICU)', isCore: true, defaultSelected: true, category: 'ICU', estAreaSqFt: 2200, rooms: ['Clean-baby room', 'Infected-baby room', 'Ventilator room', 'Mothers feeding room', 'Formula room'] },

  // A.8 Operation Theatre & Delivery Suites
  { id: 'MOD-A8-1', section: 'A.8 OT & Delivery', name: 'Modular OT Suites (4 Suites)', isCore: true, defaultSelected: true, category: 'OT', estAreaSqFt: 4800, rooms: ['Main operating theatres', 'Septic OT', 'Scrub / gowning', 'Instrument trolley layup', 'Sterilization', 'Pre-op & Post-op recovery'] },
  { id: 'MOD-A8-2', section: 'A.8 OT & Delivery', name: 'Delivery Suite & Labour Rooms', isCore: true, defaultSelected: true, category: 'OT', estAreaSqFt: 2400, rooms: ['Labour rooms', 'Pre-labour beds', 'Eclampsia beds', 'Nursery baby bath', 'Change rooms'] },

  // A.11 Clinical Support Services
  { id: 'MOD-A11-1', section: 'A.11 Support Services', name: 'CSSD (Central Sterile Supply)', isCore: true, defaultSelected: true, category: 'Support', estAreaSqFt: 2000, rooms: ['Dirty receipt', 'Washing / disinfection', 'Assembly / packing', 'Sterilization', 'Sterile storage', 'ETO room'] },
  { id: 'MOD-A11-2', section: 'A.11 Support Services', name: 'Hospital Kitchen & Dietary', isCore: true, defaultSelected: true, category: 'Support', estAreaSqFt: 2500, rooms: ['Bulk storage', 'Refrigerators / cool rooms', 'Cooking & baking', 'Reheating & packing', 'Pot wash', 'Dietician office'] },
  { id: 'MOD-A11-3', section: 'A.11 Support Services', name: 'Hospital Laundry', isCore: true, defaultSelected: true, category: 'Support', estAreaSqFt: 1600, rooms: ['Dirty receipt', 'Sorting & weighing', 'Washing & ironing', 'Clean storage'] },
  { id: 'MOD-A11-4', section: 'A.11 Support Services', name: 'Medical Gas Plant Room (MGPS)', isCore: true, defaultSelected: true, category: 'Support', estAreaSqFt: 1200, rooms: ['Liquid oxygen tank area', 'Landing bay', 'Manifold room', 'Compressor', 'Vacuum plant', 'Control room'] },
]

export interface HospitalAreaSummary {
  totalModulesSelected: number
  totalRoomsCaptured: number
  totalEstCarpetAreaSqFt: number
  totalEstBuiltUpAreaSqFt: number
  permissibleFsi: number
  proposedFsi: number
  fsiStatus: 'Compliant' | 'Exceeds Limit'
}

export function calculateHospitalAreaStatement(selectedModuleIds: string[]): HospitalAreaSummary {
  const selectedModules = HOSPITAL_ANNEXURE_CATALOG.filter(m => selectedModuleIds.includes(m.id))
  
  const totalModulesSelected = selectedModules.length
  const totalRoomsCaptured = selectedModules.reduce((acc, m) => acc + m.rooms.length, 0)
  const totalEstCarpetAreaSqFt = selectedModules.reduce((acc, m) => acc + m.estAreaSqFt, 0)
  
  // Built-up area is typically Carpet Area + 35% circulation & wall thickness
  const totalEstBuiltUpAreaSqFt = Math.round(totalEstCarpetAreaSqFt * 1.35)

  // Example FSI metrics for plot size of 50,000 sq.ft
  const plotArea = 50000
  const proposedFsi = parseFloat((totalEstBuiltUpAreaSqFt / plotArea).toFixed(2))
  const permissibleFsi = 3.25

  return {
    totalModulesSelected,
    totalRoomsCaptured,
    totalEstCarpetAreaSqFt,
    totalEstBuiltUpAreaSqFt,
    permissibleFsi,
    proposedFsi,
    fsiStatus: proposedFsi <= permissibleFsi ? 'Compliant' : 'Exceeds Limit',
  }
}
