import { getDataSource } from './data-source';
import { UserModel } from '../../modules/auth/models/user.model';
import { CompanyModel } from '../../modules/company/models/company.model';
import { BranchModel } from '../../modules/branch/models/branch.model';
import { ProjectCategoryModel } from '../../modules/lead/models/project-category.model';
import { CategoryTemplateFieldModel } from '../../modules/lead/models/category-template-field.model';
import { DeliverableTemplateModel } from '../../modules/lead/models/deliverable-template.model';
import { LeadDeliverableModel } from '../../modules/lead/models/lead-deliverable.model';
import { IsNull } from 'typeorm';

async function seedLeadTemplates(ds: any) {
  console.log('[Seed] Seeding Lead categories...');
  const categoryRepo = ds.getRepository(ProjectCategoryModel);
  const fieldRepo = ds.getRepository(CategoryTemplateFieldModel);
  const deliverableTemplateRepo = ds.getRepository(DeliverableTemplateModel);

  // 1. Seed categories
  const categoriesData = [
    { code: 'RESIDENTIAL', name: 'Residential — Individual Homes & Apartments', description: 'Individual homes, villas, residential apartments, unit mixes, and common amenities' },
    { code: 'SCHOOLS', name: 'Schools', description: 'Academic spaces, classrooms, assembly halls, playgrounds, and board affiliation norms' },
    { code: 'INSTITUTIONAL', name: 'Institutional — Colleges, Training Centres, Community & Religious', description: 'Colleges, training centres, community halls, hostels, and campus master plans' },
    { code: 'HOSPITALS', name: 'Hospitals & Healthcare', description: 'Multispecialty clinics, ward mixes, clinical programmes, OT counts, and compliance' },
    { code: 'HOSPITALITY', name: 'Hospitality — Hotels, Resorts, Restaurants', description: 'Hotels, resorts, restaurants, guest facilities, operations, and back-of-house' },
    { code: 'COMMERCIAL', name: 'Commercial — Offices, Retail, Malls', description: 'Offices, retail complexes, shopping malls, building systems, and parking norms' },
    { code: 'INDUSTRIAL', name: 'Industrial — Factories, Warehouses, Process Plants', description: 'Factories, warehouses, process flows, utilities, storage, and factories act compliance' },
    { code: 'MIXED_USE', name: 'Mixed-Use & Other Types', description: 'Mixed-use complexes, retail+residential, shared systems, and authority treatment' }
  ];

  const categoryMap: Record<string, ProjectCategoryModel> = {};

  for (const cat of categoriesData) {
    let existing = await categoryRepo.findOne({ where: { code: cat.code } });
    if (!existing) {
      existing = categoryRepo.create(cat);
      existing = await categoryRepo.save(existing);
      console.log(`[Seed] Seeded category: ${cat.code}`);
    }
    categoryMap[cat.code] = existing;
  }

  // 2. Seed Category-Specific Fields (Section 3)
  console.log('[Seed] Seeding Category Template Fields...');
  const fieldsData: Array<{
    catCode: string;
    fieldKey: string;
    fieldName: string;
    fieldType: 'text' | 'number' | 'single-select' | 'multi-select' | 'yes-no' | 'attachment';
    fieldOptions?: string[];
    section: string;
    capturedAtStage: 'Lead' | 'Requirement Collection' | 'Client Brief';
    isRequired: boolean;
    displayOrder: number;
  }> = [
    // 3.1 Residential
    { catCode: 'RESIDENTIAL', fieldKey: 'householdSize', fieldName: 'Family Size & Composition', fieldType: 'number', section: 'Household Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 1 },
    { catCode: 'RESIDENTIAL', fieldKey: 'householdAges', fieldName: 'Occupant Ages (e.g., Seniors, Children)', fieldType: 'text', section: 'Household Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'RESIDENTIAL', fieldKey: 'liveInStaff', fieldName: 'Live-in Staff Required', fieldType: 'yes-no', section: 'Household Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'RESIDENTIAL', fieldKey: 'pets', fieldName: 'Pets & Accommodation Needs', fieldType: 'text', section: 'Household Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 4 },
    { catCode: 'RESIDENTIAL', fieldKey: 'lifestyle', fieldName: 'Lifestyle (entertaining, work-from-home, etc.)', fieldType: 'text', section: 'Household Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 5 },
    
    { catCode: 'RESIDENTIAL', fieldKey: 'bedroomCount', fieldName: 'Bedrooms Count', fieldType: 'number', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: true, displayOrder: 6 },
    { catCode: 'RESIDENTIAL', fieldKey: 'kitchenType', fieldName: 'Kitchen Type', fieldType: 'single-select', fieldOptions: ['Open', 'Closed', 'Dual'], section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'RESIDENTIAL', fieldKey: 'diningArea', fieldName: 'Dining Area Required', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'RESIDENTIAL', fieldKey: 'livingLounges', fieldName: 'Living / Family Lounges', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'RESIDENTIAL', fieldKey: 'poojaRoom', fieldName: 'Pooja Room', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'RESIDENTIAL', fieldKey: 'studyOffice', fieldName: 'Study / Home Office', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'RESIDENTIAL', fieldKey: 'homeTheatre', fieldName: 'Home Theatre / Entertainment', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'RESIDENTIAL', fieldKey: 'gym', fieldName: 'Gym Space', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'RESIDENTIAL', fieldKey: 'guestRoom', fieldName: 'Guest Room', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'RESIDENTIAL', fieldKey: 'servantRoom', fieldName: 'Servant Room', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'RESIDENTIAL', fieldKey: 'storeUtility', fieldName: 'Store / Utility Room', fieldType: 'yes-no', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },

    { catCode: 'RESIDENTIAL', fieldKey: 'parkingCount', fieldName: 'Car & Two-wheeler Parking Count', fieldType: 'number', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'RESIDENTIAL', fieldKey: 'lift', fieldName: 'Lift Required', fieldType: 'yes-no', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'RESIDENTIAL', fieldKey: 'pool', fieldName: 'Swimming Pool', fieldType: 'yes-no', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'RESIDENTIAL', fieldKey: 'gardenTerrace', fieldName: 'Garden / Terrace Garden', fieldType: 'yes-no', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'RESIDENTIAL', fieldKey: 'outdoorKitchenBarbecue', fieldName: 'Outdoor Kitchen / Barbecue', fieldType: 'yes-no', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'RESIDENTIAL', fieldKey: 'securityHomeAutomation', fieldName: 'Security & Home Automation Scope', fieldType: 'text', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 22 },
    { catCode: 'RESIDENTIAL', fieldKey: 'solarRainwater', fieldName: 'Solar & Rainwater Harvesting', fieldType: 'yes-no', section: 'Amenities & Features', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 23 },

    { catCode: 'RESIDENTIAL', fieldKey: 'vaastuComplianceLevel', fieldName: 'Vaastu Compliance Level', fieldType: 'single-select', fieldOptions: ['Strict', 'Moderate', 'Not Required'], section: 'Preferences', capturedAtStage: 'Lead', isRequired: false, displayOrder: 24 },
    { catCode: 'RESIDENTIAL', fieldKey: 'style', fieldName: 'Style Preference', fieldType: 'single-select', fieldOptions: ['Contemporary', 'Traditional', 'Minimal'], section: 'Preferences', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 25 },
    { catCode: 'RESIDENTIAL', fieldKey: 'materialFinish', fieldName: 'Material & Finish Aspirations', fieldType: 'text', section: 'Preferences', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 26 },
    { catCode: 'RESIDENTIAL', fieldKey: 'furnitureNewVsRetained', fieldName: 'Furniture Preferences', fieldType: 'single-select', fieldOptions: ['New', 'Retained', 'Mix'], section: 'Preferences', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 27 },

    { catCode: 'RESIDENTIAL', fieldKey: 'unitCount', fieldName: 'Number of Units', fieldType: 'number', section: 'Apartments (additional)', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 28 },
    { catCode: 'RESIDENTIAL', fieldKey: 'unitMix', fieldName: 'Unit Mix (1/2/3/4 BHK)', fieldType: 'text', section: 'Apartments (additional)', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 29 },
    { catCode: 'RESIDENTIAL', fieldKey: 'targetBuyerSegment', fieldName: 'Target Buyer Segment', fieldType: 'text', section: 'Apartments (additional)', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 30 },
    { catCode: 'RESIDENTIAL', fieldKey: 'commonAmenities', fieldName: 'Common Amenities (Clubhouse, Pool, Gym, etc.)', fieldType: 'text', section: 'Apartments (additional)', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 31 },
    { catCode: 'RESIDENTIAL', fieldKey: 'reraSupport', fieldName: 'RERA Registration Support', fieldType: 'yes-no', section: 'Apartments (additional)', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 32 },
    { catCode: 'RESIDENTIAL', fieldKey: 'marketingCollaterals', fieldName: 'Marketing Collaterals Needed (Brochures, Walkthroughs, etc.)', fieldType: 'text', section: 'Apartments (additional)', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 33 },

    // 3.2 Schools
    { catCode: 'SCHOOLS', fieldKey: 'boardCurriculum', fieldName: 'Board / Curriculum', fieldType: 'single-select', fieldOptions: ['State', 'CBSE', 'ICSE', 'IB', 'IGCSE'], section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'SCHOOLS', fieldKey: 'gradesRange', fieldName: 'Grades Range & Sections per Grade', fieldType: 'text', section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'SCHOOLS', fieldKey: 'studentStrength', fieldName: 'Total Student Strength (Current & Target)', fieldType: 'number', section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'SCHOOLS', fieldKey: 'coEdOrSingle', fieldName: 'Co-ed / Single', fieldType: 'single-select', fieldOptions: ['Co-ed', 'Single'], section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 4 },
    { catCode: 'SCHOOLS', fieldKey: 'dayOrBoarding', fieldName: 'Day School / Boarding', fieldType: 'single-select', fieldOptions: ['Day School', 'Boarding'], section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 5 },

    { catCode: 'SCHOOLS', fieldKey: 'classroomCount', fieldName: 'Classroom Count & Size Norms', fieldType: 'text', section: 'Academic Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'SCHOOLS', fieldKey: 'labsList', fieldName: 'Laboratory Specifications (Physics, Chemistry, Biology, etc.)', fieldType: 'multi-select', fieldOptions: ['Physics', 'Chemistry', 'Biology', 'Computer', 'Language', 'Maths'], section: 'Academic Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'SCHOOLS', fieldKey: 'library', fieldName: 'Library Space Requirements', fieldType: 'yes-no', section: 'Academic Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'SCHOOLS', fieldKey: 'smartClassroom', fieldName: 'Smart-Classroom / AV Needs', fieldType: 'yes-no', section: 'Academic Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'SCHOOLS', fieldKey: 'artMusicDanceRooms', fieldName: 'Art, Music & Dance Rooms', fieldType: 'text', section: 'Academic Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },

    { catCode: 'SCHOOLS', fieldKey: 'assemblyArea', fieldName: 'Assembly Area / Multipurpose Hall', fieldType: 'yes-no', section: 'Assembly & Sports', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'SCHOOLS', fieldKey: 'auditoriumCapacity', fieldName: 'Auditorium Capacity', fieldType: 'number', section: 'Assembly & Sports', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'SCHOOLS', fieldKey: 'playgroundsFieldEvents', fieldName: 'Playgrounds & Field Events', fieldType: 'text', section: 'Assembly & Sports', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'SCHOOLS', fieldKey: 'indoorSports', fieldName: 'Indoor Sports Spaces (Badminton, Table Tennis, etc.)', fieldType: 'text', section: 'Assembly & Sports', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'SCHOOLS', fieldKey: 'swimmingPool', fieldName: 'Swimming Pool', fieldType: 'yes-no', section: 'Assembly & Sports', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },

    { catCode: 'SCHOOLS', fieldKey: 'adminBlock', fieldName: 'Admin Block (Principal, Staff Rooms & Records)', fieldType: 'text', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'SCHOOLS', fieldKey: 'canteenKitchen', fieldName: 'Canteen & Kitchen', fieldType: 'yes-no', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'SCHOOLS', fieldKey: 'infirmary', fieldName: 'Infirmary Space', fieldType: 'yes-no', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'SCHOOLS', fieldKey: 'transportBusesParking', fieldName: 'Transport Facilities (Bus Bays & Parking)', fieldType: 'text', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'SCHOOLS', fieldKey: 'toiletsPerNorms', fieldName: 'Toilets (per Statutory Norms)', fieldType: 'yes-no', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'SCHOOLS', fieldKey: 'hostelWarden', fieldName: 'Hostel & Warden Accommodation', fieldType: 'yes-no', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'SCHOOLS', fieldKey: 'staffQuarters', fieldName: 'Staff Quarters', fieldType: 'yes-no', section: 'Support Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 22 },

    { catCode: 'SCHOOLS', fieldKey: 'affiliationNorms', fieldName: 'Affiliation Norms (Land Area, Room Sizes, etc.)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 23 },
    { catCode: 'SCHOOLS', fieldKey: 'fireNoc', fieldName: 'Fire NOC & Child Safety Compliance', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 24 },
    { catCode: 'SCHOOLS', fieldKey: 'barrierFreeAccess', fieldName: 'Barrier-Free Access (ADA/Differently-abled)', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 25 },
    { catCode: 'SCHOOLS', fieldKey: 'futureExpansion', fieldName: 'Future Expansion & Phasing Plan', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 26 },

    // 3.3 Institutional
    { catCode: 'INSTITUTIONAL', fieldKey: 'instType', fieldName: 'Institution Type', fieldType: 'single-select', fieldOptions: ['Arts & Science', 'Engineering', 'Training', 'Community Hall', 'Religious'], section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'governingBodyApprovals', fieldName: 'Governing Body Affiliations & Approvals', fieldType: 'text', section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'capacityGrowthPlan', fieldName: 'User Capacity & Growth Plan', fieldType: 'text', section: 'Institution Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'departmentsIntake', fieldName: 'Academic Departments & Student Intake', fieldType: 'text', section: 'Academic / Functional Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 4 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'classroomsSeminarHalls', fieldName: 'Classrooms, Seminar Halls, Labs & Workshops', fieldType: 'text', section: 'Academic / Functional Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 5 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'library', fieldName: 'Library & Study Areas', fieldType: 'yes-no', section: 'Academic / Functional Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'auditoriumCapacity', fieldName: 'Auditorium / Convention Hall Capacity', fieldType: 'number', section: 'Academic / Functional Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'examHalls', fieldName: 'Examination Halls', fieldType: 'text', section: 'Academic / Functional Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'hostelsCapacity', fieldName: 'Hostel Capacity & Specifications', fieldType: 'text', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'staffQuarters', fieldName: 'Staff Quarters', fieldType: 'text', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'diningKitchen', fieldName: 'Dining Hall & Kitchen', fieldType: 'yes-no', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'guestHouse', fieldName: 'Guest House Accommodation', fieldType: 'yes-no', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'adminBlock', fieldName: 'Administrative Block', fieldType: 'text', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'incubationResearch', fieldName: 'Incubation & Research Spaces', fieldType: 'text', section: 'Residential & Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'parkingSpaces', fieldName: 'Parking Space Capacity (Buses, Cars, Two-Wheelers)', fieldType: 'text', section: 'Site & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'campusPhasingMasterPlan', fieldName: 'Campus Phasing & Master Plan Requirements', fieldType: 'text', section: 'Site & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'sportsFacilities', fieldName: 'Sports & Recreation Facilities', fieldType: 'text', section: 'Site & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'securityCompound', fieldName: 'Security Infrastructure & Compound Wall', fieldType: 'text', section: 'Site & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'statutoryBodyNorms', fieldName: 'Statutory Body Norms (Space per Student, Lab specifications)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 19 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'fireNoc', fieldName: 'Fire Safety NOC Status', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 20 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'barrierFreeAccess', fieldName: 'Barrier-Free Access (ADA/Differently-abled)', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 21 },
    { catCode: 'INSTITUTIONAL', fieldKey: 'pcbSTP', fieldName: 'Pollution Control Board Consent (Hostel STP, etc.)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 22 },

    // 3.4 Hospitals & Healthcare
    { catCode: 'HOSPITALS', fieldKey: 'facilityType', fieldName: 'Facility Type', fieldType: 'single-select', fieldOptions: ['Multispecialty', 'Single Specialty', 'Nursing Home', 'Clinic', 'Diagnostic Centre'], section: 'Facility Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'HOSPITALS', fieldKey: 'bedCount', fieldName: 'Bed Count & Mix (General, Semi-Private, ICU, etc.)', fieldType: 'text', section: 'Facility Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 2 },
    { catCode: 'HOSPITALS', fieldKey: 'targetPatientVolumes', fieldName: 'Target Patient Volumes (OPD & IPD)', fieldType: 'text', section: 'Facility Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'HOSPITALS', fieldKey: 'departmentsSpecialties', fieldName: 'Departments & Specialties', fieldType: 'text', section: 'Clinical Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 4 },
    { catCode: 'HOSPITALS', fieldKey: 'otCountTypes', fieldName: 'OT Count & Specifications (General, Modular, etc.)', fieldType: 'text', section: 'Clinical Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 5 },
    { catCode: 'HOSPITALS', fieldKey: 'emergencyCasualty', fieldName: 'Emergency & Casualty Room', fieldType: 'yes-no', section: 'Clinical Programme', capturedAtStage: 'Lead', isRequired: false, displayOrder: 6 },
    { catCode: 'HOSPITALS', fieldKey: 'labourDelivery', fieldName: 'Labour & Delivery Room', fieldType: 'yes-no', section: 'Clinical Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'HOSPITALS', fieldKey: 'dialysis', fieldName: 'Dialysis Units', fieldType: 'yes-no', section: 'Clinical Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'HOSPITALS', fieldKey: 'dayCare', fieldName: 'Day-care Units', fieldType: 'yes-no', section: 'Clinical Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'HOSPITALS', fieldKey: 'laboratoryScope', fieldName: 'Laboratory Scope', fieldType: 'text', section: 'Diagnostics & Pharmacy', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'HOSPITALS', fieldKey: 'radiologyModality', fieldName: 'Radiology Modalities (X-ray, CT, MRI)', fieldType: 'text', section: 'Diagnostics & Pharmacy', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'HOSPITALS', fieldKey: 'pharmacyOpIp', fieldName: 'Pharmacy (OP / IP)', fieldType: 'text', section: 'Diagnostics & Pharmacy', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'HOSPITALS', fieldKey: 'bloodBank', fieldName: 'Blood Bank', fieldType: 'yes-no', section: 'Diagnostics & Pharmacy', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'HOSPITALS', fieldKey: 'cssd', fieldName: 'CSSD Required', fieldType: 'yes-no', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'HOSPITALS', fieldKey: 'kitchenDietary', fieldName: 'Kitchen & Dietary', fieldType: 'yes-no', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'HOSPITALS', fieldKey: 'laundry', fieldName: 'Laundry Services', fieldType: 'yes-no', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'HOSPITALS', fieldKey: 'mortuary', fieldName: 'Mortuary Space', fieldType: 'yes-no', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'HOSPITALS', fieldKey: 'biomedicalWaste', fieldName: 'Biomedical Waste Handling', fieldType: 'text', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'HOSPITALS', fieldKey: 'centralStores', fieldName: 'Central Stores', fieldType: 'text', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'HOSPITALS', fieldKey: 'manifoldRoom', fieldName: 'Manifold Room', fieldType: 'yes-no', section: 'Clinical Support', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'HOSPITALS', fieldKey: 'mgpsOutletsPerBed', fieldName: 'MGPS outlets per bed / department', fieldType: 'text', section: 'Special Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'HOSPITALS', fieldKey: 'ptsStations', fieldName: 'Pneumatic Tube System (PTS) Stations', fieldType: 'yes-no', section: 'Special Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 22 },
    { catCode: 'HOSPITALS', fieldKey: 'wtpRoDialysis', fieldName: 'Water Treatment / RO Plant (for Dialysis, etc.)', fieldType: 'yes-no', section: 'Special Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 23 },
    { catCode: 'HOSPITALS', fieldKey: 'upsPowerBackup', fieldName: 'UPS & Critical Power Backup Requirements', fieldType: 'text', section: 'Special Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 24 },
    { catCode: 'HOSPITALS', fieldKey: 'medicalIt', fieldName: 'Medical IT Infrastructure (PACS, Nurse Call, etc.)', fieldType: 'text', section: 'Special Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 25 },
    { catCode: 'HOSPITALS', fieldKey: 'staffCounts', fieldName: 'Staff Headcounts (Doctors, Nurses, Support)', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 26 },
    { catCode: 'HOSPITALS', fieldKey: 'nursingStations', fieldName: 'Nursing Stations Details', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 27 },
    { catCode: 'HOSPITALS', fieldKey: 'staffFacilities', fieldName: 'Staff Breakrooms & On-Call Accommodation', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 28 },
    { catCode: 'HOSPITALS', fieldKey: 'visitorPolicy', fieldName: 'Visitor Policy', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 29 },
    { catCode: 'HOSPITALS', fieldKey: 'ambulanceBay', fieldName: 'Ambulance Bay', fieldType: 'yes-no', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 30 },
    { catCode: 'HOSPITALS', fieldKey: 'parking', fieldName: 'Parking Requirements', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 31 },
    { catCode: 'HOSPITALS', fieldKey: 'circulationSegregation', fieldName: 'Circulation Segregation (Clean/Dirty, Patient/Service Paths)', fieldType: 'text', section: 'People & Movement', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 32 },
    { catCode: 'HOSPITALS', fieldKey: 'clinicalEstablishments', fieldName: 'Clinical Establishments Act Registration', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 33 },
    { catCode: 'HOSPITALS', fieldKey: 'fireNoc', fieldName: 'Fire NOC', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 34 },
    { catCode: 'HOSPITALS', fieldKey: 'pcbBiomedicalWaste', fieldName: 'PCB Consents & Biomedical Waste Authorization', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 35 },
    { catCode: 'HOSPITALS', fieldKey: 'aerbRadiology', fieldName: 'AERB Compliance (Radiology/X-Ray, etc.)', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 36 },
    { catCode: 'HOSPITALS', fieldKey: 'nabhAspirations', fieldName: 'NABH Accreditation Intent', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 37 },
    { catCode: 'HOSPITALS', fieldKey: 'liftDgApprovals', fieldName: 'Lift & DG Set Approvals', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 38 },

    // 3.5 Hospitality
    { catCode: 'HOSPITALITY', fieldKey: 'hotelCategoryStarRating', fieldName: 'Category & Star-Rating Target', fieldType: 'text', section: 'Property Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'HOSPITALITY', fieldKey: 'operatorBrandTieUp', fieldName: 'Operator / Brand Tie-up', fieldType: 'text', section: 'Property Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'HOSPITALITY', fieldKey: 'keyCountRoomMix', fieldName: 'Key Count & Room Mix (Standard, Suite, Villa)', fieldType: 'text', section: 'Property Profile', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 3 },
    { catCode: 'HOSPITALITY', fieldKey: 'resortVsCity', fieldName: 'Resort vs City Hotel', fieldType: 'text', section: 'Property Profile', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 4 },
    { catCode: 'HOSPITALITY', fieldKey: 'serviceApartments', fieldName: 'Service Apartments Included', fieldType: 'yes-no', section: 'Property Profile', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 5 },
    { catCode: 'HOSPITALITY', fieldKey: 'fbOutlets', fieldName: 'F&B Outlets (All-day, Specialty, Bar, Café)', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'HOSPITALITY', fieldKey: 'banquetConvention', fieldName: 'Banquet & Convention Capacity', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'HOSPITALITY', fieldKey: 'meetingRooms', fieldName: 'Meeting Rooms count', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'HOSPITALITY', fieldKey: 'spaPoolGym', fieldName: 'Spa, Pool & Gym Facilities', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'HOSPITALITY', fieldKey: 'kidsRecreation', fieldName: 'Kids Play & Recreation Areas', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'HOSPITALITY', fieldKey: 'retail', fieldName: 'Retail Space', fieldType: 'text', section: 'Guest Facilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'HOSPITALITY', fieldKey: 'kitchens', fieldName: 'Main & Satellite Kitchens', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'HOSPITALITY', fieldKey: 'storesReceiving', fieldName: 'Stores & Receiving', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'HOSPITALITY', fieldKey: 'laundryBO', fieldName: 'Laundry Services (BOH)', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'HOSPITALITY', fieldKey: 'staffFacilities', fieldName: 'Staff Facilities (Dining, Lockers & Lodging)', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'HOSPITALITY', fieldKey: 'adminOffices', fieldName: 'Admin Offices', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'HOSPITALITY', fieldKey: 'engineeringMaintenance', fieldName: 'Engineering & Maintenance Areas', fieldType: 'text', section: 'Back of House', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'HOSPITALITY', fieldKey: 'parkingValet', fieldName: 'Parking & Valet Flow', fieldType: 'text', section: 'Operations', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'HOSPITALITY', fieldKey: 'porteCochere', fieldName: 'Porte-Cochère', fieldType: 'yes-no', section: 'Operations', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'HOSPITALITY', fieldKey: 'circulationSegregation', fieldName: 'Circulation Segregation (Service vs. Guest)', fieldType: 'yes-no', section: 'Operations', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'HOSPITALITY', fieldKey: 'securityCctv', fieldName: 'Security & CCTV requirements', fieldType: 'text', section: 'Operations', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'HOSPITALITY', fieldKey: 'itPms', fieldName: 'IT & PMS provisions', fieldType: 'text', section: 'Operations', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 22 },
    { catCode: 'HOSPITALITY', fieldKey: 'fireNoc', fieldName: 'Fire NOC', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 23 },
    { catCode: 'HOSPITALITY', fieldKey: 'fssai', fieldName: 'FSSAI License', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 24 },
    { catCode: 'HOSPITALITY', fieldKey: 'barLicence', fieldName: 'Bar License Compliance', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 25 },
    { catCode: 'HOSPITALITY', fieldKey: 'tourismClassification', fieldName: 'Tourism Department Classification Status', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 26 },
    { catCode: 'HOSPITALITY', fieldKey: 'poolSafety', fieldName: 'Swimming Pool Safety Norms', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 27 },
    { catCode: 'HOSPITALITY', fieldKey: 'stpPcbConsents', fieldName: 'STP / PCB consents', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 28 },

    // 3.6 Commercial
    { catCode: 'COMMERCIAL', fieldKey: 'businessModel', fieldName: 'Own use / Lease / Built-to-suit', fieldType: 'single-select', fieldOptions: ['Own use', 'Lease', 'Built-to-suit'], section: 'Business Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'COMMERCIAL', fieldKey: 'tenantType', fieldName: 'Single or Multi-tenant', fieldType: 'single-select', fieldOptions: ['Single tenant', 'Multi tenant'], section: 'Business Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'COMMERCIAL', fieldKey: 'targetTenantProfile', fieldName: 'Target Tenant Profile / Anchor Brands', fieldType: 'text', section: 'Business Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'COMMERCIAL', fieldKey: 'gradeAspiration', fieldName: 'Grade Aspiration (Grade A / B)', fieldType: 'single-select', fieldOptions: ['Grade A', 'Grade B'], section: 'Business Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 4 },
    { catCode: 'COMMERCIAL', fieldKey: 'carpetEfficiency', fieldName: 'Leasable vs Carpet Efficiency Targets', fieldType: 'text', section: 'Business Profile', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 5 },
    { catCode: 'COMMERCIAL', fieldKey: 'floorPlateSize', fieldName: 'Floor-plate size & headcount densities', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'COMMERCIAL', fieldKey: 'receptionLobbies', fieldName: 'Reception & Lobbies requirements', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'COMMERCIAL', fieldKey: 'conferenceTraining', fieldName: 'Conference / Training spaces', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'COMMERCIAL', fieldKey: 'cafeteriaFoodCourt', fieldName: 'Cafeteria / Food Court', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'COMMERCIAL', fieldKey: 'serverHub', fieldName: 'Server / Hub Rooms', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'COMMERCIAL', fieldKey: 'warehouseShowroom', fieldName: 'Warehouse or Showroom components', fieldType: 'text', section: 'Space Programme', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'COMMERCIAL', fieldKey: 'hvacStandard', fieldName: 'HVAC Standard', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'COMMERCIAL', fieldKey: 'powerRedundancy', fieldName: 'Power Redundancy & DG', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'COMMERCIAL', fieldKey: 'dataItBackbone', fieldName: 'Data / IT Backbone', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'COMMERCIAL', fieldKey: 'accessControlCctv', fieldName: 'Access Control & CCTV', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'COMMERCIAL', fieldKey: 'liftsEscalators', fieldName: 'Vertical Transport (Lifts & Escalators count/specs)', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'COMMERCIAL', fieldKey: 'facadeSignage', fieldName: 'Façade & Signage Requirements', fieldType: 'text', section: 'Building Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'COMMERCIAL', fieldKey: 'parkingCap', fieldName: 'Parking Capacity (per statutory norms)', fieldType: 'text', section: 'Site & Parking', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'COMMERCIAL', fieldKey: 'loadingUnloading', fieldName: 'Loading/Unloading Docks & Service Yards', fieldType: 'text', section: 'Site & Parking', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'COMMERCIAL', fieldKey: 'dropOff', fieldName: 'Drop-off zones', fieldType: 'text', section: 'Site & Parking', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'COMMERCIAL', fieldKey: 'parkingType', fieldName: 'Multi-level / Basement Parking', fieldType: 'text', section: 'Site & Parking', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'COMMERCIAL', fieldKey: 'fireNoc', fieldName: 'Fire NOC', fieldType: 'yes-no', section: 'Compliance & Ratings', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 22 },
    { catCode: 'COMMERCIAL', fieldKey: 'occupancyCertificatePath', fieldName: 'Occupancy Certificate Compliance Pathway', fieldType: 'text', section: 'Compliance & Ratings', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 23 },
    { catCode: 'COMMERCIAL', fieldKey: 'greenCertTarget', fieldName: 'Green Certification Target (IGBC / LEED / GRIHA)', fieldType: 'text', section: 'Compliance & Ratings', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 24 },
    { catCode: 'COMMERCIAL', fieldKey: 'rera', fieldName: 'RERA compliance (if for sale)', fieldType: 'yes-no', section: 'Compliance & Ratings', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 25 },
    { catCode: 'COMMERCIAL', fieldKey: 'signagePermissions', fieldName: 'Advertising / Signage Permissions', fieldType: 'text', section: 'Compliance & Ratings', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 26 },

    // 3.7 Industrial
    { catCode: 'INDUSTRIAL', fieldKey: 'industryProduct', fieldName: 'Industry & Product Details', fieldType: 'text', section: 'Industry Profile', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'INDUSTRIAL', fieldKey: 'processFlow', fieldName: 'Process Flow Description (Inputs to Dispatch)', fieldType: 'text', section: 'Industry Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'INDUSTRIAL', fieldKey: 'productionCapacityShifts', fieldName: 'Production Capacity & Shift Details', fieldType: 'text', section: 'Industry Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'INDUSTRIAL', fieldKey: 'pcbCategory', fieldName: 'Pollution Control Board Category (Red, Orange, etc.)', fieldType: 'single-select', fieldOptions: ['Red', 'Orange', 'Green', 'White'], section: 'Industry Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 4 },
    { catCode: 'INDUSTRIAL', fieldKey: 'hazardousProcesses', fieldName: 'Hazardous processes or storage description', fieldType: 'text', section: 'Industry Profile', capturedAtStage: 'Lead', isRequired: false, displayOrder: 5 },
    { catCode: 'INDUSTRIAL', fieldKey: 'machineryList', fieldName: 'Machinery List (Sizes, Load & Vibration Specs)', fieldType: 'text', section: 'Production Needs', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'INDUSTRIAL', fieldKey: 'clearHeightsSpans', fieldName: 'Clear Heights & Bay Spans Requirements', fieldType: 'text', section: 'Production Needs', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 7 },
    { catCode: 'INDUSTRIAL', fieldKey: 'craneHoist', fieldName: 'Crane / Hoist Requirements & Capacities', fieldType: 'text', section: 'Production Needs', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 8 },
    { catCode: 'INDUSTRIAL', fieldKey: 'floorLoading', fieldName: 'Floor Load capacity & Flatness Standards', fieldType: 'text', section: 'Production Needs', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 9 },
    { catCode: 'INDUSTRIAL', fieldKey: 'cleanRoom', fieldName: 'Clean Room & Controlled Environments Requirements', fieldType: 'text', section: 'Production Needs', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 10 },
    { catCode: 'INDUSTRIAL', fieldKey: 'powerDemandSubstation', fieldName: 'Power Demand & Substation Specifications', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 11 },
    { catCode: 'INDUSTRIAL', fieldKey: 'utilityEquipment', fieldName: 'Utility Requirements (Compressed Air, Steam, Chillers)', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 12 },
    { catCode: 'INDUSTRIAL', fieldKey: 'processWater', fieldName: 'Process & Domestic Water Requirements', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 13 },
    { catCode: 'INDUSTRIAL', fieldKey: 'etpWtpStp', fieldName: 'Treatment Plants (ETP / WTP / STP specifications)', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 14 },
    { catCode: 'INDUSTRIAL', fieldKey: 'fuelStorage', fieldName: 'Fuel storage intent', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 15 },
    { catCode: 'INDUSTRIAL', fieldKey: 'solarRooftop', fieldName: 'Solar rooftop intent', fieldType: 'text', section: 'Utilities', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 16 },
    { catCode: 'INDUSTRIAL', fieldKey: 'storageVolumes', fieldName: 'Storage Volumes (Raw Materials & Finished Goods)', fieldType: 'text', section: 'Storage & Logistics', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 17 },
    { catCode: 'INDUSTRIAL', fieldKey: 'docksTruckMovement', fieldName: 'Loading Docks & Truck Movement Layout', fieldType: 'text', section: 'Storage & Logistics', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 18 },
    { catCode: 'INDUSTRIAL', fieldKey: 'weighbridge', fieldName: 'Weighbridge required', fieldType: 'yes-no', section: 'Storage & Logistics', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 19 },
    { catCode: 'INDUSTRIAL', fieldKey: 'roadsTurningRadii', fieldName: 'Internal Road Widths & Turning Radii', fieldType: 'text', section: 'Storage & Logistics', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 20 },
    { catCode: 'INDUSTRIAL', fieldKey: 'futureExpansion', fieldName: 'Future expansion land-banking needs', fieldType: 'text', section: 'Storage & Logistics', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 21 },
    { catCode: 'INDUSTRIAL', fieldKey: 'adminBlock', fieldName: 'Administrative Block Specifications', fieldType: 'text', section: 'People Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 22 },
    { catCode: 'INDUSTRIAL', fieldKey: 'canteen', fieldName: 'Staff Canteen Specifications', fieldType: 'text', section: 'People Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 23 },
    { catCode: 'INDUSTRIAL', fieldKey: 'workersAmenities', fieldName: 'Worker Amenities (Restrooms, Lockers, etc.)', fieldType: 'text', section: 'People Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 24 },
    { catCode: 'INDUSTRIAL', fieldKey: 'securityTimeOffice', fieldName: 'Security & Time Office', fieldType: 'text', section: 'People Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 25 },
    { catCode: 'INDUSTRIAL', fieldKey: 'visitorHandling', fieldName: 'Visitor Access Control & Handling', fieldType: 'text', section: 'People Spaces', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 26 },
    { catCode: 'INDUSTRIAL', fieldKey: 'factoriesAct', fieldName: 'Factories Act Compliance', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 27 },
    { catCode: 'INDUSTRIAL', fieldKey: 'pcbConsent', fieldName: 'Pollution Control Board Consent (CTE & CTO)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 28 },
    { catCode: 'INDUSTRIAL', fieldKey: 'fireNoc', fieldName: 'Fire NOC', fieldType: 'yes-no', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 29 },
    { catCode: 'INDUSTRIAL', fieldKey: 'sipcotSez', fieldName: 'Industrial Estate Rules (SIPCOT / SEZ / etc.)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 30 },
    { catCode: 'INDUSTRIAL', fieldKey: 'explosiveBoiler', fieldName: 'Explosive & Boiler License Compliance', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 31 },

    // 3.8 Mixed-Use
    { catCode: 'MIXED_USE', fieldKey: 'componentMix', fieldName: 'Component Mix Description (e.g., Retail + Office + Residential)', fieldType: 'text', section: 'Composition', capturedAtStage: 'Lead', isRequired: true, displayOrder: 1 },
    { catCode: 'MIXED_USE', fieldKey: 'areaShare', fieldName: 'Area share per use details', fieldType: 'text', section: 'Composition', capturedAtStage: 'Lead', isRequired: false, displayOrder: 2 },
    { catCode: 'MIXED_USE', fieldKey: 'entriesCores', fieldName: 'Circulation Segregation (Independent vs. Shared Entries/Cores)', fieldType: 'text', section: 'Composition', capturedAtStage: 'Lead', isRequired: false, displayOrder: 3 },
    { catCode: 'MIXED_USE', fieldKey: 'parkingStrategy', fieldName: 'Common parking strategy', fieldType: 'text', section: 'Shared Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 4 },
    { catCode: 'MIXED_USE', fieldKey: 'sharedServices', fieldName: 'Shared Services (STP, DG, Fire fighting systems)', fieldType: 'text', section: 'Shared Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 5 },
    { catCode: 'MIXED_USE', fieldKey: 'phasingComponents', fieldName: 'Phasing of components', fieldType: 'text', section: 'Shared Systems', capturedAtStage: 'Requirement Collection', isRequired: false, displayOrder: 6 },
    { catCode: 'MIXED_USE', fieldKey: 'authorityTreatment', fieldName: 'Regulatory Treatment (Premium FSI, Separate NOCs)', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 7 },
    { catCode: 'MIXED_USE', fieldKey: 'reraMixed', fieldName: 'RERA applicability per component', fieldType: 'text', section: 'Compliance', capturedAtStage: 'Client Brief', isRequired: false, displayOrder: 8 }
  ];

  for (const f of fieldsData) {
    const category = categoryMap[f.catCode];
    if (!category) continue;

    let existing = await fieldRepo.findOne({
      where: { categoryId: category.id, fieldKey: f.fieldKey }
    });

    if (!existing) {
      existing = fieldRepo.create({
        categoryId: category.id,
        fieldKey: f.fieldKey,
      });
    }

    existing.fieldName = f.fieldName;
    existing.fieldType = f.fieldType;
    existing.fieldOptions = f.fieldOptions;
    existing.section = f.section;
    existing.capturedAtStage = f.capturedAtStage;
    existing.isRequired = f.isRequired;
    existing.displayOrder = f.displayOrder;
    await fieldRepo.save(existing);
  }

  // 3. Seed Deliverables Templates (Section 4)
  console.log('[Seed] Seeding Deliverables Templates...');
  // Clear old templates and lead deliverables to rebuild them with the correct 5-phase split
  const leadDeliverableRepo = ds.getRepository(LeadDeliverableModel);
  await leadDeliverableRepo.createQueryBuilder().delete().execute();
  await deliverableTemplateRepo.createQueryBuilder().delete().execute();

  const deliverablesTemplatesData: Array<{
    catCode: string | null;
    phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 5';
    deliverableName: string;
    discipline?: 'Architecture' | 'Structure' | 'MEP-Electrical' | 'MEP-Plumbing & Fire' | 'HVAC' | 'Interior';
  }> = [
    // === COMMON DELIVERABLES (Section 4.1) ===
    { catCode: null, phase: 'Phase 1', deliverableName: 'Minutes of meetings' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'requirement sheet' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'site visit & feasibility report' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'client brief' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'preliminary budget & timeline note' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'fee proposal' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'signed agreement' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'team & responsibility matrix' },
    { catCode: null, phase: 'Phase 1', deliverableName: 'ERP project code & activated project plan' },

    { catCode: null, phase: 'Phase 2', deliverableName: 'Concept presentation & drawings (space planning, massing, alternatives)' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'concept sign-off sheet' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'schematic set (floor plans, elevations, sections)' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'area statement & FSI check' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'consultant RFPs, evaluations & appointment records' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'civil BOQ & tender documents' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'comparative statements' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'statutory submission set & NOC documentation' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'sanctioned plan / approvals' },
    { catCode: null, phase: 'Phase 2', deliverableName: 'detailed design set with material specifications' },

    // Phase 3: GFC Construction Documentation
    { catCode: null, phase: 'Phase 3', deliverableName: 'Working drawings / GFC (architectural)' },
    { catCode: null, phase: 'Phase 3', deliverableName: 'elevations & sections packages' },
    { catCode: null, phase: 'Phase 3', deliverableName: 'coordination & clash-resolved drawings' },
    { catCode: null, phase: 'Phase 3', deliverableName: 'foundation & setting-out drawings' },

    // Phase 4: Construction Support
    { catCode: null, phase: 'Phase 4', deliverableName: 'site meeting MOMs & action trackers' },
    { catCode: null, phase: 'Phase 4', deliverableName: 'site instructions & RFI responses' },
    { catCode: null, phase: 'Phase 4', deliverableName: 'quality-control & design-compliance reports' },
    { catCode: null, phase: 'Phase 4', deliverableName: 'progress reports & dashboards' },

    // Phase 5: Handover & Closeout
    { catCode: null, phase: 'Phase 5', deliverableName: 'snag lists & rectification records' },
    { catCode: null, phase: 'Phase 5', deliverableName: 'demo & walkthrough records' },
    { catCode: null, phase: 'Phase 5', deliverableName: 'RFP, handover & closeout dossier' },
    { catCode: null, phase: 'Phase 5', deliverableName: 'as-built confirmation' },

    // === RESIDENTIAL DELIVERABLES (Section 4.2) ===
    { catCode: 'RESIDENTIAL', phase: 'Phase 1', deliverableName: 'Vaastu review note' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 1', deliverableName: 'family-programme brief' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 1', deliverableName: 'unit-mix & amenity study (apartments)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 1', deliverableName: 'saleable-area strategy note (apartments)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'Furniture-layout options per unit' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'interior concept & 3D views' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'landscape concept' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'typical-floor efficiency studies (apartments)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'RERA documentation support (apartments)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 2', deliverableName: 'marketing plans / walkthrough views (apartments)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 3', deliverableName: 'Interior GFC (millwork, ceiling, flooring, electrical layouts)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 4', deliverableName: 'vendor-selection records (modular kitchen, wardrobes, lifts)' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 4', deliverableName: 'material & sample approvals' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 4', deliverableName: 'home-automation coordination' },
    { catCode: 'RESIDENTIAL', phase: 'Phase 5', deliverableName: 'completion & handover kit (warranties, manuals, as-builts)' },

    // === SCHOOLS DELIVERABLES (Section 4.3) ===
    { catCode: 'SCHOOLS', phase: 'Phase 1', deliverableName: 'Affiliation-norms compliance check' },
    { catCode: 'SCHOOLS', phase: 'Phase 1', deliverableName: 'student-strength & phasing programme' },
    { catCode: 'SCHOOLS', phase: 'Phase 2', deliverableName: 'Campus master plan with expansion phasing' },
    { catCode: 'SCHOOLS', phase: 'Phase 2', deliverableName: 'classroom / lab standard layouts' },
    { catCode: 'SCHOOLS', phase: 'Phase 2', deliverableName: 'sports & play-field layout' },
    { catCode: 'SCHOOLS', phase: 'Phase 2', deliverableName: 'transport circulation & bus-bay plan' },
    { catCode: 'SCHOOLS', phase: 'Phase 2', deliverableName: 'board-affiliation drawing support' },
    { catCode: 'SCHOOLS', phase: 'Phase 3', deliverableName: 'Lab services coordination drawings' },
    { catCode: 'SCHOOLS', phase: 'Phase 3', deliverableName: 'acoustic & AV details for halls' },
    { catCode: 'SCHOOLS', phase: 'Phase 4', deliverableName: 'child-safety detail compliance reports' },
    { catCode: 'SCHOOLS', phase: 'Phase 4', deliverableName: 'furniture & equipment layout drawings' },
    { catCode: 'SCHOOLS', phase: 'Phase 5', deliverableName: 'phased-handover documentation per academic-year deadline' },

    // === INSTITUTIONAL DELIVERABLES (Section 4.4) ===
    { catCode: 'INSTITUTIONAL', phase: 'Phase 1', deliverableName: 'Statutory-body norms compliance study (UGC / AICTE etc.)' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 1', deliverableName: 'campus capacity & growth programme' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 2', deliverableName: 'Campus master plan' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 2', deliverableName: 'department-wise block schematics' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 2', deliverableName: 'hostel & dining schematics' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 2', deliverableName: 'auditorium design with acoustics consultant input' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 3', deliverableName: 'Block-wise GFC packages' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 4', deliverableName: 'phasing & decant plans (for live campuses)' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 4', deliverableName: 'lab & workshop services coordination' },
    { catCode: 'INSTITUTIONAL', phase: 'Phase 5', deliverableName: 'accreditation-inspection drawing support' },

    // === HOSPITALS DELIVERABLES (Section 4.5) ===
    { catCode: 'HOSPITALS', phase: 'Phase 1', deliverableName: 'Medical programme (bed mix, schedule of accommodation)' },
    { catCode: 'HOSPITALS', phase: 'Phase 1', deliverableName: 'equipment-planning brief' },
    { catCode: 'HOSPITALS', phase: 'Phase 1', deliverableName: 'department adjacency & flow diagram' },
    { catCode: 'HOSPITALS', phase: 'Phase 2', deliverableName: 'Department-wise schematic layouts (OT, ICU, emergency, radiology, CSSD)' },
    { catCode: 'HOSPITALS', phase: 'Phase 2', deliverableName: 'MGPS & PTS schematic (specialist consultants)' },
    { catCode: 'HOSPITALS', phase: 'Phase 2', deliverableName: 'infection-control zoning & clean/dirty flow drawings' },
    { catCode: 'HOSPITALS', phase: 'Phase 2', deliverableName: 'AERB / PCB / fire submission support' },
    { catCode: 'HOSPITALS', phase: 'Phase 2', deliverableName: 'medical-equipment coordination drawings' },
    { catCode: 'HOSPITALS', phase: 'Phase 3', deliverableName: 'Modular OT & ICU detail coordination' },
    { catCode: 'HOSPITALS', phase: 'Phase 4', deliverableName: 'MGPS / PTS / WTP installation review, testing & integration witness' },
    { catCode: 'HOSPITALS', phase: 'Phase 4', deliverableName: 'radiology shielding compliance certificates support' },
    { catCode: 'HOSPITALS', phase: 'Phase 4', deliverableName: 'medical-gas T&C and statutory-inspection support' },
    { catCode: 'HOSPITALS', phase: 'Phase 5', deliverableName: 'NABH-readiness documentation support' },
    { catCode: 'HOSPITALS', phase: 'Phase 5', deliverableName: 'department-wise handover with equipment commissioning records' },

    // === HOSPITALITY DELIVERABLES (Section 4.6) ===
    { catCode: 'HOSPITALITY', phase: 'Phase 1', deliverableName: 'Key-count & facilities programme' },
    { catCode: 'HOSPITALITY', phase: 'Phase 1', deliverableName: 'operator brand-standard gap review' },
    { catCode: 'HOSPITALITY', phase: 'Phase 2', deliverableName: 'Guestroom typical-room design & mock-up room package' },
    { catCode: 'HOSPITALITY', phase: 'Phase 2', deliverableName: 'F&B and banquet schematics' },
    { catCode: 'HOSPITALITY', phase: 'Phase 2', deliverableName: 'kitchen & laundry layouts (specialist input)' },
    { catCode: 'HOSPITALITY', phase: 'Phase 2', deliverableName: 'back-of-house & staff-flow drawings' },
    { catCode: 'HOSPITALITY', phase: 'Phase 2', deliverableName: 'brand-standard compliance schedules' },
    { catCode: 'HOSPITALITY', phase: 'Phase 3', deliverableName: 'Mock-up room approval records' },
    { catCode: 'HOSPITALITY', phase: 'Phase 4', deliverableName: 'FF&E and OS&E coordination schedules' },
    { catCode: 'HOSPITALITY', phase: 'Phase 4', deliverableName: 'kitchen / laundry equipment installation review' },
    { catCode: 'HOSPITALITY', phase: 'Phase 4', deliverableName: 'pool & spa system commissioning witness' },
    { catCode: 'HOSPITALITY', phase: 'Phase 5', deliverableName: 'pre-opening snag & brand-audit support' },
    { catCode: 'HOSPITALITY', phase: 'Phase 5', deliverableName: 'licensing documentation support (FSSAI, bar, classification)' },

    // === COMMERCIAL DELIVERABLES (Section 4.7) ===
    { catCode: 'COMMERCIAL', phase: 'Phase 1', deliverableName: 'Efficiency & floor-plate feasibility study' },
    { catCode: 'COMMERCIAL', phase: 'Phase 1', deliverableName: 'parking-norm capacity check' },
    { catCode: 'COMMERCIAL', phase: 'Phase 2', deliverableName: 'Core & shell schematics with leasing-efficiency statement' },
    { catCode: 'COMMERCIAL', phase: 'Phase 2', deliverableName: 'façade design & signage-zone drawings' },
    { catCode: 'COMMERCIAL', phase: 'Phase 2', deliverableName: 'tenant-fitout guideline document' },
    { catCode: 'COMMERCIAL', phase: 'Phase 2', deliverableName: 'green-certification pre-assessment' },
    { catCode: 'COMMERCIAL', phase: 'Phase 3', deliverableName: 'Core & shell GFC' },
    { catCode: 'COMMERCIAL', phase: 'Phase 4', deliverableName: 'tenant coordination reviews & fitout approvals' },
    { catCode: 'COMMERCIAL', phase: 'Phase 4', deliverableName: 'BMS / access-control coordination' },
    { catCode: 'COMMERCIAL', phase: 'Phase 4', deliverableName: 'green-certification documentation support' },
    { catCode: 'COMMERCIAL', phase: 'Phase 5', deliverableName: 'occupancy-certificate documentation' },
    { catCode: 'COMMERCIAL', phase: 'Phase 5', deliverableName: 'lease-plan (carpet/leasable) certified drawings' },

    // === INDUSTRIAL DELIVERABLES (Section 4.8) ===
    { catCode: 'INDUSTRIAL', phase: 'Phase 1', deliverableName: 'Process-flow & plant-layout feasibility' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 1', deliverableName: 'utility-demand assessment note' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 1', deliverableName: 'PCB-category & siting compliance check' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 2', deliverableName: 'Plant master layout with material-movement & truck-circulation plan' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 2', deliverableName: 'machinery foundation requirement schedule' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 2', deliverableName: 'utility layouts (power, air, steam, water)' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 2', deliverableName: 'ETP / WTP schematics (specialist)' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 2', deliverableName: 'PCB consent-to-establish & factory-plan approval drawings' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 3', deliverableName: 'Machinery foundation & pit GFC' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 3', deliverableName: 'heavy-structure erection review' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 4', deliverableName: 'utility installation & ETP/WTP commissioning witness' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 5', deliverableName: 'Factories-Inspectorate & PCB consent-to-operate documentation support' },
    { catCode: 'INDUSTRIAL', phase: 'Phase 5', deliverableName: 'phased production-handover records' },

    // === MIXED_USE DELIVERABLES (Section 4.9) ===
    { catCode: 'MIXED_USE', phase: 'Phase 1', deliverableName: 'Component-mix & shared-infrastructure feasibility study' },
    { catCode: 'MIXED_USE', phase: 'Phase 2', deliverableName: 'Use-wise schematic packages with shared-core & services strategy' },
    { catCode: 'MIXED_USE', phase: 'Phase 2', deliverableName: 'authority strategy note (approvals per component)' },
    { catCode: 'MIXED_USE', phase: 'Phase 3', deliverableName: 'Component-wise GFC & phased handover' },
    { catCode: 'MIXED_USE', phase: 'Phase 4', deliverableName: 'shared-services commissioning & inter-component interface records' },
    { catCode: 'MIXED_USE', phase: 'Phase 5', deliverableName: 'separate completion / occupancy documentation per use' }
  ];

  for (const del of deliverablesTemplatesData) {
    const categoryId = del.catCode ? categoryMap[del.catCode]?.id : null;
    
    // Skip if category specified but not resolved
    if (del.catCode && !categoryId) continue;

    const existing = await deliverableTemplateRepo.findOne({
      where: {
        categoryId: categoryId === null ? IsNull() : categoryId,
        phase: del.phase,
        deliverableName: del.deliverableName
      }
    });

    if (!existing) {
      const template = deliverableTemplateRepo.create({
        categoryId,
        phase: del.phase,
        deliverableName: del.deliverableName,
        discipline: del.discipline
      });
      await deliverableTemplateRepo.save(template);
    }
  }
  console.log('[Seed] Seeding Lead categories, fields, and deliverables templates completed.');
}

async function main() {
  console.log('[DB-Init] Initializing database connection and synchronizing schemas...');
  try {
    const ds = await getDataSource();
    console.log('[DB-Init] Database synchronized successfully!');
    
    const userRepo = ds.getRepository(UserModel);
    const count = await userRepo.count();
    console.log(`[DB-Init] Database check - Current user count in 'users' table: ${count}`);

    const companyRepo = ds.getRepository(CompanyModel);
    const companyCount = await companyRepo.count();
    console.log(`[DB-Init] Database check - Current company count in 'companies' table: ${companyCount}`);

    const branchRepo = ds.getRepository(BranchModel);
    const branchCount = await branchRepo.count();
    console.log(`[DB-Init] Database check - Current branch count in 'branches' table: ${branchCount}`);
    
    // Seed templates, fields, and deliverables
    await seedLeadTemplates(ds);
    console.log('[DB-Init] Database initialization complete.');
    
    process.exit(0);
  } catch (err) {
    console.error('[DB-Init] Error initializing database:', err);
    process.exit(1);
  }
}

main();
