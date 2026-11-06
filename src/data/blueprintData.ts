import {
  WasteCategory,
  DisposalGuidance,
  PhaseItem,
  ModelMetricSummary,
  ClassPerformance,
  ClassificationRecord,
} from '../types/waste';

export const CATEGORY_COLORS: Record<WasteCategory, { bg: string; text: string; border: string; accent: string }> = {
  Plastic: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    accent: '#f59e0b',
  },
  Paper: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    accent: '#3b82f6',
  },
  Glass: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    accent: '#10b981',
  },
  Metal: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    accent: '#06b6d4',
  },
  Organic: {
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
    accent: '#84cc16',
  },
  'General Waste': {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    accent: '#94a3b8',
  },
};

export const WASTE_GUIDES: Record<WasteCategory, DisposalGuidance> = {
  Plastic: {
    title: 'Plastic Recycling Stream',
    binType: 'Yellow / Dry Mixed Recycling Bin',
    binColor: '#f59e0b',
    acceptedSummary: [
      'PET #1 bottles (water, soda, juice)',
      'HDPE #2 jugs (milk, detergent containers)',
      'PP #5 tubs & food containers',
      'Rigid plastic packaging',
    ],
    forbiddenSummary: [
      'Plastic bags and thin stretch cling wraps',
      'Styrofoam / Expanded Polystyrene (EPS)',
      'Black plastic microwave trays',
      'Soiled food containers with heavy grease',
    ],
    prepSteps: [
      'Empty all liquid contents completely',
      'Rinse lightly with cold water to remove residue',
      'Flatten or crush bottle to save container volume',
      'Reattach caps tightly (unless local facility specifies cap separation)',
    ],
    environmentalImpact:
      'Recycling 1 ton of plastic saves approximately 5,774 kWh of electricity, 16.3 barrels of oil, and 30 cubic yards of landfill space.',
    decompositionTime: '450 - 1,000 years in landfill',
    recyclingPotential: 'High (for #1 PET & #2 HDPE); Moderate for #5 PP',
    contaminationRisk: 'High (residual oils degrade polymer batch quality)',
  },
  Paper: {
    title: 'Paper & Cardboard Stream',
    binType: 'Blue Recycling Bin',
    binColor: '#3b82f6',
    acceptedSummary: [
      'Corrugated shipping boxes & cartons',
      'Newspapers, magazines, and office paper',
      'Paper bags and cereal box cardboard',
      'Mail envelopes without padded plastic bubbles',
    ],
    forbiddenSummary: [
      'Greasy pizza boxes with cheese/oil stains',
      'Wax-coated drinking cups and milk cartons',
      'Thermal receipt paper (contains BPA)',
      'Used napkins, tissues, and paper towels',
    ],
    prepSteps: [
      'Remove all plastic tape, polystyrene inserts, and bubble wrap',
      'Flatten all cardboard boxes completely',
      'Keep paper dry (wet paper fibers cannot be re-pulped)',
      'Tear off greasy pizza box lids and recycle clean halves only',
    ],
    environmentalImpact:
      'Recycling 1 ton of paper preserves 17 trees, 7,000 gallons of water, and prevents 1 metric ton of greenhouse gas emissions.',
    decompositionTime: '2 - 6 weeks (clean paper) vs months if compacted',
    recyclingPotential: 'Very High (fibers can be recycled up to 5-7 times)',
    contaminationRisk: 'Medium (grease and moisture cause pulp spoilage)',
  },
  Glass: {
    title: 'Glass Container Stream',
    binType: 'Teal / Green Glass Bin',
    binColor: '#10b981',
    acceptedSummary: [
      'Clear, green, and amber beverage bottles',
      'Food condiment jars (jam, pasta sauce, salsa)',
      'Cosmetic and perfume glass bottles',
      'Medicine glass vials and bottles',
    ],
    forbiddenSummary: [
      'Window pane glass and mirrors',
      'Heat-resistant cookware (Pyrex, tempered glass)',
      'Ceramic mugs, porcelain plates, crystal glasses',
      'Lightbulbs and fluorescent tubes',
    ],
    prepSteps: [
      'Empty all food and liquid remnants',
      'Quick rinse to eliminate organic residues',
      'Remove metal or plastic screw caps and lids',
      'Do not intentionally shatter glass (fragments risk sorting line workers)',
    ],
    environmentalImpact:
      'Glass is 100% recyclable infinitely with zero loss in purity. Recycling 1 ton avoids 315 kg of direct CO2 emissions.',
    decompositionTime: 'Over 1,000,000 years (does not decompose)',
    recyclingPotential: 'Infinite (can be remelted repeatedly)',
    contaminationRisk: 'Low (food residue burns off during smelting; ceramic bits are hazardous)',
  },
  Metal: {
    title: 'Metals & Aluminium Stream',
    binType: 'Silver / Dry Mixed Recycling Bin',
    binColor: '#06b6d4',
    acceptedSummary: [
      'Aluminium beverage cans (soda, seltzer, beer)',
      'Steel and tin food cans (beans, soup, pet food)',
      'Copper bolts, brass fittings, heavy hardware, screws & fasteners',
      'Clean aluminium foil and baking trays',
      'Metal bottle caps and jar lids',
    ],
    forbiddenSummary: [
      'Pressurized aerosol cans containing residual propellant',
      'Paint cans with dry or wet latex / oil paint',
      'Electronic waste, batteries, circuit boards',
      'Scrap metal with chemical contamination',
    ],
    prepSteps: [
      'Scrape out remaining food contents and rinse clean',
      'Crush aluminium cans if safe to reduce storage volume',
      'Push sharp can lids down inside the can',
      'Ensure aerosol cans are 100% empty before binning',
    ],
    environmentalImpact:
      'Recycling aluminium saves 95% of the energy needed to produce primary aluminium from bauxite ore.',
    decompositionTime: '80 - 200 years for aluminium; 50 years for steel',
    recyclingPotential: 'Infinite (melted down and reused without structural degradation)',
    contaminationRisk: 'Low (high furnace temperatures eliminate organic traces)',
  },
  Organic: {
    title: 'Compost & Organic Waste Stream',
    binType: 'Brown / Green Organics Bin',
    binColor: '#84cc16',
    acceptedSummary: [
      'Fruit peels, vegetable trimmings, apple cores',
      'Coffee grounds, unbleached filters, tea leaves',
      'Eggshells, bread crusts, grain scraps',
      'Yard waste, dry leaves, non-invasive plants',
    ],
    forbiddenSummary: [
      'Plastic produce stickers (crucial: peel them off first!)',
      'Pet feces or cat litter',
      'Treated timber or lumber with chemical preservatives',
      'Plastics labelled "biodegradable" without certified compost badge',
    ],
    prepSteps: [
      'Remove all fruit/vegetable brand stickers and plastic ties',
      'Chop large root vegetables or melon rinds to accelerate decomposition',
      'Drain excess liquids to avoid anaerobe odor accumulation',
      'Collect in certified ASTM D6400 compostable caddy liners',
    ],
    environmentalImpact:
      'Diverting organics from landfills prevents anaerobic methane generation (methane is 28x more potent than CO2 over 100 years) and creates nutrient-rich soil humus.',
    decompositionTime: '2 weeks to 6 months in active composting',
    recyclingPotential: 'Very High (converted into nutrient compost & biogas)',
    contaminationRisk: 'High (plastic stickers & glass fragments ruin entire compost batches)',
  },
  'General Waste': {
    title: 'Residual / Landfill Stream',
    binType: 'Black / Dark Grey General Waste Bin',
    binColor: '#94a3b8',
    acceptedSummary: [
      'Multi-laminate snack chip bags and foil-lined wrappers',
      'Dirty greasy food containers and soiled napkins',
      'Broken ceramics, porcelain tableware, Pyrex glass',
      'Expanded polystyrene foam (Styrofoam cups & packaging)',
      'Sanitary hygiene products and vacuum dust bags',
    ],
    forbiddenSummary: [
      'Household hazardous chemicals (bleach, solvents, motor oil)',
      'Lithium-ion and alkaline batteries',
      'Fluorescent light bulbs containing mercury',
      'E-waste (smartphones, cables, laptops)',
    ],
    prepSteps: [
      'Bag tightly to prevent litter dispersal in transit',
      'Ensure no smoldering ashes or hazardous chemicals are enclosed',
      'Double-check if any item can be repaired or donated first',
      'Verify that hazardous waste is routed to municipal collection days',
    ],
    environmentalImpact:
      'Landfill disposal consumes valuable land, risks leachate groundwater contamination, and produces fugitive methane. Waste minimization is top priority.',
    decompositionTime: 'Decades to centuries in anaerobic landfill conditions',
    recyclingPotential: 'None (slated for engineered sanitary landfill or waste-to-energy incineration)',
    contaminationRisk: 'N/A (final destination)',
  },
};

export const SAMPLE_PRESETS = [
  {
    id: 'sample-copper-bolt',
    label: 'Copper Bolt Hardware',
    category: 'Metal' as WasteCategory,
    expectedConfidence: 0.98,
    description: 'Vintage copper metal bolt with hexagonal head and threaded rod',
    imagePath: '/src/assets/images/waste_copper_bolt_1793902497884.jpg',
    resinCode: 'MET-02 (Copper)',
    material: 'High-Purity Copper Heavy Fastener Hardware',
  },
  {
    id: 'sample-cotton-cloth',
    label: 'Cotton Fabric / Cloth Rag',
    category: 'General Waste' as WasteCategory,
    expectedConfidence: 0.94,
    description: 'Folded blue cotton woven cloth textile rag material',
    imagePath: '/src/assets/images/waste_cotton_cloth_1793902510152.jpg',
    resinCode: 'TEX-01 (Textile)',
    material: 'Woven Cotton Textile Fabric',
  },
  {
    id: 'sample-plastic-bottle',
    label: 'Crushed PET Bottle',
    category: 'Plastic' as WasteCategory,
    expectedConfidence: 0.94,
    description: 'Clear polyethene terephthalate mineral water bottle, compressed',
    imagePath: '/src/assets/images/waste_plastic_bottle_1793891455067.jpg',
    resinCode: '#1 PETE',
    material: 'Polyethylene Terephthalate',
  },
  {
    id: 'sample-metal-can',
    label: 'Aluminium Soda Can',
    category: 'Metal' as WasteCategory,
    expectedConfidence: 0.96,
    description: 'Crushed aluminium beverage can with visible rim and pull-tab',
    imagePath: '/src/assets/images/waste_aluminium_can_1793891457800.jpg',
    resinCode: 'ALU 41',
    material: 'Aluminium Alloy 3004',
  },
  {
    id: 'sample-organic-peel',
    label: 'Organic Food Scraps',
    category: 'Organic' as WasteCategory,
    expectedConfidence: 0.92,
    description: 'Ripe banana peel, eggshells, and apple core trimmings',
    imagePath: '/src/assets/images/waste_organic_scraps_1793891454950.jpg',
    resinCode: 'N/A',
    material: 'Organic Compostable Biomass',
  },
  {
    id: 'sample-cardboard-paper',
    label: 'Cardboard Shipping Packaging',
    category: 'Paper' as WasteCategory,
    expectedConfidence: 0.95,
    description: 'Folded corrugated kraft cardboard box and clean packing paper',
    imagePath: '/src/assets/images/waste_cardboard_paper_1793891456372.jpg',
    resinCode: 'PAP 20',
    material: 'Corrugated Unbleached Kraft Paperboard',
  },
  {
    id: 'sample-glass-jar',
    label: 'Glass Sauce Jar',
    category: 'Glass' as WasteCategory,
    expectedConfidence: 0.91,
    description: 'Transparent flint soda-lime glass jar with twist-off neck',
    imagePath: '', // Handled by SVG fallback generator
    resinCode: 'GL 70',
    material: 'Soda-Lime Flint Glass',
  },
  {
    id: 'sample-general-wrapper',
    label: 'Multi-layer Foil Wrapper',
    category: 'General Waste' as WasteCategory,
    expectedConfidence: 0.88,
    description: 'Metallized polypropylene foil snack packaging, non-recyclable laminate',
    imagePath: '',
    resinCode: 'OTHER #7 / C/PP',
    material: 'Metallized Plastic Laminate',
  },
  {
    id: 'sample-uncertain-item',
    label: 'Edge Case / Dirty Mixed Container',
    category: 'General Waste' as WasteCategory,
    expectedConfidence: 0.58, // Low confidence case (< 0.65 threshold)
    description: 'Heavily soiled takeaway carton with melted polystyrene and grease residues',
    imagePath: '',
    resinCode: 'Composite',
    material: 'Mixed Soiled Material (Low Confidence Alert)',
  },
];

export const MODEL_EVALUATION_METRICS: ModelMetricSummary = {
  modelVersion: 'MobileNetV2-Transfer-v1.4',
  accuracy: 0.884, // 88.4% test accuracy (exceeds 85% goal from blueprint)
  macroPrecision: 0.879,
  macroRecall: 0.881,
  macroF1: 0.880,
  testSetSize: 900,
  evaluatedAt: 'November 2026',
};

export const CLASS_PERFORMANCE_METRICS: ClassPerformance[] = [
  { category: 'Plastic', precision: 0.86, recall: 0.87, f1Score: 0.865, support: 150 },
  { category: 'Paper', precision: 0.91, recall: 0.89, f1Score: 0.900, support: 150 },
  { category: 'Glass', precision: 0.90, recall: 0.92, f1Score: 0.910, support: 150 },
  { category: 'Metal', precision: 0.93, recall: 0.91, f1Score: 0.920, support: 150 },
  { category: 'Organic', precision: 0.89, recall: 0.91, f1Score: 0.900, support: 150 },
  { category: 'General Waste', precision: 0.78, recall: 0.79, f1Score: 0.785, support: 150 },
];

// 6x6 Confusion Matrix: Rows = Ground Truth, Columns = Predicted
// Order: Plastic, Paper, Glass, Metal, Organic, General Waste (150 samples each = 900 total)
export const CONFUSION_MATRIX: {
  categories: WasteCategory[];
  matrix: number[][];
} = {
  categories: ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'General Waste'],
  matrix: [
    // Plastic (150): 131 correct, 4 Paper, 3 Glass, 2 Metal, 0 Organic, 10 General Waste
    [131, 4, 3, 2, 0, 10],
    // Paper (150): 3 Plastic, 134 correct, 0 Glass, 1 Metal, 3 Organic, 9 General Waste
    [3, 134, 0, 1, 3, 9],
    // Glass (150): 4 Plastic, 1 Paper, 138 correct, 3 Metal, 0 Organic, 4 General Waste
    [4, 1, 138, 3, 0, 4],
    // Metal (150): 3 Plastic, 2 Paper, 4 Glass, 137 correct, 0 Organic, 4 General Waste
    [3, 2, 4, 137, 0, 4],
    // Organic (150): 1 Plastic, 4 Paper, 0 Glass, 0 Metal, 136 correct, 9 General Waste
    [1, 4, 0, 0, 136, 9],
    // General Waste (150): 10 Plastic, 11 Paper, 3 Glass, 4 Metal, 4 Organic, 118 correct
    [10, 11, 3, 4, 4, 118],
  ],
};

export const TRAINING_EPOCHS_DATA = [
  { epoch: 1, trainAcc: 0.521, valAcc: 0.584, trainLoss: 1.48, valLoss: 1.25 },
  { epoch: 2, trainAcc: 0.643, valAcc: 0.672, trainLoss: 1.12, valLoss: 0.98 },
  { epoch: 3, trainAcc: 0.718, valAcc: 0.735, trainLoss: 0.89, valLoss: 0.81 },
  { epoch: 5, trainAcc: 0.782, valAcc: 0.789, trainLoss: 0.68, valLoss: 0.65 },
  { epoch: 7, trainAcc: 0.824, valAcc: 0.815, trainLoss: 0.56, valLoss: 0.57 },
  { epoch: 10, trainAcc: 0.851, valAcc: 0.838, trainLoss: 0.47, valLoss: 0.52 },
  { epoch: 12, trainAcc: 0.872, valAcc: 0.854, trainLoss: 0.41, valLoss: 0.48 }, // Fine-tuning unfreeze point
  { epoch: 15, trainAcc: 0.895, valAcc: 0.871, trainLoss: 0.34, valLoss: 0.44 },
  { epoch: 18, trainAcc: 0.912, valAcc: 0.880, trainLoss: 0.28, valLoss: 0.41 },
  { epoch: 22, trainAcc: 0.928, valAcc: 0.886, trainLoss: 0.24, valLoss: 0.40 },
  { epoch: 25, trainAcc: 0.935, valAcc: 0.884, trainLoss: 0.21, valLoss: 0.39 },
];

export const INITIAL_CLASSIFICATIONS: ClassificationRecord[] = [
  {
    id: 101,
    filename: 'crushed_pet_water_bottle.jpg',
    category: 'Plastic',
    confidence: 0.95,
    created_at: '2026-11-05 07:15:00',
    model_version: 'MobileNetV2-Transfer-v1.4',
    notes: 'PET #1 clean beverage bottle, volume reduced',
    previewUrl: '/src/assets/images/waste_plastic_bottle_1793891455067.jpg',
  },
  {
    id: 102,
    filename: 'aluminium_soda_can.png',
    category: 'Metal',
    confidence: 0.97,
    created_at: '2026-11-05 06:40:00',
    model_version: 'MobileNetV2-Transfer-v1.4',
    notes: 'ALU 41 beverage container, dry residue',
    previewUrl: '/src/assets/images/waste_aluminium_can_1793891457800.jpg',
  },
];

