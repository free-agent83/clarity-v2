import diamondImg from "./images/diamond.png";

export interface DiamondItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  carat: number;
  color: string;
  clarity: string;
  shape: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  tablePct: number;
  depthPct: number;
  ratio: number;
  measurements: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
}

export function generateDiamondItems(count: number): DiamondItem[] {
  const shapes = ["Round", "Oval", "Cushion", "Princess", "Pear", "Emerald"];
  const colors = ["D", "E", "F", "G", "H", "I"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
  const grades = ["EX", "VG", "G", "F"];
  const fluors = ["N", "F", "M", "S"];
  const origins = ["Botswana", "Russia", "Canada", "Australia", "South Africa"];
  const labs = ["GIA", "IGI", "AGS"];

  return Array.from({ length: count }, (_, i) => {
    const shape = shapes[i % shapes.length];
    const isRound = shape === "Round";
    const carat = Number((0.5 + i * 0.1).toFixed(2));
    const ratio = isRound ? 1.0 : Number((1.1 + ((i * 7) % 45) / 100).toFixed(2));
    const tablePct = 55 + (i % 8);
    const depthPct = Number((60 + ((i * 3) % 45) / 10).toFixed(1));
    const length = 5 + carat * 1.2;
    const width = length / ratio;
    const depth = (length * depthPct) / 100;
    const measurements = `${length.toFixed(2)} × ${width.toFixed(2)} × ${depth.toFixed(2)}`;

    return {
      id: `diamond-${i}`,
      name: `${carat.toFixed(2)}ct ${shape} Diamond`,
      image: diamondImg,
      stockId: `DM-${10000 + i}`,
      carat,
      color: colors[i % colors.length],
      clarity: clarities[i % clarities.length],
      shape,
      cut: grades[i % grades.length],
      polish: grades[(i + 1) % grades.length],
      symmetry: grades[(i + 2) % grades.length],
      fluorescence: fluors[i % fluors.length],
      tablePct,
      depthPct,
      ratio,
      measurements,
      origin: origins[i % origins.length],
      certLab: labs[i % labs.length],
      certNumber: `${287329000 + i}`,
      price: 2500 + i * 350,
      pricePerCarat: 5000 + i * 100,
      isExpress: i % 5 === 0,
      isReturnable: i % 3 !== 0,
    };
  });
}
