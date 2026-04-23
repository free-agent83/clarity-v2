import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minivoda",
  description: "Minivoda buyer platform",
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
