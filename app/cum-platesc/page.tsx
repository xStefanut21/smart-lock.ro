import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cum plătești comanda",
};

export default function CumPlatescPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Cum plătesc
      </p>
      <h1 className="text-3xl font-semibold text-white">Opțiuni de plată</h1>
      <p className="mt-2 mb-6 text-neutral-300">
        La smart-lock.ro păstrăm procesul de plată cât mai simplu și clar.
        În acest moment, toate comenzile se achită **exclusiv ramburs la livrare**.
      </p>

      <section className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            Plata la livrare (Ramburs)
          </h2>
          <p className="text-neutral-300">
            <span className="font-semibold">Cum funcționează:</span> Comanda ta este
            pregătită și expediată prin curier, iar plata se face direct la livrare,
            în numerar, către curier.
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Avantaje:</span> Nu este nevoie să introduci
            date de card pe site, iar plata se face doar după ce coletul ajunge la tine.
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Limită legală:</span> Plata ramburs este
            acceptată până la suma maximă permisă de legislația în vigoare.
          </p>
        </div>
      </section>
    </div>
  );
}
