// ============================================
// AGRI-FINE VENTURES — GREENHOUSE DATA
// ============================================

const today = new Date();
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
const fmt = (d) => d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

AFV.greenhouses = [
  {
    id: 1,
    name: 'Greenhouse 1',
    crop: 'Tomato',
    variety: 'Tylka F1',
    cropEmoji: '🍅',
    bgClass: 'gh-img-1',
    imageUrl: '',
    plantedDate: daysAgo(62),
    expectedHarvest: daysFromNow(28),
    area: '0.5 acres',
    plants: 2400,
    worker: 'worker1',
    pricePerKg: 120,
    environment: { temp: '24°C', humidity: '72%', ph: '6.2', ec: '3.4' },
    notes: 'Plants showing excellent development. First truss already set.',
    tasks: [
      { id: 't1_1', name: 'Foliar Spray — Calcium Nitrate', category: 'nutrition', priority: 'high', desc: 'Apply 500ml Cal-Nit per 20L water. Cover entire canopy. Early morning preferred.', duration: '3 hours', completed: true, completedAt: daysAgo(1), completedBy: 'worker1' },
      { id: 't1_2', name: 'Lateral Shoot Removal (Deleafing)', category: 'pruning', priority: 'high', desc: 'Remove all side shoots below the 4th truss. Leave leaves above for photosynthesis.', duration: '4 hours', completed: true, completedAt: daysAgo(3), completedBy: 'worker1' },
      { id: 't1_3', name: 'Irrigation Check & Drip Adjustment', category: 'irrigation', priority: 'medium', desc: 'Check all drip emitters for blockages. Adjust flow to 2L/plant/day.', duration: '2 hours', completed: false },
      { id: 't1_4', name: 'Truss Support — String Tying', category: 'training', priority: 'medium', desc: 'Support truss 3 and 4 with jute string. Tie loosely to avoid stem damage.', duration: '3 hours', completed: false },
      { id: 't1_5', name: 'Pest Scouting — Whitefly & Spider Mite', category: 'pest', priority: 'high', desc: 'Inspect lower leaves. Check sticky traps. Record counts. Apply Abamectin if threshold exceeded.', duration: '2 hours', completed: false },
      { id: 't1_6', name: 'Bottom Leaf Removal (Defoliation)', category: 'pruning', priority: 'low', desc: 'Remove 2 bottom leaves per plant to improve air circulation and light penetration.', duration: '3 hours', completed: false },
      { id: 't1_7', name: 'First Harvest — Cluster Pick', category: 'harvest', priority: 'high', desc: 'Harvest mature red tomatoes from bottom trusses. Target: 800kg. Handle carefully.', duration: '8 hours', completed: false },
    ]
  },
  {
    id: 2,
    name: 'Greenhouse 2',
    crop: 'Capsicum',
    variety: 'Maestro F1',
    cropEmoji: '🌶️',
    bgClass: 'gh-img-2',
    imageUrl: '',
    plantedDate: daysAgo(44),
    expectedHarvest: daysFromNow(56),
    area: '0.4 acres',
    plants: 1800,
    worker: 'worker1',
    pricePerKg: 150,
    environment: { temp: '26°C', humidity: '68%', ph: '6.0', ec: '3.1' },
    notes: 'Vegetative stage progressing well. Slight yellowing on lower leaves — likely magnesium deficiency.',
    tasks: [
      { id: 't2_1', name: 'Transplant Hardening Complete', category: 'planting', priority: 'high', desc: 'Transplanting from nursery done successfully.', duration: '6 hours', completed: true, completedAt: daysAgo(44), completedBy: 'worker1' },
      { id: 't2_2', name: 'First Irrigation Setup', category: 'irrigation', priority: 'high', desc: 'Install drip lines and calibrate emitters at 1.5L/plant/day.', duration: '5 hours', completed: true, completedAt: daysAgo(42), completedBy: 'worker1' },
      { id: 't2_3', name: 'Magnesium Sulphate Foliar Spray', category: 'nutrition', priority: 'high', desc: 'Apply 300g MgSO4 per 20L water to correct deficiency signs. Repeat in 7 days.', duration: '2 hours', completed: false },
      { id: 't2_4', name: 'Staking & Plant Training', category: 'training', priority: 'medium', desc: 'Drive wooden stakes 40cm from plant. Tie main stem at 15cm and 30cm.', duration: '5 hours', completed: false },
      { id: 't2_5', name: 'Basal Fertilizer Top-Dress', category: 'nutrition', priority: 'medium', desc: 'Apply CAN (200kg/acre) and NPK 17:17:17 (100kg/acre). Incorporate lightly.', duration: '3 hours', completed: false },
      { id: 't2_6', name: 'Fungicide Application — Alternaria Prevention', category: 'pest', priority: 'medium', desc: 'Spray Mancozeb at 2.5g/L water as preventive measure. Cover undersides of leaves.', duration: '2 hours', completed: false },
    ]
  },
  {
    id: 3,
    name: 'Greenhouse 3',
    crop: 'Cucumber',
    variety: 'Cuesta F1',
    cropEmoji: '🥒',
    bgClass: 'gh-img-3',
    imageUrl: '',
    plantedDate: daysAgo(28),
    expectedHarvest: daysFromNow(42),
    area: '0.35 acres',
    plants: 1800,
    worker: 'worker2',
    pricePerKg: 80,
    environment: { temp: '26°C', humidity: '75%', ph: '6.2', ec: '2.5' },
    notes: 'Vegetative growth stage. Vines showing vigorous development.',
    tasks: [
      { id: 't3_1', name: 'Trellis System Installation', category: 'training', priority: 'high', desc: 'Install overhead wire trellis for vertical training.', duration: '6 hours', completed: true, completedAt: daysAgo(28), completedBy: 'worker2' },
      { id: 't3_2', name: 'First Training — Main Vine', category: 'training', priority: 'high', desc: 'Train main vine vertically. Tie at 20cm intervals.', duration: '4 hours', completed: true, completedAt: daysAgo(26), completedBy: 'worker2' },
      { id: 't3_3', name: 'Fertigation Setup', category: 'nutrition', priority: 'high', desc: 'Set up fertigation at EC 2.0. Apply 15:15:30 formula.', duration: '2 hours', completed: false },
      { id: 't3_4', name: 'Side Shoot Removal', category: 'pruning', priority: 'medium', desc: 'Remove all side shoots up to 10th node.', duration: '3 hours', completed: false },
      { id: 't3_5', name: 'Pest Scouting — Aphids', category: 'pest', priority: 'medium', desc: 'Check undersides of leaves for aphid colonies.', duration: '2 hours', completed: false },
    ]
  },
  {
    id: 4,
    name: 'Greenhouse 4',
    crop: 'Cucumber',
    variety: 'Natalia F1',
    cropEmoji: '🥒',
    bgClass: 'gh-img-4',
    imageUrl: '',
    plantedDate: daysAgo(10),
    expectedHarvest: daysFromNow(60),
    area: '0.4 acres',
    plants: 2000,
    worker: 'worker2',
    environment: { temp: '25°C', humidity: '78%', ph: '6.1', ec: '2.2' },
    notes: 'Recently transplanted. Plants establishing well.',
    tasks: [
      { id: 't4_1', name: 'Bed Preparation Complete', category: 'preparation', priority: 'high', desc: 'Beds prepared and sterilized.', duration: '2 days', completed: true, completedAt: daysAgo(14), completedBy: 'worker2' },
      { id: 't4_2', name: 'Media Bag Filling', category: 'planting', priority: 'high', desc: 'Coco peat bags laid in double rows.', duration: '5 hours', completed: true, completedAt: daysAgo(12), completedBy: 'worker2' },
      { id: 't4_3', name: 'Transplanting Complete', category: 'planting', priority: 'high', desc: '2,000 plants transplanted successfully.', duration: '6 hours', completed: true, completedAt: daysAgo(10), completedBy: 'worker2' },
      { id: 't4_4', name: 'Shade Net Installation', category: 'environment', priority: 'high', desc: 'Install 50% shade nets for first 2 weeks.', duration: '2 hours', completed: false },
      { id: 't4_5', name: 'Root Development Drench', category: 'nutrition', priority: 'medium', desc: 'Apply IBA root hormone at 1ml/L.', duration: '2 hours', completed: false },
      { id: 't4_6', name: 'Initial Staking', category: 'training', priority: 'medium', desc: 'Insert stakes and prepare trellis system.', duration: '3 hours', completed: false },
    ]
  },
  {
    id: 5,
    name: 'Greenhouse 5',
    crop: 'Tomato',
    variety: 'Rimai F1',
    cropEmoji: '🍅',
    bgClass: 'gh-img-5',
    imageUrl: '',
    plantedDate: daysAgo(5),
    expectedHarvest: daysFromNow(95),
    area: '0.5 acres',
    plants: 2500,
    worker: 'worker3',
    environment: { temp: '25°C', humidity: '75%', ph: '6.4', ec: '1.6' },
    notes: 'Brand new crop. Nursery plants sourced from certified supplier.',
    tasks: [
      { id: 't5_1', name: 'Greenhouse Sanitation & Fumigation', category: 'preparation', priority: 'high', desc: 'Steam sterilize all surfaces. Apply sulfur smoke to kill residual pests.', duration: '1 day', completed: true, completedAt: daysAgo(8), completedBy: 'worker3' },
      { id: 't5_2', name: 'Irrigation System Installation', category: 'irrigation', priority: 'high', desc: 'Install new drip lines. Pressure test at 2 bar. Install filters.', duration: '1 day', completed: true, completedAt: daysAgo(6), completedBy: 'worker3' },
      { id: 't5_3', name: 'Seedling Transplanting', category: 'planting', priority: 'high', desc: 'Transplant 5-week seedlings. Space at 40cm x 120cm.', duration: '8 hours', completed: true, completedAt: daysAgo(5), completedBy: 'worker3' },
      { id: 't5_4', name: 'First Watering — Establishment', category: 'irrigation', priority: 'high', desc: 'Water at 2L/plant immediately after transplanting. Do NOT fertigate yet.', duration: '1 hour', completed: true, completedAt: daysAgo(5), completedBy: 'worker3' },
      { id: 't5_5', name: 'Apply Anti-Transpirant Spray', category: 'stress_management', priority: 'high', desc: 'Spray Vapor Gard at 5ml/L to reduce water stress during establishment.', duration: '2 hours', completed: false },
      { id: 't5_6', name: 'Install Shade Nets — 40%', category: 'environment', priority: 'medium', desc: 'Hang 40% shade nets over canopy. Remove after 2 weeks when plants are established.', duration: '3 hours', completed: false },
      { id: 't5_7', name: 'Begin Fertigation — Week 1 Formula', category: 'nutrition', priority: 'medium', desc: 'Start gentle fertigation at EC 1.6. Formula: 15:15:30 at 1.5g/L. 3x daily.', duration: '1 hour', completed: false },
    ]
  }
];

// Init some activity log entries
AFV.activityLog = [
  { icon: '✅', text: 'Peter Kamau completed "Foliar Spray" in Greenhouse 1', time: new Date(Date.now() - 3600000) },
  { icon: '🔬', text: 'Dr. Grace Njeri submitted observation for Greenhouse 2', time: new Date(Date.now() - 7200000) },
  { icon: '🌡️', text: 'Temperature alert: GH4 reached 29°C — vents opened automatically', time: new Date(Date.now() - 10800000) },
  { icon: '✅', text: 'Mary Wanjiku completed "Irrigation Setup" in Greenhouse 4', time: new Date(Date.now() - 18000000) },
  { icon: '📦', text: 'Admin approved new supply order: 50kg Mancozeb, 20kg CAN', time: new Date(Date.now() - 86400000) },
];

AFV.agronomistReports = [
  {
    id: 1,
    ghId: 2,
    type: 'issue',
    text: 'Observed interveinal chlorosis (yellowing between leaf veins) on lower leaves of GH2 capsicum. Classic symptom of Magnesium deficiency. Recommend immediate foliar application of MgSO4 at 300g/20L and check the irrigation pH — if above 6.5, Mg uptake will be blocked.',
    tags: ['nutrient-deficiency', 'magnesium', 'urgent'],
    author: 'Dr. Grace Njeri',
    timestamp: new Date(Date.now() - 7200000),
    acknowledged: false
  },
  {
    id: 2,
    ghId: 1,
    type: 'recommendation',
    text: 'GH1 tomatoes are approaching first harvest window. Recommend harvesting at 80% red color for shelf life. Brief the workers on cluster-picking technique to avoid damaging the calyx. Post-harvest, apply a sulfur-based fungicide to prevent Botrytis on open wounds.',
    tags: ['harvest', 'botrytis-prevention', 'quality'],
    author: 'Dr. Grace Njeri',
    timestamp: new Date(Date.now() - 86400000 * 2),
    acknowledged: true
  }
];
