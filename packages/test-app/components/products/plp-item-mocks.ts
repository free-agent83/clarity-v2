const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SHIPS_FROM = ["India", "Belgium", "USA", "Israel", "Hong Kong"];

// Skip I and O for readability.
const STOCK_ID_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getMockStockId(id: string): string {
  const h = hashSeed(id);
  const prefix = STOCK_ID_LETTERS[h % STOCK_ID_LETTERS.length];
  const hex = h.toString(16).toUpperCase().padStart(8, "0").slice(-8);
  return `${prefix}${hex}`;
}

export type PlpItemMock = {
  isExpress: boolean;
  isReturnable: boolean;
  deliveryDate: string;
  shipsFrom: string;
};

export function getPlpItemMock(id: string): PlpItemMock {
  const h = hashSeed(id);
  const monthIdx = h % 12;
  const dayStart = (h % 25) + 1;
  const dayEnd = dayStart + 5;
  return {
    isExpress: h % 3 === 0,
    isReturnable: h % 4 !== 0,
    deliveryDate: `${MONTHS[monthIdx]} ${dayStart} – ${dayEnd}`,
    shipsFrom: SHIPS_FROM[h % SHIPS_FROM.length],
  };
}
