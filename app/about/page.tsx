export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Despre smart-lock.ro: lacătuși profesioniști & soluții smart de înaltă siguranță
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Despre smart-lock.ro: specialiști în yale smart și sisteme de închidere sigure
        </p>
      </header>

      <section className="mb-5 space-y-2 text-sm">
        <p className="text-neutral-300">
          Bine ai venit pe <span className="font-semibold text-white">smart-lock.ro</span>,
          platformă dedicată soluțiilor moderne de acces pentru locuințe și spații
          comerciale din România. Ne concentrăm pe yale smart, cilindri de siguranță
          și servicii de lacătărie profesionale, astfel încât tu să te bucuri de
          confort și protecție reală în fiecare zi.
        </p>
      </section>

      <section className="mb-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">Cine suntem și ce facem</h2>
        <p className="text-neutral-300">
          Ne-am specializat în asigurarea accesului sigur la locuința ta. Suntem mai
          mult decât un magazin online: suntem partenerul tău de încredere pentru
          consultanță, alegerea produselor potrivite și montaj profesionist.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-neutral-300">
          <li>
            <span className="font-semibold text-white">
              Specializare pe soluții smart și securitate mecanică premium:
            </span>{" "}
            ne concentrăm pe yale smart, cilindri de înaltă siguranță și accesorii
            de calitate, selectate atent pentru piața din România.
          </li>
          <li>
            <span className="font-semibold text-white">Expertiză tehnică avansată:</span>{" "}
            colaborăm cu lacătuși profesioniști și tehnicieni specializați în
            sisteme de închidere complexe, capabili să gestioneze atât soluții
            mecanice, cât și electronice (inclusiv integrarea yale smart în
            ecosisteme smart home).
          </li>
          <li>
            <span className="font-semibold text-white">Servicii rapide, în funcție de programare:</span>{" "}
            intervenim pentru deblocări uși, înlocuiri de cilindri, montaj și
            configurare yale smart, cu atenție la detalii și respect pentru ușa și
            locuința ta.
          </li>
        </ol>
      </section>

      <section className="mb-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">Misiunea noastră: profesionalism și încredere</h2>
        <p className="text-neutral-300">
          Misiunea smart-lock.ro este să îți ofere soluții de acces sigure, ușor de
          folosit și adaptate vieții de zi cu zi. Ne dorim să îmbinăm un raport
          corect calitate-preț cu servicii serioase, astfel încât experiența ta cu
          produsele și montajul să fie una fără griji.
        </p>
        <p className="text-neutral-300">
          Credem în <span className="font-semibold text-white">calitate</span>,
          <span className="font-semibold text-white"> eficiență</span> și
          <span className="font-semibold text-white"> integritate</span>: îți
          explicăm transparent opțiunile disponibile, avantajele fiecărei soluții și
          nu recomandăm niciodată produse doar pentru a le vinde, ci pentru că se
          potrivesc nevoilor tale reale.
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">De ce smart-lock.ro</h2>
        <ul className="list-disc space-y-1 pl-5 text-neutral-300">
          <li>
            <span className="font-semibold text-white">Selecție curată de produse:</span>{" "}
            nu listăm sute de modele similare, ci variante testate, cu raport bun
            între preț și siguranță.
          </li>
          <li>
            <span className="font-semibold text-white">Consultanță umană, nu doar online:</span>{" "}
            dacă nu ești sigur ce să alegi, ne poți contacta pentru recomandări
            adaptate ușii și situației tale.
          </li>
          <li>
            <span className="font-semibold text-white">Servicii complete:</span>{" "}
            de la ofertă și livrare, până la montaj și configurare yale smart.
          </li>
        </ul>
        <p className="mt-2 text-xs text-neutral-400">
          Pentru întrebări sau proiecte speciale (blocuri de locuințe, spații
          comerciale, închiriere în regim hotelier), scrie-ne din pagina
          <a href="/contact" className="ml-1 text-blue-400">Contact</a> și revenim
          cu o propunere personalizată.
        </p>
      </section>
    </div>
  );
}
