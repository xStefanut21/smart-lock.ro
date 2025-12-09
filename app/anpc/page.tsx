import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ANPC - Protecția consumatorilor",
};

export default function AnpcPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / ANPC
      </p>
      <h1 className="text-3xl font-semibold text-white">ANPC - Protecția consumatorilor</h1>
      <p className="mt-2 mb-4 text-neutral-300">
        Pentru informații detaliate privind protecția consumatorilor, reclamații sau sesizări, puteți accesa site-ul oficial al
        Autorității Naționale pentru Protecția Consumatorilor (ANPC).
      </p>
      <a
        href="https://anpc.ro/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500"
      >
        Mergi la site-ul ANPC
      </a>
    </div>
  );
}
