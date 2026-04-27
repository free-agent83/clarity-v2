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

const REGULAR_BUSINESS_DAYS = ["2 – 3", "3 – 5", "4 – 6"];

export type PlpItemMock = {
  isExpress: boolean;
  isReturnable: boolean;
  businessDays: string;
  deliveryDate: string;
  shipsFrom: string;
};

export function getPlpItemMock(id: string): PlpItemMock {
  const h = hashSeed(id);
  const monthIdx = h % 12;
  const dayStart = (h % 25) + 1;
  const dayEnd = dayStart + 5;
  const isExpress = h % 3 === 0;
  return {
    isExpress,
    isReturnable: h % 4 !== 0,
    businessDays: isExpress
      ? "1 – 2"
      : REGULAR_BUSINESS_DAYS[h % REGULAR_BUSINESS_DAYS.length],
    deliveryDate: `${MONTHS[monthIdx]} ${dayStart} – ${dayEnd}`,
    shipsFrom: SHIPS_FROM[h % SHIPS_FROM.length],
  };
}
