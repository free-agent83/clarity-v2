export interface GemstoneItem {
  id: string;
  stockId: string;
  type: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  treatment: string;
  origin: string;
  certification: { lab: string; number: string; pdfUrl: string | null };
  dimensions: { length: number; width: number; depth: number };
  price: number;
  pricePerCarat: number;
  description: string;
  images: { main: string; additional: string[] };
}

export interface GemstoneListItem {
  id: string;
  stockId: string;
  type: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  treatment: string;
  origin: string;
  price: number;
  pricePerCarat: number;
  image: string;
  description: string;
  certLab: string;
  certNumber: string;
}

export const toGemstoneListItem = (g: GemstoneItem): GemstoneListItem => ({
  id: g.id,
  stockId: g.stockId,
  type: g.type,
  shape: g.shape,
  carat: g.carat,
  color: g.color,
  clarity: g.clarity,
  cut: g.cut,
  treatment: g.treatment,
  origin: g.origin,
  price: g.price,
  pricePerCarat: g.pricePerCarat,
  image: g.images.main,
  description: g.description,
  certLab: g.certification.lab,
  certNumber: g.certification.number,
});
