import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalii livrare pentru comenzile smart-lock.ro",
};

export default function DetaliiLivrarePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Detalii livrare
      </p>
      <h1 className="text-3xl font-semibold text-white">DETALII LIVRARE</h1>
      <p className="mt-2 mb-6 text-neutral-300">
        Ne dorim ca produsele de securitate comandate să ajungă la dumneavoastră în cel mai scurt timp și în condiții optime. Iată tot ce trebuie să știți despre procesul de livrare:
      </p>

      <section className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">1. Reguli Generale și Acoperire</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              <span className="font-semibold">Acoperire:</span> Livrăm produsele noastre pe întreg teritoriul României prin intermediul partenerului nostru de încredere, <span className="font-semibold">FAN Courier</span>.
            </li>
            <li>
              <span className="font-semibold">Adresă:</span> Livrarea se face la Adresa de Livrare specificată de dumneavoastră în momentul plasării comenzii.
            </li>
            <li>
              <span className="font-semibold">Documente:</span> Factura de achiziție va fi transmisă electronic (pe e-mail) și/sau în format fizic, împreună cu produsele comandate.
            </li>
            <li>
              <span className="font-semibold">Livrare la Terți:</span> Prin acceptarea Termenilor și Condițiilor, ne acordați permisiunea de a livra coletul oricărei persoane aflate la Adresa de Livrare, dacă dumneavoastră sau destinatarul desemnat nu sunteți prezent.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">2. Costuri și Transport Gratuit</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              Costul exact al livrării este calculat automat în coșul de cumpărături, în funcție de greutatea și valoarea produselor.
            </li>
            <li>
              <span className="font-semibold">Livrare Gratuită:</span> Beneficiați de transport gratuit pentru toate comenzile cu o valoare ce depășește <span className="font-semibold">500 RON</span>.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">3. Termene de Livrare</h2>
          <p className="text-neutral-300">
            Termenul de livrare începe să curgă din momentul încheierii contractului (transmiterea mesajului de confirmare a Comenzii).
          </p>
          <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/80 p-3 text-xs text-neutral-200">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-2 py-1 text-left font-semibold">Tipul produsului</th>
                  <th className="px-2 py-1 text-left font-semibold">Termen de livrare standard</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-900/60">
                  <td className="px-2 py-1">Produse aflate în stoc</td>
                  <td className="px-2 py-1">1 – 3 zile lucrătoare</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">Produse ce nu sunt în stoc</td>
                  <td className="px-2 py-1">3 – 5 zile lucrătoare suplimentare (față de termenul standard)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-neutral-300">
            <span className="font-semibold">Notă:</span> În cazuri excepționale, termenul de livrare poate fi de maximum 30 de zile de la confirmarea comenzii. Dacă acest termen este depășit din motive nejustificate, aveți dreptul de a anula comanda.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">4. Ce faci în cazul anomaliilor (Colet deteriorat / lipsă)</h2>
          <p className="text-neutral-300">
            Vă rugăm să verificați întotdeauna starea coletului și a produselor la primire. Nerespectarea procedurii de mai jos poate anula posibilitatea unei reclamații.
          </p>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">A. Anomalia constatată în prezența Curierului</h3>
            <ul className="list-disc space-y-1 pl-5 text-neutral-300">
              <li>
                Nu este permisă condiționarea primirii sau plății de deschiderea coletului înainte de a semna (aceasta este o regulă a transportatorului).
              </li>
              <li>
                Dacă observați daune vizibile (colet deteriorat, urme de lichid, colet deschis):
                <ul className="list-disc space-y-1 pl-5">
                  <li>Refuzați livrarea.</li>
                  <li>Formulați rezerve clare și detaliate pe bonul de livrare al FAN Courier.</li>
                  <li>Contactați imediat Serviciul Clienți e-securemme.ro la <span className="font-semibold">0741 119 449</span>.</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">B. Anomalia constatată în lipsa Curierului</h3>
            <ul className="list-disc space-y-1 pl-5 text-neutral-300">
              <li>
                <span className="font-semibold">Semnalați incidentul:</span> Contactați Serviciul Clienți e-securemme.ro (Tel: <span className="font-semibold">0741 119 449</span> sau E-mail: <span className="font-semibold">office@e-securemme.ro</span>).
              </li>
              <li>
                <span className="font-semibold">Termen limită:</span> Notificarea pagubelor sau lipsurilor trebuie făcută în termen de maximum 3 zile lucrătoare de la data livrării.
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">C. Returul produsului deteriorat</h3>
            <ul className="list-disc space-y-1 pl-5 text-neutral-300">
              <li>
                Dacă exercitați dreptul de retragere (returnarea produsului), e-securemme.ro suportă costul returului.
              </li>
              <li>
                Pentru a beneficia de această facilitate, aveți obligația de a folosi formularul de retur pe care îl primiți împreună cu comanda.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
