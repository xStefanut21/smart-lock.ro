export default function CumPlatescPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Cum plătesc
      </p>
      <h1 className="text-3xl font-semibold text-white">Opțiuni de plată</h1>
      <p className="mt-2 mb-6 text-neutral-300">
        La smart-lock.ro dorim ca procesul de plată să fie cât mai sigur și mai
        simplu. Mai jos găsești principalele modalități de plată pe care le
        vom pune la dispoziție pentru comenzile tale.
      </p>

      <section className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Plata online cu cardul (Recomandat)
          </h2>
          <p className="text-neutral-300">
            <span className="font-semibold">Descriere:</span> O metodă rapidă și
            sigură. Vei putea achita direct pe site, în momentul finalizării
            comenzii, utilizând cardul tău bancar (Visa/Mastercard).
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Avantaj:</span> Confirmarea plății
            este aproape instantanee, ceea ce accelerează procesul de pregătire
            și livrare a comenzii.
          </p>
          <p className="text-xs text-neutral-500">
            * Integrarea completă cu procesatorul de plăți este în curs de
            implementare. Până atunci, plata online poate fi disponibilă doar
            pentru anumite comenzi pilot.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            2. Plata la livrare (Ramburs)
          </h2>
          <p className="text-neutral-300">
            <span className="font-semibold">Aplicabilitate:</span> Pentru
            livrările efectuate prin curier rapid. În momentul predării
            coletului, vei achita contravaloarea comenzii în numerar sau, unde
            este disponibil, cu cardul la curier.
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Limită legală:</span> Plata ramburs
            este acceptată până la suma maximă permisă de legislația în vigoare.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            3. Ordin de plată / Transfer bancar
          </h2>
          <p className="text-neutral-300">
            <span className="font-semibold">Aplicabilitate:</span> Potrivită
            pentru persoane juridice sau pentru comenzi speciale.
          </p>
          <p className="text-neutral-300">
            <span className="font-semibold">Procedură:</span>
          </p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              După plasarea comenzii, vei primi pe email datele noastre
              bancare și proforma cu detaliile produselor comandate.
            </li>
            <li>
              Plata se va efectua prin transfer bancar, iar expedierea
              produselor se va face după confirmarea încasării.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
