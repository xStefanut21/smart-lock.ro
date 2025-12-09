import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cum cumperi de pe smart-lock.ro",
};

export default function CumCumperiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Cum cumpăr
      </p>
      <h1 className="text-3xl font-semibold text-white">
        Cum cumperi de pe smart-lock.ro
      </h1>
      <p className="mt-2 mb-6 text-neutral-300">
        Achiziționarea unei yale smart pentru locuința ta ar trebui să fie simplă și
        clară. Mai jos găsești pașii principali pentru a plasa o comandă pe
        smart-lock.ro.
      </p>

      <section className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Comandă online din site (Recomandat)
          </h2>
          <p className="text-neutral-300">
            <span className="font-semibold">Selectare produs:</span> Alege modelul
            de yală smart dorit din catalogul de produse, verifică descrierea și
            specificațiile tehnice și apasă butonul „Adaugă în coș”.
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Finalizare comandă:</span> Accesează
            coșul de cumpărături, verifică produsele și completează datele de livrare
            și facturare. La final, alegi metoda de plată preferată.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            2. Comandă telefonică
          </h2>
          <p className="text-neutral-300">
            Dacă preferi să discuți cu un consultant, ne poți suna la
            <span className="font-semibold"> 0741 119 449</span>. Îți vom prezenta
            opțiunile disponibile și vom prelua datele necesare pentru livrare.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            3. Comandă prin WhatsApp (Flexibil și vizual)
          </h2>
          <p className="text-neutral-300">
            Dacă dorești să atașezi imagini pentru a identifica rapid un model
            potrivit sau ai o solicitare specifică, poți comanda și prin WhatsApp.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              <span className="font-semibold">Trimiteți mesaj:</span> Scrie-ne pe
              WhatsApp la <span className="font-semibold">0741 119 449</span>.
            </li>
            <li>
              <span className="font-semibold">Includeți:</span> Modelele dorite,
              cantitățile și, opțional, imagini ale ușilor pentru o recomandare
              cât mai precisă.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            4. Comandă prin e-mail
          </h2>
          <p className="text-neutral-300">
            Pentru situații speciale (proiecte, comenzi de volum, integrare în
            soluții existente), ne poți trimite un e-mail la
            <span className="font-semibold"> contact@smart-lock.ro</span> cu:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>Modelele de yale smart care te interesează;</li>
            <li>Numărul de bucăți și adresa de livrare;</li>
            <li>Orice detalii suplimentare despre uși / tipul de montaj.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            Ai nevoie de consultanță sau montaj?</h2>
          <p className="text-neutral-300">
            Dacă nu ești sigur ce model se potrivește ușii tale sau ai nevoie de
            montaj profesionist, ne poți contacta telefonic sau prin formularul de
            contact. Un specialist te va ghida în alegerea corectă și îți va oferi
            informații despre serviciile de montaj disponibile.
          </p>
        </div>
      </section>
    </div>
  );
}
