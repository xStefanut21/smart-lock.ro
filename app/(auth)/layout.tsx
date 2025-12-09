import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autentificare și înregistrare",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
