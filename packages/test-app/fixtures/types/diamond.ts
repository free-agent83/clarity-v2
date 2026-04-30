// Full PDP shape — fixtures store this. lib/api/* projects to DiamondListItem
// for PLPs.

export interface DiamondItem {
  id: string;
  stockId: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  certification: { lab: string; number: string; pdfUrl: string | null };
  dimensions: { length: number; width: number; depth: number };
  tablePct: number;
  depthPct: number;
  price: number;
  pricePerCarat: number;
  description: string;
  images: { main: string; additional: string[] };
}

export interface DiamondListItem {
  id: string;
  stockId: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  pricePerCarat: number;
  image: string;
  description: string;
  certLab: string;
  certNumber: string;
}

export const toDiamondListItem = (d: DiamondItem): DiamondListItem => ({
  id: d.id,
  stockId: d.stockId,
  shape: d.shape,
  carat: d.carat,
  color: d.color,
  clarity: d.clarity,
  cut: d.cut,
  price: d.price,
  pricePerCarat: d.pricePerCarat,
  image: d.images.main,
  description: d.description,
  certLab: d.certification.lab,
  certNumber: d.certification.number,
});
