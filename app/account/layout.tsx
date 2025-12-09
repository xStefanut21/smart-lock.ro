import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contul meu",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
