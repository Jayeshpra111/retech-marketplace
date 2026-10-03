// Comprehensive mock dataset for ReTech Market
export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'Grid', count: 48 },
  { id: 'mobiles', name: 'Smartphones', icon: 'Smartphone', count: 12, impactMultiplier: 0.2 },
  { id: 'laptops', name: 'Laptops & MacBooks', icon: 'Laptop', count: 9, impactMultiplier: 2.1 },
  { id: 'tablets', name: 'Tablets & iPads', icon: 'Tablet', count: 6, impactMultiplier: 0.6 },
  { id: 'audio', name: 'Headphones & Audio', icon: 'Headphones', count: 5, impactMultiplier: 0.3 },
  { id: 'cameras', name: 'Cameras & Lenses', icon: 'Camera', count: 4, impactMultiplier: 0.9 },
  { id: 'gaming', name: 'Gaming Consoles', icon: 'Gamepad2', count: 4, impactMultiplier: 3.2 },
  // Component Marketplace
  { id: 'gpus', name: 'Graphics Cards (GPUs)', icon: 'Cpu', count: 8, isComponent: true, impactMultiplier: 1.4 },
  { id: 'ram', name: 'Memory (RAM)', icon: 'MemoryStick', count: 7, isComponent: true, impactMultiplier: 0.05 },
  { id: 'storage', name: 'SSDs & Storage', icon: 'HardDrive', count: 6, isComponent: true, impactMultiplier: 0.1 },
  { id: 'motherboards', name: 'Motherboards', icon: 'Layers', count: 5, isComponent: true, impactMultiplier: 0.8 },
  { id: 'psus', name: 'Power Supplies', icon: 'Zap', count: 4, isComponent: true, impactMultiplier: 1.9 },
];

export const CONDITION_GRADES = {
  like_new: {
    label: 'Like New',
    color: 'condition-grade--like-new',
    dot: 'condition-dot--like-new',
    description: 'Flawless cosmetic condition. 100% operational with minimal or zero signs of wear.'
  },
  good: {
    label: 'Good',
    color: 'condition-grade--good',
    dot: 'condition-dot--good',
    description: 'Fully functional with light micro-scratches or gentle daily cosmetic use.'
  },
  fair: {
    label: 'Fair',
    color: 'condition-grade--fair',
    dot: 'condition-dot--fair',
    description: 'Fully functional, but displays noticeable scratches, dents, or cosmetic scuffs.'
  },
  needs_repair: {
    label: 'Needs Repair',
    color: 'condition-grade--needs-repair',
    dot: 'condition-dot--needs-repair',
    description: 'Specific part broken or degraded (e.g., degraded battery or faulty port), repairable.'
  },
  for_parts: {
    label: 'For Parts / Salvage',
    color: 'condition-grade--for-parts',
    dot: 'condition-dot--for-parts',
    description: 'Non-functional whole device, but contains working salvageable parts and chips.'
  }
};

export const INITIAL_LISTINGS = [
  {
    id: 'listing-1',
    title: 'Apple MacBook Pro 14" (M1 Pro, 16GB RAM, 512GB SSD) - Space Gray',
    category: 'laptops',
    price: 94999,
    originalPrice: 194900,
    condition: 'like_new',
    conditionDetails: 'Zero scratches, battery health 92% (148 cycles). Always used in hard shell case with external monitor.',
    brand: 'Apple',
    model: 'MacBook Pro 14" (2021)',
    age: '1.5 years',
    warranty: 'Expired (AppleCare eligible checkable)',
    hasBill: true,
    hasBox: true,
    accessories: ['Original 67W MagSafe Charger', 'Braided Cable', 'Original Box'],
    city: 'Bangalore, Indiranagar',
    seller: {
      id: 'seller-1',
      name: 'Aditya Rao',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 38,
      verified: true,
      memberSince: 'March 2024',
      responseTime: '< 15 mins'
    },
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 2.1,
    co2SavedKg: 145,
    specs: {
      'Processor': 'Apple M1 Pro (8-core CPU, 14-core GPU)',
      'Unified RAM': '16GB',
      'Storage': '512GB Ultra-fast NVMe',
      'Display': '14.2" Liquid Retina XDR 120Hz ProMotion',
      'Battery Health': '92%'
    },
    isNegotiable: true,
    views: 412,
    createdAt: '2 hours ago'
  },
  {
    id: 'listing-2',
    title: 'NVIDIA GeForce RTX 3080 Founders Edition 10GB GDDR6X',
    category: 'gpus',
    price: 38500,
    originalPrice: 71000,
    condition: 'good',
    conditionDetails: 'Lightly gamed on for weekend CS2 and Blender rendering. Repasted with Thermal Grizzly Kryonaut 2 months ago. Max temp 68°C under FurMark.',
    brand: 'NVIDIA',
    model: 'RTX 3080 FE',
    age: '2 years',
    warranty: 'Expired',
    hasBill: true,
    hasBox: true,
    accessories: ['12-pin to dual 8-pin adapter', 'Original FE box'],
    city: 'Mumbai, Andheri West',
    seller: {
      id: 'seller-2',
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 19,
      verified: true,
      memberSince: 'Jan 2024',
      responseTime: '< 30 mins'
    },
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 1.45,
    co2SavedKg: 85,
    specs: {
      'VRAM': '10GB GDDR6X',
      'Bus Width': '320-bit',
      'Interface': 'PCIe 4.0 x16',
      'Power Connector': '12-pin Micro-fit (Adapter included)',
      'TDP': '320W (Recommend 750W+ PSU)',
      'Outputs': '3x DisplayPort 1.4a, 1x HDMI 2.1'
    },
    isNegotiable: true,
    views: 689,
    createdAt: '5 hours ago'
  },
  {
    id: 'listing-3',
    title: 'iPad Pro 11" M1 (Cracked Screen - Working M1 Logic Board & Cameras)',
    category: 'tablets',
    price: 18500,
    originalPrice: 71900,
    condition: 'for_parts',
    conditionDetails: 'Dropped from desk. Display glass cracked and touch unresponsive on right half. Logic board boots up, connects to iTunes/Finder, cameras and FaceID sensor are undamaged!',
    whatWorks: 'M1 Motherboard, 128GB Flash, FaceID Sensor Array, Quad-speakers, USB-C Thunderbolt port, Front & Back Cameras.',
    whatBroken: 'Front glass shattered, display panel flickering touch input. Needs screen assembly replacement.',
    brand: 'Apple',
    model: 'iPad Pro 11" 3rd Gen (M1)',
    age: '2.5 years',
    warranty: 'None',
    hasBill: false,
    hasBox: false,
    accessories: ['Device only'],
    city: 'Pune, Kothrud',
    seller: {
      id: 'seller-3',
      name: 'Pooja Nair',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 14,
      verified: true,
      memberSince: 'August 2024',
      responseTime: '< 1 hour'
    },
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 0.65,
    co2SavedKg: 38,
    specs: {
      'Chip': 'Apple M1 Silicon',
      'Storage': '128GB NVMe',
      'Connectivity': 'Wi-Fi 6 + Bluetooth 5.0',
      'Color': 'Space Gray',
      'Intended Use': 'Donor logic board, DIY repair, or headless desktop Mac setup'
    },
    isNegotiable: false,
    views: 310,
    createdAt: '1 day ago'
  },
  {
    id: 'listing-4',
    title: 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz CL30 AMD EXPO / Intel XMP',
    category: 'ram',
    price: 8200,
    originalPrice: 12500,
    condition: 'like_new',
    conditionDetails: 'Used for 3 months in a test rig. Tested with MemTest86 with zero errors at 6000MHz CL30-36-36-76.',
    brand: 'Corsair',
    model: 'CMH32GX5M2B6000Z30K',
    age: '3 months',
    warranty: '9.5 years remaining (Lifetime Limited Manufacturer Warranty)',
    hasBill: true,
    hasBox: true,
    accessories: ['Original clamshell packaging', 'Invoice for warranty'],
    city: 'Hyderabad, Hitec City',
    seller: {
      id: 'seller-4',
      name: 'Vikram Joshi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 42,
      verified: true,
      memberSince: 'Dec 2023',
      responseTime: '< 10 mins'
    },
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555617981-d3a95610e238?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 0.08,
    co2SavedKg: 12,
    specs: {
      'DDR Generation': 'DDR5',
      'Capacity': '32GB Kit (2x 16GB)',
      'Speed': '6000 MT/s',
      'Tested Latency': 'CL30-36-36-76 (Low Latency Hynix A-die)',
      'Profiles': 'AMD EXPO & Intel XMP 3.0 Ready'
    },
    isNegotiable: true,
    views: 245,
    createdAt: '3 hours ago'
  },
  {
    id: 'listing-5',
    title: 'Samsung 980 PRO 2TB NVMe M.2 Gen4 Internal SSD with Heatsink (PS5 Ready)',
    category: 'storage',
    price: 11200,
    originalPrice: 17500,
    condition: 'like_new',
    conditionDetails: '100% SMART Health in Samsung Magician. Total Bytes Written (TBW) only 14TB out of 1200TB rated lifespan.',
    brand: 'Samsung',
    model: 'MZ-V8P2T0CW',
    age: '7 months',
    warranty: '4 years 5 months remaining from Samsung India',
    hasBill: true,
    hasBox: true,
    accessories: ['Pre-installed Heatsink', 'Retail packaging', 'Tax Invoice'],
    city: 'Delhi NCR, Gurgaon',
    seller: {
      id: 'seller-1',
      name: 'Aditya Rao',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 38,
      verified: true,
      memberSince: 'March 2024',
      responseTime: '< 15 mins'
    },
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 0.12,
    co2SavedKg: 18,
    specs: {
      'Form Factor': 'M.2 2280 NVMe',
      'Interface': 'PCIe Gen 4.0 x4',
      'Read Speed': 'Up to 7,000 MB/s',
      'Write Speed': 'Up to 5,100 MB/s',
      'Compatibility': 'PlayStation 5, PC Desktops, Laptops'
    },
    isNegotiable: false,
    views: 520,
    createdAt: '6 hours ago'
  },
  {
    id: 'listing-6',
    title: 'Sony Alpha A7 III Full-Frame Mirrorless Camera (Body Only, Shutter Count 8.2k)',
    category: 'cameras',
    price: 81000,
    originalPrice: 139990,
    condition: 'good',
    conditionDetails: 'Carefully preserved body with minor paint rub on the bottom tripod plate. Shutter count only 8,240 (rated for 200k). Sensor is immaculate.',
    brand: 'Sony',
    model: 'ILCE-7M3',
    age: '2 years',
    warranty: 'Expired',
    hasBill: true,
    hasBox: true,
    accessories: ['2x Original Sony NP-FZ100 Batteries', 'Dual USB Charger', 'Shoulder Strap', 'Body Cap'],
    city: 'Chennai, T. Nagar',
    seller: {
      id: 'seller-5',
      name: 'Karthik Subramanian',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 4.95,
      reviewCount: 29,
      verified: true,
      memberSince: 'February 2024',
      responseTime: '< 20 mins'
    },
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
    ],
    impactKg: 0.95,
    co2SavedKg: 62,
    specs: {
      'Sensor': '24.2 MP Full-Frame Exmor R BSI CMOS',
      'Image Stabilization': '5-Axis SteadyShot INSIDE',
      'Autofocus': '693 Phase-Detection AF Points',
      'Video': 'UHD 4K30p with HLG & S-Log3 Gammas',
      'Shutter Actuations': '8,240 clicks'
    },
    isNegotiable: true,
    views: 430,
    createdAt: '1 day ago'
  }
];

export const MOCK_RECYCLERS = [
  {
    id: 'rec-1',
    name: 'EcoRecycle Solutions Hub',
    city: 'Bangalore',
    address: 'Plot 42, Electronic City Phase 1, Near Toll Gate',
    phone: '+91 80 2852 9012',
    certifications: ['R2 Certified', 'CPCB Authorized', 'ISO 14001'],
    acceptedItems: ['Lithium Batteries', 'Printed Circuit Boards', 'Broken Displays', 'Old CRT Monitors', 'Cable Wire Scrap'],
    pickupAvailable: true
  },
  {
    id: 'rec-2',
    name: 'GreenBytes E-Waste Reclamation',
    city: 'Mumbai',
    address: 'Unit 18, MIDC Andheri East, Near Chakala Metro',
    phone: '+91 22 6123 4400',
    certifications: ['CPCB Authorized', 'e-Stewards Partner'],
    acceptedItems: ['Dead Motherboards', 'Swollen Phone Batteries', 'Household Electronics', 'Power Adapters'],
    pickupAvailable: true
  },
  {
    id: 'rec-3',
    name: 'CleanEarth Circular Center',
    city: 'Delhi NCR',
    address: 'Sector 37, Pace City II, Gurugram, Haryana',
    phone: '+91 124 456 7890',
    certifications: ['Govt Authorized Recycler', 'Zero-Landfill Certified'],
    acceptedItems: ['Server Racks', 'Smartphones', 'Computer Peripherals', 'Printers & Cartridges'],
    pickupAvailable: false
  }
];
