import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de returnare și înlocuire",
};

export default function PoliticaDeReturPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Politica de retur
      </p>
      <h1 className="text-3xl font-semibold text-white">
        POLITICA DE RETURNARARE ȘI ÎNLOCUIRE
      </h1>
      <p className="mt-2 mb-6 text-neutral-300">
        Înțelegem că uneori un produs nu se potrivește nevoilor dumneavoastră. De aceea, la e-securemme.ro, procesul de retur este transparent și respectă pe deplin legislația în vigoare.
      </p>

      <section className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Dreptul de Retragere (Retur Fără Motiv)
          </h2>
          <p className="text-neutral-300">
            Conform O.U.G. 34/2014, aveți dreptul de a vă retrage din contractul de vânzare-cumpărare la distanță, fără a invoca vreun motiv, în termen de <span className="font-semibold">14 zile calendaristice</span> de la data la care dumneavoastră sau o terță parte, alta decât transportatorul, intrați în posesia fizică a produselor.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Condiții Obligatorii de Retur</h3>
          <p className="text-neutral-300">
            Pentru a fi acceptat, produsul returnat trebuie să îndeplinească următoarele condiții:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              <span className="font-semibold">Ambalaj și Stare:</span> Produsul trebuie să fie în starea inițială, în ambalajul original, fără urme de montaj, utilizare sau deteriorare (zgârieturi, lovituri, etc.).
            </li>
            <li>
              <span className="font-semibold">Accesorii Complete:</span> Trebuie returnat împreună cu toate accesoriile, manualele și documentele însoțitoare.
            </li>
            <li>
              <span className="font-semibold">Regula Specială (Cilindri de Securitate):</span> Returnarea cilindrilor de securitate se acceptă numai cu condiția ca sigiliul cheilor finale să fie intact. Odată ce cheile finale sunt desigilate și folosite, cilindrul este setat pe codul respectiv și nu mai poate fi vândut ca nou.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">2. Procedura de Returnare</h2>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-300">
            <li>
              <span className="font-semibold">Notificare:</span> Trimiteți o notificare scrisă de retur, prin e-mail la <span className="font-semibold">office@e-securemme.ro</span>, în termen de 14 zile de la primirea comenzii.
            </li>
            <li>
              <span className="font-semibold">Expediere:</span> Ambalați produsul corespunzător și expediați-l la adresa de corespondență a companiei: <span className="font-semibold">București, Str. Dealul Mare, Nr. 14, Sector 4.</span>
            </li>
            <li>
              <span className="font-semibold">Costul Returului:</span> Conform legislației în vigoare, costul direct al transportului de retur este suportat de către client.
            </li>
          </ol>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">3. Rambursarea Sumei</h2>
          <p className="text-neutral-300">
            După primirea produsului returnat și verificarea condițiilor de retur:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              <span className="font-semibold">Rambursare:</span> Vă vom returna valoarea integrală achitată pentru produs, inclusiv costul inițial de livrare (dacă a fost achitat).
            </li>
            <li>
              <span className="font-semibold">Termen:</span> Rambursarea se face în termen de maximum 14 zile calendaristice de la data la care am fost informat cu privire la decizia dumneavoastră de retragere.
            </li>
            <li>
              <span className="font-semibold">Metodă:</span> Suma va fi returnată prin transfer bancar în contul IBAN specificat de dumneavoastră în cererea de retur.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
