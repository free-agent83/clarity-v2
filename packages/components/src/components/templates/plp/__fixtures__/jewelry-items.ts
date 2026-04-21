import ringImg from "./images/ring.jpg";

export interface JewelryItem {
  id: string;
  name: string;
  image: string;
  sku: string;
  price: number;
  shipsFrom: string;
}

export function generateJewelryItems(count: number): JewelryItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ring-${i}`,
    name: "Three-Stone Anniversary Band",
    image: ringImg,
    sku: "SKU 100019ERDPL",
    price: 9999.0,
    shipsFrom: "United States",
  }));
}
