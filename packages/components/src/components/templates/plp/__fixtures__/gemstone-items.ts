import gemstoneImg from "./images/gemstone.png";

export interface GemstoneItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
  discount: number | undefined;
  originalPrice: number | undefined;
  includeTariffs: boolean;
}

export function generateGemstoneItems(count: number): GemstoneItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gem-${i}`,
    name: `Emerald Green Radiant ${(1 + i * 0.1).toFixed(1)}ct`,
    image: gemstoneImg,
    stockId: `GR-${10000 + i}`,
    origin: "Brazil",
    certLab: "IGI",
    certNumber: `287329${300 + i}`,
    price: 1910 + i * 100,
    pricePerCarat: 1910.7,
    isExpress: i % 4 === 0,
    isReturnable: i % 3 !== 0,
    discount: i % 5 === 0 ? 25 : undefined,
    originalPrice: i % 5 === 0 ? 2548 : undefined,
    includeTariffs: true,
  }));
}
