import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre smart-lock.ro",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          DESPRE SMART-LOCK.RO: LĂCĂTUȘI PROFESIONIȘTI ȘI SISTEME DE ÎNALTĂ SECURITATE
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Despre smart-lock.ro: lăcătuși profesioniști și sisteme de înaltă securitate
        </p>
      </header>

      <section className="mb-5 space-y-2 text-sm">
        <p className="text-neutral-300">
          Bine ați venit la <span className="font-semibold text-white">smart-lock.ro</span>, platforma operată de
          <span className="font-semibold text-white"> S.C. MONVELLI EXCLUSIVE S.R.L.</span>, dedicată excelenței în domeniul sistemelor de închidere de înaltă securitate
          și al serviciilor de lăcătușerie mecanică.
        </p>
      </section>

      <section className="mb-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">Cine Suntem și Ce Facem</h2>
        <p className="text-neutral-300">
          Ne-am specializat în asigurarea liniștii dumneavoastră. Suntem mai mult decât un magazin online; suntem partenerul dumneavoastră de încredere pentru
          soluții complete de securitate.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-300">
          <li>
            <span className="font-semibold text-white">Specializare pe Branduri Premium:</span> Punem accentul pe comercializarea și montarea sistemelor de închidere de înaltă calitate, fiind
            experți în produse de top (cilindri, yale, nuclee și accesorii).
          </li>
          <li>
            <span className="font-semibold text-white">Expertiză Tehnică Avansată:</span> Echipa noastră este formată din lăcătuși profesioniști cu o vastă experiență, capabili să gestioneze sisteme mecanice
            complexe (inclusiv Master Key System) și să integreze soluții moderne precum yale smart (smart lock-uri).
          </li>
          <li>
            <span className="font-semibold text-white">Serviciu de Intervenție Rapidă:</span> Oferim servicii de deblocări și reparații uși, intervenind rapid și eficient, cu atenție la siguranța și integritatea
            ușii dumneavoastră.
          </li>
        </ul>
      </section>

      <section className="mb-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">Misiunea Noastră: Profesionalism și Integritate</h2>
        <p className="text-neutral-300">
          Misiunea noastră este de a oferi fiecărui client cel mai bun raport calitate-preț, combinând piese de cea mai înaltă siguranță cu o manoperă
          ireproșabilă.
        </p>
        <p className="text-neutral-300">
          Ne ghidăm după principiile <span className="font-semibold text-white">calității</span>,
          <span className="font-semibold text-white"> eficienței</span> și
          <span className="font-semibold text-white"> integrității</span>, asigurându-ne că fiecare intervenție respectă standardele legale și profesionale.
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-base font-semibold text-white">De ce smart-lock.ro</h2>
        <ul className="list-disc space-y-1 pl-5 text-neutral-300">
          <li>
            <span className="font-semibold text-white">Soluții complete:</span> De la consultanță, ofertare și vânzare, până la montaj, configurare și service post-garanție.
          </li>
          <li>
            <span className="font-semibold text-white">Lăcătuși profesioniști:</span> Intervenții realizate de specialiști cu experiență, cu grijă pentru siguranța și confortul clientului.
          </li>
          <li>
            <span className="font-semibold text-white">Orientare către client:</span> Recomandăm doar soluții care corespund real nevoilor dumneavoastră, nu produse „de dragul vânzării”.
          </li>
        </ul>
        <p className="mt-2 text-xs text-neutral-400">
          Pentru întrebări, proiecte speciale sau colaborări (blocuri de locuințe, spații comerciale, închiriere în regim hotelier), scrieți-ne din pagina
          <a href="/contact" className="ml-1 text-blue-400">Contact</a>, iar echipa smart-lock.ro vă va răspunde cu o propunere personalizată.
        </p>
      </section>
    </div>
  );
}
