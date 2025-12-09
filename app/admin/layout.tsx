import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panou administrare smart-lock.ro",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
