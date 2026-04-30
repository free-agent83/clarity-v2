import type {
  EngagementRingItem,
  JewelryImage,
} from "@/fixtures/types/engagement-ring";

const RING_IMG = "/ring.jpg";

const imgs = (id: string): JewelryImage[] => [
  { url: RING_IMG, sortOrder: 0, isThumbnail: true },
  { url: RING_IMG, sortOrder: 1, isThumbnail: false },
  { url: RING_IMG, sortOrder: 2, isThumbnail: false },
];

// Stable lookup IDs for filter consistency.
const METAL = {
  yg14: { id: "metal-yg14", value: "14k Yellow Gold" },
  wg14: { id: "metal-wg14", value: "14k White Gold" },
  rg14: { id: "metal-rg14", value: "14k Rose Gold" },
  yg18: { id: "metal-yg18", value: "18k Yellow Gold" },
  wg18: { id: "metal-wg18", value: "18k White Gold" },
  rg18: { id: "metal-rg18", value: "18k Rose Gold" },
  plat: { id: "metal-plat", value: "Platinum" },
} as const;

const SHAPE = {
  round: { id: "shape-round", value: "Round" },
  princess: { id: "shape-princess", value: "Princess" },
  cushion: { id: "shape-cushion", value: "Cushion" },
  oval: { id: "shape-oval", value: "Oval" },
  pear: { id: "shape-pear", value: "Pear" },
  emerald: { id: "shape-emerald", value: "Emerald" },
  asscher: { id: "shape-asscher", value: "Asscher" },
  marquise: { id: "shape-marquise", value: "Marquise" },
  radiant: { id: "shape-radiant", value: "Radiant" },
  heart: { id: "shape-heart", value: "Heart" },
} as const;

const BAND = {
  solitaire: { id: "band-solitaire", value: "Solitaire" },
  halo: { id: "band-halo", value: "Halo" },
  threeStone: { id: "band-three-stone", value: "Three-stone" },
  pave: { id: "band-pave", value: "Pavé" },
  cathedral: { id: "band-cathedral", value: "Cathedral" },
  vintage: { id: "band-vintage", value: "Vintage" },
  channel: { id: "band-channel", value: "Channel-set" },
  tension: { id: "band-tension", value: "Tension" },
  twist: { id: "band-twist", value: "Twist" },
  splitShank: { id: "band-split-shank", value: "Split-shank" },
} as const;

export const ENGAGEMENT_RINGS: EngagementRingItem[] = [
  {
    id: "ring-001",
    sku: "ER-700001",
    description:
      "Classic six-prong solitaire setting. Knife-edge band, 1.8mm taper.",
    images: imgs("ring-001"),
    bandStyle: BAND.solitaire,
    ringWidthMm: 1.8,
    availableMetals: [
      { id: "rm-001-1", metal: METAL.wg14, priceUsd: 1450 },
      { id: "rm-001-2", metal: METAL.yg14, priceUsd: 1450 },
      { id: "rm-001-3", metal: METAL.wg18, priceUsd: 2350 },
      { id: "rm-001-4", metal: METAL.plat, priceUsd: 3200 },
    ],
    compatibleStones: [
      { id: "rs-001-1", shape: SHAPE.round, maxCarat: 3.0 },
      { id: "rs-001-2", shape: SHAPE.cushion, maxCarat: 3.0 },
      { id: "rs-001-3", shape: SHAPE.oval, maxCarat: 3.0 },
    ],
  },
  {
    id: "ring-002",
    sku: "ER-700002",
    description:
      "Halo setting with pavé band. Centre stone surrounded by 0.30ct of melee accents.",
    images: imgs("ring-002"),
    bandStyle: BAND.halo,
    ringWidthMm: 2.0,
    availableMetals: [
      { id: "rm-002-1", metal: METAL.wg14, priceUsd: 2150 },
      { id: "rm-002-2", metal: METAL.wg18, priceUsd: 3100 },
      { id: "rm-002-3", metal: METAL.plat, priceUsd: 4250 },
    ],
    compatibleStones: [
      { id: "rs-002-1", shape: SHAPE.round, maxCarat: 2.5 },
      { id: "rs-002-2", shape: SHAPE.princess, maxCarat: 2.5 },
      { id: "rs-002-3", shape: SHAPE.cushion, maxCarat: 2.5 },
    ],
  },
  {
    id: "ring-003",
    sku: "ER-700003",
    description:
      "Three-stone setting with two trapezoid side stones flanking a centre prong-set diamond.",
    images: imgs("ring-003"),
    bandStyle: BAND.threeStone,
    ringWidthMm: 2.2,
    availableMetals: [
      { id: "rm-003-1", metal: METAL.yg18, priceUsd: 3800 },
      { id: "rm-003-2", metal: METAL.wg18, priceUsd: 3800 },
      { id: "rm-003-3", metal: METAL.plat, priceUsd: 4900 },
    ],
    compatibleStones: [
      { id: "rs-003-1", shape: SHAPE.round, maxCarat: 2.0 },
      { id: "rs-003-2", shape: SHAPE.emerald, maxCarat: 2.5 },
      { id: "rs-003-3", shape: SHAPE.radiant, maxCarat: 2.5 },
    ],
  },
  {
    id: "ring-004",
    sku: "ER-700004",
    description:
      "Cathedral setting with high-rise prongs. Tapered band, 1.6mm.",
    images: imgs("ring-004"),
    bandStyle: BAND.cathedral,
    ringWidthMm: 1.6,
    availableMetals: [
      { id: "rm-004-1", metal: METAL.wg14, priceUsd: 1750 },
      { id: "rm-004-2", metal: METAL.rg14, priceUsd: 1750 },
      { id: "rm-004-3", metal: METAL.plat, priceUsd: 3450 },
    ],
    compatibleStones: [
      { id: "rs-004-1", shape: SHAPE.round, maxCarat: 3.0 },
      { id: "rs-004-2", shape: SHAPE.oval, maxCarat: 3.5 },
      { id: "rs-004-3", shape: SHAPE.pear, maxCarat: 3.0 },
      { id: "rs-004-4", shape: SHAPE.marquise, maxCarat: 3.0 },
    ],
  },
  {
    id: "ring-005",
    sku: "ER-700005",
    description:
      "Vintage milgrain edge setting with hand-engraved gallery detail.",
    images: imgs("ring-005"),
    bandStyle: BAND.vintage,
    ringWidthMm: 2.5,
    availableMetals: [
      { id: "rm-005-1", metal: METAL.yg18, priceUsd: 2950 },
      { id: "rm-005-2", metal: METAL.rg18, priceUsd: 2950 },
      { id: "rm-005-3", metal: METAL.plat, priceUsd: 4100 },
    ],
    compatibleStones: [
      { id: "rs-005-1", shape: SHAPE.round, maxCarat: 2.0 },
      { id: "rs-005-2", shape: SHAPE.cushion, maxCarat: 2.5 },
      { id: "rs-005-3", shape: SHAPE.asscher, maxCarat: 2.0 },
    ],
  },
  {
    id: "ring-006",
    sku: "ER-700006",
    description:
      "Pavé band with diamonds across two-thirds of the shank. 1.7mm width.",
    images: imgs("ring-006"),
    bandStyle: BAND.pave,
    ringWidthMm: 1.7,
    availableMetals: [
      { id: "rm-006-1", metal: METAL.wg14, priceUsd: 1850 },
      { id: "rm-006-2", metal: METAL.wg18, priceUsd: 2750 },
      { id: "rm-006-3", metal: METAL.plat, priceUsd: 3850 },
    ],
    compatibleStones: [
      { id: "rs-006-1", shape: SHAPE.round, maxCarat: 2.5 },
      { id: "rs-006-2", shape: SHAPE.oval, maxCarat: 2.5 },
      { id: "rs-006-3", shape: SHAPE.princess, maxCarat: 2.0 },
    ],
  },
  {
    id: "ring-007",
    sku: "ER-700007",
    description:
      "Channel-set band with five round melee accents on each side of the centre stone.",
    images: imgs("ring-007"),
    bandStyle: BAND.channel,
    ringWidthMm: 2.4,
    availableMetals: [
      { id: "rm-007-1", metal: METAL.yg14, priceUsd: 2100 },
      { id: "rm-007-2", metal: METAL.wg14, priceUsd: 2100 },
      { id: "rm-007-3", metal: METAL.plat, priceUsd: 3950 },
    ],
    compatibleStones: [
      { id: "rs-007-1", shape: SHAPE.round, maxCarat: 1.5 },
      { id: "rs-007-2", shape: SHAPE.princess, maxCarat: 1.5 },
    ],
  },
  {
    id: "ring-008",
    sku: "ER-700008",
    description:
      "Tension setting — centre stone suspended between two polished arms, no prongs visible.",
    images: imgs("ring-008"),
    bandStyle: BAND.tension,
    ringWidthMm: 3.0,
    availableMetals: [
      { id: "rm-008-1", metal: METAL.plat, priceUsd: 5400 },
      { id: "rm-008-2", metal: METAL.wg18, priceUsd: 4200 },
    ],
    compatibleStones: [
      { id: "rs-008-1", shape: SHAPE.round, maxCarat: 1.5 },
      { id: "rs-008-2", shape: SHAPE.princess, maxCarat: 1.5 },
    ],
  },
  {
    id: "ring-009",
    sku: "ER-700009",
    description:
      "Twist setting — two intertwined ribbons cradling the centre stone. 2.0mm widest point.",
    images: imgs("ring-009"),
    bandStyle: BAND.twist,
    ringWidthMm: 2.0,
    availableMetals: [
      { id: "rm-009-1", metal: METAL.rg14, priceUsd: 1950 },
      { id: "rm-009-2", metal: METAL.rg18, priceUsd: 2850 },
      { id: "rm-009-3", metal: METAL.wg18, priceUsd: 2850 },
    ],
    compatibleStones: [
      { id: "rs-009-1", shape: SHAPE.round, maxCarat: 2.0 },
      { id: "rs-009-2", shape: SHAPE.oval, maxCarat: 2.5 },
      { id: "rs-009-3", shape: SHAPE.pear, maxCarat: 2.0 },
      { id: "rs-009-4", shape: SHAPE.heart, maxCarat: 2.0 },
    ],
  },
  {
    id: "ring-010",
    sku: "ER-700010",
    description:
      "Split-shank setting with pavé diamonds along both shanks meeting at the centre.",
    images: imgs("ring-010"),
    bandStyle: BAND.splitShank,
    ringWidthMm: 2.6,
    availableMetals: [
      { id: "rm-010-1", metal: METAL.wg14, priceUsd: 2450 },
      { id: "rm-010-2", metal: METAL.wg18, priceUsd: 3450 },
      { id: "rm-010-3", metal: METAL.plat, priceUsd: 4750 },
    ],
    compatibleStones: [
      { id: "rs-010-1", shape: SHAPE.round, maxCarat: 2.5 },
      { id: "rs-010-2", shape: SHAPE.cushion, maxCarat: 2.5 },
      { id: "rs-010-3", shape: SHAPE.radiant, maxCarat: 2.5 },
    ],
  },
];
