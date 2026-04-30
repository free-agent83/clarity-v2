export interface ShortlistItem {
  id: string;
  stockId: string;
  title: string;
  specs: string;
  category: string;
  image: string | null;
  href: string;
  price: number;
  addedAt: string;
}

export interface Shortlist {
  id: string;
  name: string;
  createdAt: string;
  items: ShortlistItem[];
}
