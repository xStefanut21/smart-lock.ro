import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comenzi și coș de cumpărături",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
