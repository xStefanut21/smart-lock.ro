"use client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică de confidențialitate și cookies",
};

export default function ConfidentialitatePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Confidențialitate
      </p>
      <h1 className="mb-4 text-3xl font-semibold text-white">
        Politica de Confidențialitate și Cookies (GDPR)
      </h1>
      <p className="mb-6 text-xs text-neutral-400">
        Data ultimei actualizări: decembrie 2025
      </p>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">
          1. Informații despre Operatorul de date
        </h2>
        <p>
          Site-ul <span className="font-semibold">smart-lock.ro</span> este deținut și administrat
          de <span className="font-semibold">Smart Lock SRL</span>, având rolul de Operator al datelor cu
          caracter personal. Prelucrăm datele dumneavoastră doar în scopuri legitime și
          în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională
          aplicabilă.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Denumire legală:</span> Smart Lock SRL
          </li>
          <li>
            <span className="font-semibold">Sediu social:</span> (de completat)
          </li>
          <li>
            <span className="font-semibold">CUI / Nr. Registrul Comerțului:</span> (de completat)
          </li>
          <li>
            <span className="font-semibold">Email contact date personale:</span>{" "}
            <a href="mailto:contact@smart-lock.ro" className="text-blue-400 hover:text-blue-300">
              contact@smart-lock.ro
            </a>
          </li>
          <li>
            <span className="font-semibold">Telefon:</span> 0741 119 449
          </li>
        </ul>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">
          2. Ce date colectăm și în ce scop
        </h2>
        <p>
          Colectăm datele doar atunci când este necesar pentru a vă putea oferi
          produsele și serviciile noastre sau pentru a respecta obligațiile legale.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Crearea și administrarea contului de client:</span> nume,
            adresă de email, parolă (stocată în formă criptată), număr de telefon (dacă
            este furnizat), adrese de facturare și livrare. Temei: executarea
            contractului.
          </li>
          <li>
            <span className="font-semibold">Plasarea și onorarea comenzilor:</span> date de livrare,
            date de contact, conținutul comenzii. Temei: executarea contractului.
          </li>
          <li>
            <span className="font-semibold">Obligații fiscale și contabile:</span> date necesare pe
            facturi și documente contabile. Temei: obligație legală.
          </li>
          <li>
            <span className="font-semibold">Suport clienți și comunicare:</span> nume, email și
            conținutul mesajelor trimise prin formularul de contact sau alte canale.
            Temei: interes legitim de a oferi suport eficient.
          </li>
          <li>
            <span className="font-semibold">Preferințe de navigare și utilizare a site-ului:</span>{" "}
            informații tehnice colectate prin cookies și tehnologii similare, pentru
            funcționare, securitate și analiză.
          </li>
        </ul>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">
          3. Perioada de stocare a datelor
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Date de cont și comenzi:</span> pe durata existenței
            contului și ulterior, pe perioada necesară apărării drepturilor noastre.
          </li>
          <li>
            <span className="font-semibold">Date fiscale și contabile:</span> minimum 10 ani, conform
            legislației fiscale din România.
          </li>
          <li>
            <span className="font-semibold">Date din corespondență (suport clienți):</span> în general
            până la 2 ani de la ultima interacțiune, dacă nu este necesară o perioadă
            mai lungă.
          </li>
          <li>
            <span className="font-semibold">Date tehnice din cookies:</span> conform duratei de viață a
            fiecărui cookie, descrise în secțiunea de mai jos.
          </li>
        </ul>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">
          4. Cui transmitem datele
        </h2>
        <p>
          Nu vindem și nu închiriem datele dumneavoastră către terți pentru scopuri de
          marketing. Datele pot fi transmise către parteneri care ne ajută să prestăm
          serviciile (persoane împuternicite) sau către autorități atunci când legea o
          cere.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Furnizori de servicii IT și hosting (inclusiv platforme de tip cloud).</li>
          <li>Firme de contabilitate / consultanță pentru obligații legale.</li>
          <li>Furnizori de servicii de curierat pentru livrarea comenzilor.</li>
          <li>
            Autorități publice (ANAF, poliție, instanțe, ANSPDCP) atunci când suntem
            obligați legal sau pentru apărarea drepturilor noastre.
          </li>
        </ul>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">
          5. Drepturile dumneavoastră
        </h2>
        <p>
          Aveți dreptul de acces, rectificare, ștergere ("dreptul de a fi uitat"),
          restricționare a prelucrării, portabilitate, opoziție și dreptul de a depune
          plângere la ANSPDCP. Pentru exercitarea acestor drepturi, ne puteți contacta
          la adresa <span className="font-semibold">contact@smart-lock.ro</span>.
        </p>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">6. Securitatea datelor</h2>
        <p>
          Luăm măsuri tehnice și organizatorice adecvate pentru a proteja datele
          personale împotriva pierderii, accesului neautorizat sau modificării
          neautorizate (conexiuni HTTPS, parole stocate în formă hashuită, controlul
          accesului în zona de administrare etc.).
        </p>
      </section>

      <section className="mb-6 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">7. Politica de Cookies</h2>
        <p>
          Cookie-urile sunt fișiere text mici, stocate pe dispozitivul dumneavoastră
          atunci când vizitați un site. Pe smart-lock.ro folosim cookie-uri pentru a
          asigura funcționarea de bază a site-ului (ex: menținerea sesiunii de
          autentificare, păstrarea produselor în coș) și, opțional, pentru analiză și
          îmbunătățirea experienței.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Cookie-uri strict necesare:</span> esențiale pentru
            funcționarea site-ului. Acestea nu pot fi dezactivate din sistemele
            noastre.
          </li>
          <li>
            <span className="font-semibold">Cookie-uri de analiză / performanță:</span> pot fi folosite
            pentru a înțelege cum este folosit site-ul și pentru a-l îmbunătăți (vor fi
            utilizate doar cu consimțământul dumneavoastră, dacă le activăm).
          </li>
        </ul>
        <p>
          Puteți gestiona cookie-urile din setările browser-ului. Dezactivarea
          cookie-urilor strict necesare poate afecta funcționarea corectă a site-ului.
        </p>
      </section>

      <section className="mb-2 space-y-2 text-xs leading-relaxed text-neutral-300">
        <h2 className="text-base font-semibold text-white">8. Modificări ale politicii</h2>
        <p>
          Ne rezervăm dreptul de a actualiza periodic această politică. Versiunea
          actualizată va fi publicată pe această pagină, cu data ultimei actualizări
          afișată la începutul documentului.
        </p>
      </section>
    </div>
  );
}
