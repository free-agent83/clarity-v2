export interface MeleeItem {
  id: string;
  stockId: string;
  shape: string;
  sizeRange: string;
  colorRange: string;
  clarityRange: string;
  cut: string;
  quantity: number;
  totalCaratWeight: number;
  pricePerCarat: number;
  totalPrice: number;
  description: string;
  images: { main: string; additional: string[] };
}

export interface MeleeListItem {
  id: string;
  stockId: string;
  shape: string;
  sizeRange: string;
  colorRange: string;
  clarityRange: string;
  cut: string;
  quantity: number;
  totalCaratWeight: number;
  pricePerCarat: number;
  totalPrice: number;
  image: string;
  description: string;
}

export const toMeleeListItem = (m: MeleeItem): MeleeListItem => ({
  id: m.id,
  stockId: m.stockId,
  shape: m.shape,
  sizeRange: m.sizeRange,
  colorRange: m.colorRange,
  clarityRange: m.clarityRange,
  cut: m.cut,
  quantity: m.quantity,
  totalCaratWeight: m.totalCaratWeight,
  pricePerCarat: m.pricePerCarat,
  totalPrice: m.totalPrice,
  image: m.images.main,
  description: m.description,
});
