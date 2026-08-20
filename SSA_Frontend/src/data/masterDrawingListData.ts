// Standard Master Drawing List (MDL) catalog and auto-generation engine
// Based on SSA PMC / Engineering Drawing Delivery Document Specifications

export type DisciplineCode = 'AR' | 'IN' | 'ST' | 'EL' | 'PL' | 'FF' | 'HV' | 'MG' | 'LV' | 'VT' | 'SP'

export interface DisciplineMeta {
  code: DisciplineCode
  name: string
  sequenceOrder: number
  colorBadge: string
  description: string
}

export const DISCIPLINE_CATALOG: Record<DisciplineCode, DisciplineMeta> = {
  AR: { code: 'AR', name: 'Architecture', sequenceOrder: 1, colorBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', description: 'Base architectural plans, sections, elevations, schedules' },
  ST: { code: 'ST', name: 'Structural', sequenceOrder: 2, colorBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', description: 'Columns, footings, tie beams, slab rebar, BBS' },
  EL: { code: 'EL', name: 'Electrical (MEP)', sequenceOrder: 3, colorBadge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', description: 'SLD, power, lighting, panel schedules, cable trays, DG/UPS' },
  PL: { code: 'PL', name: 'Plumbing (MEP)', sequenceOrder: 4, colorBadge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', description: 'Water supply, drainage, storm water, pump room, STP/WTP' },
  FF: { code: 'FF', name: 'Fire Fighting', sequenceOrder: 5, colorBadge: 'bg-red-500/10 text-red-400 border-red-500/20', description: 'Sprinklers, hydrants, hose reels, fire pumps, static storage' },
  HV: { code: 'HV', name: 'HVAC', sequenceOrder: 6, colorBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', description: 'Chillers/AHUs, ducts, chilled water, VRF, OT ventilation' },
  MG: { code: 'MG', name: 'Medical Gas', sequenceOrder: 7, colorBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', description: 'Manifold room, pipeline routing, bed outlets, zone valves' },
  LV: { code: 'LV', name: 'ELV / Low Voltage', sequenceOrder: 8, colorBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', description: 'Structured cabling, CCTV, access control, BMS, nurse call' },
  VT: { code: 'VT', name: 'Vertical Transport', sequenceOrder: 9, colorBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', description: 'Lift layout, shaft details, machine room, load calcs' },
  SP: { code: 'SP', name: 'Other Special Services', sequenceOrder: 10, colorBadge: 'bg-teal-500/10 text-teal-400 border-teal-500/20', description: 'Kitchen, laundry, pneumatic tube, solar PV, landscape' },
  IN: { code: 'IN', name: 'Interior', sequenceOrder: 11, colorBadge: 'bg-pink-500/10 text-pink-400 border-pink-500/20', description: 'Furniture, flooring, RCP ceilings, millwork, FF&E' },
}

export interface DrawingTemplateItem {
  id: string
  discipline: DisciplineCode
  title: string
  levelRule: 'Per floor' | 'Terrace' | 'All' | 'Site / GF' | 'Basement / GF' | 'GF' | 'B1 / Site' | 'Site' | 'OT floors' | 'Service'
  codeTemplate: string // e.g. KNG-EL-L#-PLN-210 or KNG-AR-ALL-SEC-103
  purpose: string // Simple plain-language explanation for software and site team
  isPerFloor: boolean
}

export const MASTER_DRAWING_TEMPLATES: DrawingTemplateItem[] = [
  // ── 1. Architecture (AR) ──────────────────────────────────────────
  { id: 'T-AR-01', discipline: 'AR', title: 'Floor Plan', levelRule: 'Per floor', codeTemplate: '[PROJ]-AR-L#-PLN-101', purpose: 'Master plan of each floor — all rooms, walls, doors, dimensions. Every other discipline draws on top of this.', isPerFloor: true },
  { id: 'T-AR-02', discipline: 'AR', title: 'Roof / Terrace Plan', levelRule: 'Terrace', codeTemplate: '[PROJ]-AR-TR-PLN-102', purpose: 'Terrace layout — parapets, tanks, machine rooms, slopes for drainage.', isPerFloor: false },
  { id: 'T-AR-03', discipline: 'AR', title: 'Building Sections', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-SEC-103', purpose: 'Vertical cuts through the building showing floor heights and levels.', isPerFloor: false },
  { id: 'T-AR-04', discipline: 'AR', title: 'Elevations (4 sides)', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-ELV-104', purpose: 'Outside face of the building — look, openings, finishes, heights.', isPerFloor: false },
  { id: 'T-AR-05', discipline: 'AR', title: 'Staircase Details', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-DET-105', purpose: 'Enlarged detail of each staircase — riser, tread, railing.', isPerFloor: false },
  { id: 'T-AR-06', discipline: 'AR', title: 'Toilet / Core Details', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-DET-106', purpose: 'Blown-up detail of toilet blocks and service cores with fittings.', isPerFloor: false },
  { id: 'T-AR-07', discipline: 'AR', title: 'Door & Window Schedule', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-SCH-107', purpose: 'List of every door and window — size, type, material, quantity.', isPerFloor: false },
  { id: 'T-AR-08', discipline: 'AR', title: 'Wall & Finish Schedule', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-SCH-108', purpose: 'What each wall is built of and its finish (paint, tile, cladding).', isPerFloor: false },
  { id: 'T-AR-09', discipline: 'AR', title: 'Site & Setting-out Plan', levelRule: 'Site / GF', codeTemplate: '[PROJ]-AR-GF-PLN-109', purpose: 'Building position on the plot with grid — used to mark out on ground.', isPerFloor: false },
  { id: 'T-AR-10', discipline: 'AR', title: 'Area Statement', levelRule: 'All', codeTemplate: '[PROJ]-AR-ALL-SCH-110', purpose: 'Floor-wise built-up / carpet area figures — for approvals and billing.', isPerFloor: false },

  // ── 2. Interior (IN) ─────────────────────────────────────────────
  { id: 'T-IN-01', discipline: 'IN', title: 'Furniture Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-IN-L#-PLN-201', purpose: 'Where each piece of furniture sits in every room.', isPerFloor: true },
  { id: 'T-IN-02', discipline: 'IN', title: 'Flooring Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-IN-L#-PLN-202', purpose: 'Flooring material and pattern for each space (tile, vinyl, etc.).', isPerFloor: true },
  { id: 'T-IN-03', discipline: 'IN', title: 'Reflected Ceiling Plan', levelRule: 'Per floor', codeTemplate: '[PROJ]-IN-L#-PLN-203', purpose: 'Ceiling design — false ceiling, light and diffuser positions.', isPerFloor: true },
  { id: 'T-IN-04', discipline: 'IN', title: 'Wall Elevations', levelRule: 'All', codeTemplate: '[PROJ]-IN-ALL-ELV-204', purpose: 'Interior wall faces — panelling, cladding, feature walls.', isPerFloor: false },
  { id: 'T-IN-05', discipline: 'IN', title: 'Joinery / Millwork Details', levelRule: 'All', codeTemplate: '[PROJ]-IN-ALL-DET-205', purpose: 'Detail of built-in furniture — reception desk, nurse station, cabinets.', isPerFloor: false },
  { id: 'T-IN-06', discipline: 'IN', title: 'Signage & Wayfinding', levelRule: 'All', codeTemplate: '[PROJ]-IN-ALL-PLN-206', purpose: 'Placement of signboards, directions and room names.', isPerFloor: false },
  { id: 'T-IN-07', discipline: 'IN', title: 'Finish & FF&E Schedule', levelRule: 'All', codeTemplate: '[PROJ]-IN-ALL-SCH-207', purpose: 'List of all finishes and loose furniture with specifications.', isPerFloor: false },

  // ── 3. Structural (ST) ────────────────────────────────────────────
  { id: 'T-ST-01', discipline: 'ST', title: 'General Notes & Specs', levelRule: 'All', codeTemplate: '[PROJ]-ST-ALL-NTS-301', purpose: 'Material grades, design codes and general instructions for site.', isPerFloor: false },
  { id: 'T-ST-02', discipline: 'ST', title: 'Foundation & Footing Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-ST-GF-PLN-302', purpose: 'Position and size of all footings — the base that carries the building.', isPerFloor: false },
  { id: 'T-ST-03', discipline: 'ST', title: 'Column Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-ST-L#-PLN-303', purpose: 'Where every column stands on each floor.', isPerFloor: true },
  { id: 'T-ST-04', discipline: 'ST', title: 'Column Schedule', levelRule: 'All', codeTemplate: '[PROJ]-ST-ALL-SCH-304', purpose: 'Size and steel reinforcement of every column.', isPerFloor: false },
  { id: 'T-ST-05', discipline: 'ST', title: 'Slab & Beam Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-ST-L#-PLN-305', purpose: 'Beams and slab thickness for each floor.', isPerFloor: true },
  { id: 'T-ST-06', discipline: 'ST', title: 'Beam Schedule / BBS', levelRule: 'All', codeTemplate: '[PROJ]-ST-ALL-SCH-306', purpose: 'Reinforcement details and bar-bending schedule for steel cutting.', isPerFloor: false },
  { id: 'T-ST-07', discipline: 'ST', title: 'Plinth Beam Layout', levelRule: 'GF', codeTemplate: '[PROJ]-ST-GF-PLN-307', purpose: 'Beams at plinth level tying the columns together.', isPerFloor: false },
  { id: 'T-ST-08', discipline: 'ST', title: 'Staircase & Lift-pit RCC', levelRule: 'All', codeTemplate: '[PROJ]-ST-ALL-DET-308', purpose: 'Concrete and steel detail of stairs and lift pits.', isPerFloor: false },
  { id: 'T-ST-09', discipline: 'ST', title: 'Retaining Wall Details', levelRule: 'B1 / Site', codeTemplate: '[PROJ]-ST-B1-DET-309', purpose: 'Walls that hold back earth (basement, ramp edges).', isPerFloor: false },
  { id: 'T-ST-10', discipline: 'ST', title: 'Structural Sections', levelRule: 'All', codeTemplate: '[PROJ]-ST-ALL-SEC-310', purpose: 'Vertical structural cuts showing the frame.', isPerFloor: false },

  // ── 4. Electrical (EL) ────────────────────────────────────────────
  { id: 'T-EL-01', discipline: 'EL', title: 'Single Line Diagram', levelRule: 'All', codeTemplate: '[PROJ]-EL-ALL-DGM-401', purpose: 'The full electrical tree — from incoming supply to every panel.', isPerFloor: false },
  { id: 'T-EL-02', discipline: 'EL', title: 'Load Schedule', levelRule: 'All', codeTemplate: '[PROJ]-EL-ALL-SCH-402', purpose: 'Power demand of every area — used to size cables and boards.', isPerFloor: false },
  { id: 'T-EL-03', discipline: 'EL', title: 'Power Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-EL-L#-PLN-403', purpose: 'Socket and equipment power points on each floor.', isPerFloor: true },
  { id: 'T-EL-04', discipline: 'EL', title: 'Lighting Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-EL-L#-PLN-404', purpose: 'Light fitting positions and their circuits on each floor.', isPerFloor: true },
  { id: 'T-EL-05', discipline: 'EL', title: 'DB & Panel Schedules', levelRule: 'All', codeTemplate: '[PROJ]-EL-ALL-SCH-405', purpose: 'What each distribution board feeds and its ratings.', isPerFloor: false },
  { id: 'T-EL-06', discipline: 'EL', title: 'Earthing & Lightning Protection', levelRule: 'All', codeTemplate: '[PROJ]-EL-ALL-DET-406', purpose: 'Safety earthing grid and rooftop lightning arrestor.', isPerFloor: false },
  { id: 'T-EL-07', discipline: 'EL', title: 'Cable Tray & Routing', levelRule: 'All', codeTemplate: '[PROJ]-EL-ALL-PLN-407', purpose: 'Path of the main cable trays across the building.', isPerFloor: false },
  { id: 'T-EL-08', discipline: 'EL', title: 'DG / UPS / Transformer Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-EL-GF-PLN-408', purpose: 'Room layout for generator, UPS and transformer.', isPerFloor: false },

  // ── 5. Plumbing (PL) ──────────────────────────────────────────────
  { id: 'T-PL-01', discipline: 'PL', title: 'Water Supply Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-PL-L#-PLN-501', purpose: 'Fresh-water pipe routing to every fixture.', isPerFloor: true },
  { id: 'T-PL-02', discipline: 'PL', title: 'Drainage & Sewerage Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-PL-L#-PLN-502', purpose: 'Waste and soil pipe routing on each floor.', isPerFloor: true },
  { id: 'T-PL-03', discipline: 'PL', title: 'Storm Water Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-PL-L#-PLN-503', purpose: 'Rainwater collection and discharge.', isPerFloor: true },
  { id: 'T-PL-04', discipline: 'PL', title: 'Riser Diagrams', levelRule: 'All', codeTemplate: '[PROJ]-PL-ALL-DGM-504', purpose: 'Vertical stack of water and drain pipes across floors.', isPerFloor: false },
  { id: 'T-PL-05', discipline: 'PL', title: 'Pump Room Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-PL-GF-PLN-505', purpose: 'Water pumps, tanks and hydro-pneumatic system.', isPerFloor: false },
  { id: 'T-PL-06', discipline: 'PL', title: 'Terrace Plumbing', levelRule: 'Terrace', codeTemplate: '[PROJ]-PL-TR-PLN-506', purpose: 'Overhead tanks and terrace pipe layout.', isPerFloor: false },
  { id: 'T-PL-07', discipline: 'PL', title: 'STP / WTP Interface', levelRule: 'Site', codeTemplate: '[PROJ]-PL-SITE-PLN-507', purpose: 'Connection to sewage and water treatment plant.', isPerFloor: false },
  { id: 'T-PL-08', discipline: 'PL', title: 'Fixture Schedule', levelRule: 'All', codeTemplate: '[PROJ]-PL-ALL-SCH-508', purpose: 'List of all sanitary fixtures with specifications.', isPerFloor: false },

  // ── 6. Fire Fighting (FF) ─────────────────────────────────────────
  { id: 'T-FF-01', discipline: 'FF', title: 'Sprinkler Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-FF-L#-PLN-601', purpose: 'Automatic sprinkler head positions and piping.', isPerFloor: true },
  { id: 'T-FF-02', discipline: 'FF', title: 'Hydrant & Hose Reel Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-FF-L#-PLN-602', purpose: 'Fire hydrant points and hose reels on each floor.', isPerFloor: true },
  { id: 'T-FF-03', discipline: 'FF', title: 'Fire Riser Diagram', levelRule: 'All', codeTemplate: '[PROJ]-FF-ALL-DGM-603', purpose: 'Vertical fire-water piping across all floors.', isPerFloor: false },
  { id: 'T-FF-04', discipline: 'FF', title: 'Fire Pump Room Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-FF-GF-PLN-604', purpose: 'Fire pumps and controllers.', isPerFloor: false },
  { id: 'T-FF-05', discipline: 'FF', title: 'Fire Tank & Static Storage', levelRule: 'B1 / Site', codeTemplate: '[PROJ]-FF-SITE-PLN-605', purpose: 'Dedicated fire-water storage tank.', isPerFloor: false },

  // ── 7. HVAC (HV) ──────────────────────────────────────────────────
  { id: 'T-HV-01', discipline: 'HV', title: 'Equipment (Chiller/AHU) Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-HV-TR-PLN-701', purpose: 'Position of chillers, AHUs and cooling towers.', isPerFloor: false },
  { id: 'T-HV-02', discipline: 'HV', title: 'Duct Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-HV-L#-PLN-702', purpose: 'Air supply and return ductwork on each floor.', isPerFloor: true },
  { id: 'T-HV-03', discipline: 'HV', title: 'Chilled Water Piping', levelRule: 'Per floor', codeTemplate: '[PROJ]-HV-L#-PLN-703', purpose: 'Chilled-water pipe routing to the AHUs.', isPerFloor: true },
  { id: 'T-HV-04', discipline: 'HV', title: 'VRF / Split Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-HV-L#-PLN-704', purpose: 'Indoor and outdoor unit positions where VRF is used.', isPerFloor: true },
  { id: 'T-HV-05', discipline: 'HV', title: 'Ventilation & Exhaust', levelRule: 'Per floor', codeTemplate: '[PROJ]-HV-L#-PLN-705', purpose: 'Fresh air and exhaust for toilets, kitchen and labs.', isPerFloor: true },
  { id: 'T-HV-06', discipline: 'HV', title: 'Isolation / OT Air-Handling', levelRule: 'OT floors', codeTemplate: '[PROJ]-HV-OT-PLN-706', purpose: 'Special clean-air handling for operation theatres.', isPerFloor: false },
  { id: 'T-HV-07', discipline: 'HV', title: 'AHU Room Detail', levelRule: 'All', codeTemplate: '[PROJ]-HV-ALL-DET-707', purpose: 'Enlarged detail of the AHU rooms.', isPerFloor: false },
  { id: 'T-HV-08', discipline: 'HV', title: 'Heat Load Calculations', levelRule: 'All', codeTemplate: '[PROJ]-HV-ALL-CAL-708', purpose: 'Cooling-load basis used to size the equipment.', isPerFloor: false },
  { id: 'T-HV-09', discipline: 'HV', title: 'Controls Schematic', levelRule: 'All', codeTemplate: '[PROJ]-HV-ALL-DGM-709', purpose: 'Control and BMS logic for the HVAC system.', isPerFloor: false },

  // ── 8. Medical Gas (MG) ───────────────────────────────────────────
  { id: 'T-MG-01', discipline: 'MG', title: 'Manifold Room Layout', levelRule: 'Basement / GF', codeTemplate: '[PROJ]-MG-GF-PLN-801', purpose: 'Central gas source room (oxygen, N2O, vacuum, air).', isPerFloor: false },
  { id: 'T-MG-02', discipline: 'MG', title: 'Pipeline Routing', levelRule: 'Per floor', codeTemplate: '[PROJ]-MG-L#-PLN-802', purpose: 'Medical-gas pipe routing to each ward and OT.', isPerFloor: true },
  { id: 'T-MG-03', discipline: 'MG', title: 'Outlet Points per Bed', levelRule: 'All', codeTemplate: '[PROJ]-MG-ALL-SCH-803', purpose: 'Number and type of gas outlets at each bed.', isPerFloor: false },
  { id: 'T-MG-04', discipline: 'MG', title: 'Alarm Panel Layout', levelRule: 'All', codeTemplate: '[PROJ]-MG-ALL-PLN-804', purpose: 'Positions of gas alarm panels.', isPerFloor: false },
  { id: 'T-MG-05', discipline: 'MG', title: 'Zone Valve Schedule', levelRule: 'All', codeTemplate: '[PROJ]-MG-ALL-SCH-805', purpose: 'Shut-off valves per zone for safety and maintenance.', isPerFloor: false },

  // ── 9. ELV / Low Voltage (LV) ──────────────────────────────────────
  { id: 'T-LV-01', discipline: 'LV', title: 'Structured Cabling / Data', levelRule: 'Per floor', codeTemplate: '[PROJ]-LV-L#-PLN-901', purpose: 'Network and data points on each floor.', isPerFloor: true },
  { id: 'T-LV-02', discipline: 'LV', title: 'CCTV Layout', levelRule: 'Per floor', codeTemplate: '[PROJ]-LV-L#-PLN-902', purpose: 'Camera positions and coverage.', isPerFloor: true },
  { id: 'T-LV-03', discipline: 'LV', title: 'Access Control', levelRule: 'Per floor', codeTemplate: '[PROJ]-LV-L#-PLN-903', purpose: 'Door controllers and card readers.', isPerFloor: true },
  { id: 'T-LV-04', discipline: 'LV', title: 'Nurse Call System', levelRule: 'Per floor', codeTemplate: '[PROJ]-LV-L#-PLN-904', purpose: 'Call points at beds and nurse stations.', isPerFloor: true },
  { id: 'T-LV-05', discipline: 'LV', title: 'Public Address & IPTV', levelRule: 'All', codeTemplate: '[PROJ]-LV-ALL-PLN-905', purpose: 'Announcement speakers and TV points.', isPerFloor: false },
  { id: 'T-LV-06', discipline: 'LV', title: 'BMS Points List & Schematic', levelRule: 'All', codeTemplate: '[PROJ]-LV-ALL-DGM-906', purpose: 'Building-management monitoring points and logic.', isPerFloor: false },
  { id: 'T-LV-07', discipline: 'LV', title: 'Master Clock / Misc ELV', levelRule: 'All', codeTemplate: '[PROJ]-LV-ALL-PLN-907', purpose: 'Synchronised clocks and other low-voltage systems.', isPerFloor: false },

  // ── 10. Vertical Transport (VT) ────────────────────────────────────
  { id: 'T-VT-01', discipline: 'VT', title: 'Lift General Arrangement', levelRule: 'All', codeTemplate: '[PROJ]-VT-ALL-PLN-951', purpose: 'Position and type of each lift (bed / patient / visitor).', isPerFloor: false },
  { id: 'T-VT-02', discipline: 'VT', title: 'Shaft & Pit Details', levelRule: 'All', codeTemplate: '[PROJ]-VT-ALL-DET-952', purpose: 'Lift shaft, pit depth and overhead detail.', isPerFloor: false },
  { id: 'T-VT-03', discipline: 'VT', title: 'Machine Room Layout', levelRule: 'Terrace', codeTemplate: '[PROJ]-VT-TR-PLN-953', purpose: 'Lift machine room equipment arrangement.', isPerFloor: false },
  { id: 'T-VT-04', discipline: 'VT', title: 'Traffic / Load Calcs', levelRule: 'All', codeTemplate: '[PROJ]-VT-ALL-CAL-954', purpose: 'Justifies lift count and capacity (4 bed-lifts + patient + visitor lift).', isPerFloor: false },

  // ── 11. Other Special Services (SP) ───────────────────────────────
  { id: 'T-SP-01', discipline: 'SP', title: 'Kitchen Equipment Layout', levelRule: 'GF', codeTemplate: '[PROJ]-SP-GF-PLN-981', purpose: 'Commercial kitchen equipment arrangement.', isPerFloor: false },
  { id: 'T-SP-02', discipline: 'SP', title: 'Laundry Equipment Layout', levelRule: 'Service', codeTemplate: '[PROJ]-SP-GF-PLN-982', purpose: 'Hospital laundry equipment layout.', isPerFloor: false },
  { id: 'T-SP-03', discipline: 'SP', title: 'Pneumatic Tube System', levelRule: 'All', codeTemplate: '[PROJ]-SP-ALL-PLN-983', purpose: 'Tube routing that carries samples and documents between floors.', isPerFloor: false },
  { id: 'T-SP-04', discipline: 'SP', title: 'Solar PV Layout', levelRule: 'Terrace', codeTemplate: '[PROJ]-SP-TR-PLN-984', purpose: 'Rooftop solar panels and cable routing.', isPerFloor: false },
  { id: 'T-SP-05', discipline: 'SP', title: 'Gas Bank / Kitchen Gas', levelRule: 'Service', codeTemplate: '[PROJ]-SP-GF-PLN-985', purpose: 'LPG bank and kitchen gas piping.', isPerFloor: false },
  { id: 'T-SP-06', discipline: 'SP', title: 'Landscape & Hardscape', levelRule: 'Site', codeTemplate: '[PROJ]-SP-SITE-PLN-986', purpose: 'External greenery, paving and driveways.', isPerFloor: false },
  { id: 'T-SP-07', discipline: 'SP', title: 'External Development', levelRule: 'Site', codeTemplate: '[PROJ]-SP-SITE-PLN-987', purpose: 'Roads, compound wall, gates and parking on site.', isPerFloor: false },
]

export interface FloorLevelOption {
  code: string
  label: string
}

export const STANDARD_FLOORS: FloorLevelOption[] = [
  { code: 'B1', label: 'Basement 1 (B1)' },
  { code: 'GF', label: 'Ground Floor (GF)' },
  { code: '01', label: 'First Floor (01)' },
  { code: '02', label: 'Second Floor (02)' },
  { code: '03', label: 'Third Floor (03)' },
  { code: '04', label: 'Fourth Floor (04)' },
  { code: 'TR', label: 'Terrace (TR)' },
]

export interface MasterDrawingRecord {
  id: string
  drawingNumber: string
  drawingTitle: string
  discipline: DisciplineCode
  level: string // B1, GF, 01, 02, 03, 04, TR, All, Site
  revisionNumber: string // R0, R1, R2
  revisionDate: string
  preparedBy: string
  approvedBy: string
  status: 'Approved' | 'For Review' | 'Revision Required' | 'Draft'
  projectCode: string
  purpose: string
  cascadingReviewFlag?: boolean // True if AR revised & downstream review needed
}

/**
 * Auto-generate Master Drawing List records based on project configuration & levels
 */
export function generateMasterDrawingList(
  projectCode: string,
  selectedFloors: string[] = ['B1', 'GF', '01', '02', '03', '04', 'TR'],
  selectedDisciplines: DisciplineCode[] = ['AR', 'IN', 'ST', 'EL', 'PL', 'FF', 'HV', 'MG', 'LV', 'VT', 'SP'],
  preparedByDefault = 'Studio Director'
): MasterDrawingRecord[] {
  const records: MasterDrawingRecord[] = []
  const dateStr = new Date().toISOString().split('T')[0]
  const cleanPrjCode = deriveProjectCodeFromName(projectCode, projectCode)

  MASTER_DRAWING_TEMPLATES.forEach((tmpl) => {
    if (!selectedDisciplines.includes(tmpl.discipline)) return

    if (tmpl.isPerFloor) {
      // Create 1 sheet per selected floor
      selectedFloors.forEach((floorCode) => {
        const dwgNum = tmpl.codeTemplate
          .replace('[PROJ]', cleanPrjCode)
          .replace('L#', floorCode)

        records.push({
          id: `DWG-${Math.floor(1000 + Math.random() * 9000)}`,
          drawingNumber: dwgNum,
          drawingTitle: `${tmpl.title} - Floor ${floorCode}`,
          discipline: tmpl.discipline,
          level: floorCode,
          revisionNumber: 'R0',
          revisionDate: dateStr,
          preparedBy: preparedByDefault,
          approvedBy: 'Principal Architect',
          status: 'Draft',
          projectCode,
          purpose: tmpl.purpose,
          cascadingReviewFlag: false,
        })
      })
    } else {
      // Create 1 sheet for whole building or specific single level
      const singleLevel = tmpl.levelRule === 'Terrace' ? 'TR' : tmpl.levelRule === 'Basement / GF' ? 'GF' : tmpl.levelRule === 'Site / GF' ? 'GF' : tmpl.levelRule === 'B1 / Site' ? 'B1' : 'All'
      const dwgNum = tmpl.codeTemplate
        .replace('[PROJ]', cleanPrjCode)
        .replace('L#', singleLevel)

      records.push({
        id: `DWG-${Math.floor(1000 + Math.random() * 9000)}`,
        drawingNumber: dwgNum,
        drawingTitle: tmpl.title,
        discipline: tmpl.discipline,
        level: singleLevel,
        revisionNumber: 'R0',
        revisionDate: dateStr,
        preparedBy: preparedByDefault,
        approvedBy: 'Principal Architect',
        status: 'Draft',
        projectCode,
        purpose: tmpl.purpose,
        cascadingReviewFlag: false,
      })
    }
  })

  return records
}

/**
 * Derives a clean project/company acronym (e.g. "Green Valley Residential Complex" -> "GVR")
 * strictly using the Company Account name, avoiding raw IDs like "CL-12", "LD-12", or "LEAD-12".
 */
export function deriveProjectCodeFromName(name?: string, fallbackCode?: string): string {
  const isRawId = (str?: string) => {
    if (!str) return false;
    const s = str.trim().toUpperCase();
    return /^(CL|LD|LEAD|PRJ)[-_]?\d+$/i.test(s) || /^(CL|LD|LEAD|PRJ)$/i.test(s);
  };

  // 1. Pick valid Company Account name, avoiding raw IDs like CL-12, LD-12
  let textToUse = '';
  if (name && !isRawId(name) && name.trim().length > 0) {
    textToUse = name.trim();
  } else if (fallbackCode && !isRawId(fallbackCode) && fallbackCode.trim().length > 0) {
    textToUse = fallbackCode.trim();
  } else if (name && name.trim().length > 0) {
    textToUse = name.replace(/^(CL|LD|LEAD|PRJ)[-_]?\d*/gi, '').trim();
  } else if (fallbackCode && fallbackCode.trim().length > 0) {
    textToUse = fallbackCode.replace(/^(CL|LD|LEAD|PRJ)[-_]?\d*/gi, '').trim();
  }

  if (!textToUse || textToUse.length === 0) return 'GVR';

  // Explicit check for Green Valley
  if (/green\s*valley/i.test(textToUse)) {
    return 'GVR';
  }

  // If textToUse is already a valid 2-5 letter company code (e.g. GVR, FHC, GRP) and not a raw ID
  if (/^[A-Z]{2,5}$/i.test(textToUse) && !isRawId(textToUse)) {
    return textToUse.toUpperCase();
  }

  // Strip generic corporate/lead terms
  const sanitized = textToUse
    .replace(/\b(Client|Account|Pvt|Ltd|Inc|Corp|Corporation|Project|Lead|Commercial|Complex|Residential|Villas|Hub|Tower|Towers|Center|Centre)\b/gi, '')
    .trim();

  const words = (sanitized || textToUse)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'GVR';

  if (words.length >= 3) {
    const acronym = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
    return isRawId(acronym) ? 'GVR' : acronym;
  }

  if (words.length === 2) {
    const w1 = words[0].toUpperCase();
    const w2 = words[1].toUpperCase();
    if (w1 === 'GREEN' && w2 === 'VALLEY') return 'GVR';
    if (w1.length >= 2) {
      const code = (w1.slice(0, 2) + w2[0]).toUpperCase();
      return isRawId(code) ? 'GVR' : code;
    }
    const code = (w1[0] + w2[0]).toUpperCase();
    return isRawId(code) ? 'GVR' : code;
  }

  const single = words[0].toUpperCase();
  if (single.length >= 3) {
    const code = single.slice(0, 3);
    return isRawId(code) ? 'GVR' : code;
  }
  return isRawId(single) ? 'GVR' : single;
}
