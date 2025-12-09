"use client";

export default function ConfidentialitatePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Confidențialitate
      </p>
      <h1 className="text-3xl font-semibold text-white">
        POLITICA DE CONFIDENȚIALITATE ȘI COOKIES (GDPR)
      </h1>
      <p className="mt-2 mb-6 text-xs text-neutral-400">
        Data ultimei actualizări: Noiembrie 2025
      </p>

      <section className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6 text-xs leading-relaxed text-neutral-300">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Informații Generale Despre Operatorul de Date
          </h2>
          <p>
            e-securemme.ro este deținut și administrat de <span className="font-semibold">S.C. MONVELLI EXCLUSIVE S.R.L.</span>,
            având rolul de Operator al datelor cu caracter personal. Vă asigurăm că prelucrăm
            datele dumneavoastră exclusiv în scopuri legitime și în conformitate cu
            <span className="font-semibold"> Regulamentul General privind Protecția Datelor (UE) 2016/679 (GDPR)</span>.
          </p>

          <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/80 p-3">
            <table className="min-w-full border-collapse text-[11px] text-neutral-200">
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="w-1/3 px-2 py-1 font-semibold text-neutral-300">Denumire Legală</td>
                  <td className="px-2 py-1">S.C. MONVELLI EXCLUSIVE S.R.L.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Sediul Social</td>
                  <td className="px-2 py-1">Orașul București Str. Dealul Mare, Nr. 14, Sector 4</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Adresă de Corespondență</td>
                  <td className="px-2 py-1">Orașul București Str. Dealul Mare, Nr. 14, Sector 4</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-semibold text-neutral-300">E-mail Contact</td>
                  <td className="px-2 py-1">
                    <a href="mailto:office@e-securemme.ro" className="text-blue-400 hover:text-blue-300">
                      office@e-securemme.ro
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            2. Colectarea și Prelucrarea Datelor Personale
          </h2>
          <p>
            Colectăm datele dumneavoastră numai atunci când este absolut necesar și pentru a
            ne îndeplini obligațiile contractuale sau legale.
          </p>

          <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/80 p-3">
            <table className="min-w-full border-collapse text-[11px] text-neutral-200">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-2 py-1 text-left font-semibold">Scopul Prelucrării</th>
                  <th className="px-2 py-1 text-left font-semibold">Categoriile de Date Colectate</th>
                  <th className="px-2 py-1 text-left font-semibold">Temeiul Legal (GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">A. Onorarea Comenzilor și Serviciilor</td>
                  <td className="px-2 py-1">Nume, Prenume, Adresă de Livrare/Facturare, Număr de Telefon, E-mail.</td>
                  <td className="px-2 py-1">Executarea Contractului (Art. 6(1) lit. b)</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">B. Obligații Fiscale și Contabile</td>
                  <td className="px-2 py-1">Date de identificare (inclusiv CNP/CUI, dacă sunt necesare pe factură conform legii).</td>
                  <td className="px-2 py-1">Obligație Legală (Art. 6(1) lit. c)</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">C. Marketing Direct (Newsletter)</td>
                  <td className="px-2 py-1">Adresă de E-mail (doar dacă ați bifat opțiunea).</td>
                  <td className="px-2 py-1">Consimțământul (Art. 6(1) lit. a)</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">D. Suport Client și Răspuns la Solicitări</td>
                  <td className="px-2 py-1">Nume, E-mail, Conținutul Mesajului.</td>
                  <td className="px-2 py-1">Interesul Legitim (Art. 6(1) lit. f) – de a oferi suport eficient.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">E. Gestiunea Angajaților</td>
                  <td className="px-2 py-1">Date de identificare, stare de sănătate, date profesionale.</td>
                  <td className="px-2 py-1">Obligație Legală (Legislația muncii și arhivistică)</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-semibold text-neutral-300">F. Securitatea Sediului (Monitorizare Video)</td>
                  <td className="px-2 py-1">Imagini și Voce.</td>
                  <td className="px-2 py-1">Interesul Legitim (Protecția bunurilor și a persoanelor)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            3. Perioada de Stocare a Datelor (Retenție)
          </h2>
          <p>
            Păstrăm datele doar pe perioada necesară îndeplinirii scopurilor de mai sus:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold">Datele Fiscale (Facturi, documente contabile):</span> 10 ani, conform legislației fiscale din România.
            </li>
            <li>
              <span className="font-semibold">Datele de Marketing:</span> Până la retragerea consimțământului.
            </li>
            <li>
              <span className="font-semibold">Datele Angajaților:</span> 75 de ani, conform Codului Muncii.
            </li>
            <li>
              <span className="font-semibold">Înregistrările Video:</span> Max. 30 de zile, cu excepția situațiilor care necesită investigații legale.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">4. Partajarea Datelor cu Terții</h2>
          <p>
            Nu dezvăluim informațiile dumneavoastră către terți pentru scopuri proprii de marketing. Transmitem datele doar către parteneri de încredere,
            în calitate de <span className="font-semibold">Persoane Împuternicite</span>, pentru a ne putea desfășura activitatea:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Furnizori de Servicii de Curierat: Pentru livrarea comenzilor (ex: Fan Courier etc.).</li>
            <li>Procesatori de Plăți/Bancare: Pentru tranzacțiile financiare.</li>
            <li>Furnizori de Servicii IT și Contabile: Pentru întreținerea sistemelor și îndeplinirea obligațiilor legale.</li>
            <li>
              Autoritățile Publice: Poliție, Parchet, ANSPDCP sau Instanțe, doar la cererea lor expresă și în limitele legii.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            5. Drepturile Dumneavoastră în Calitate de Persoană Vizată
          </h2>
          <p>
            Vă puteți exercita oricare dintre următoarele drepturi printr-o cerere scrisă transmisă pe e-mail la
            <a href="mailto:office@e-securemme.ro" className="text-blue-400 hover:text-blue-300"> office@e-securemme.ro</a>:
          </p>

          <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/80 p-3">
            <table className="min-w-full border-collapse text-[11px] text-neutral-200">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-2 py-1 text-left font-semibold">Dreptul</th>
                  <th className="px-2 py-1 text-left font-semibold">Descriere</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul de Acces</td>
                  <td className="px-2 py-1">Să obțineți o confirmare și o copie a datelor pe care le prelucrăm despre dumneavoastră.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul la Rectificare</td>
                  <td className="px-2 py-1">Să cereți corectarea sau completarea datelor inexacte sau incomplete.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul la Ștergerea Datelor (Dreptul de a fi uitat)</td>
                  <td className="px-2 py-1">Să cereți ștergerea datelor, în anumite condiții (ex: când nu mai sunt necesare scopului inițial).</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul la Restricționarea Prelucrării</td>
                  <td className="px-2 py-1">Să cereți limitarea prelucrării datelor dumneavoastră.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul la Portabilitatea Datelor</td>
                  <td className="px-2 py-1">Să primiți datele într-un format structurat, utilizat în mod curent, și să le transmiteți altui operator.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul la Opoziție</td>
                  <td className="px-2 py-1">Să vă opuneți prelucrării bazate pe interesul legitim (inclusiv opoziția la marketingul direct).</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-semibold text-neutral-300">Dreptul de a Depune Plângere</td>
                  <td className="px-2 py-1">Să vă adresați cu o plângere către ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">6. Politica de Cookies</h2>
          <h3 className="text-sm font-semibold text-white">Ce sunt Cookies?</h3>
          <p>
            Modulele cookie sunt fișiere text de mici dimensiuni, stocate pe dispozitivul dumneavoastră (telefon, tabletă, computer) de către site-ul nostru,
            care permit recunoașterea dispozitivului la următoarea vizită. Ele nu pot accesa informațiile de pe hard disk-ul dumneavoastră.
          </p>

          <h3 className="text-sm font-semibold text-white">Cum Utilizăm Cookies?</h3>
          <p>Utilizăm cookie-uri în următoarele scopuri:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold">Strict Necesare:</span> Esențiale pentru funcționalitatea de bază a site-ului (ex: coș de cumpărături, sesiunea de autentificare).
              Acestea nu necesită consimțământul dumneavoastră.
            </li>
            <li>
              <span className="font-semibold">De Analiză și Performanță:</span> Pentru a înțelege cum interacționați cu site-ul nostru (ex: ce pagini vizitați, cât timp petreceți).
              Ne ajută să îmbunătățim experiența utilizatorilor.
            </li>
            <li>
              <span className="font-semibold">De Marketing și Publicitate:</span> Pentru a afișa reclame relevante și a limita frecvența de afișare.
            </li>
          </ul>

          <h3 className="text-sm font-semibold text-white">Gestionarea Cookies</h3>
          <p>
            La prima vizită pe site, vi se solicită consimțământul pentru categoriile de cookie-uri non-esențiale (Analiză, Marketing).
            Puteți retrage sau modifica consimțământul în orice moment.
          </p>
          <p>
            Majoritatea browserelor permit gestionarea cookie-urilor din setările lor, permițându-vă să le blocați sau să le ștergeți.
            Rețineți că blocarea cookie-urilor strict necesare poate afecta funcționalitatea site-ului.
          </p>
        </div>
      </section>
    </div>
  );
}
