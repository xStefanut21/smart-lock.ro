import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică de confidențialitate și cookies",
};

export default function ConfidentialitateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
