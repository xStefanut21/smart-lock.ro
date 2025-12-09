import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții de vânzare",
};

export default function TermeniSiConditiiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Termeni și condiții
      </p>
      <h1 className="text-3xl font-semibold text-white">
        TERMENI ȘI CONDIȚII DE VÂNZARE (T&amp;C)
      </h1>

      <section className="mt-6 space-y-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6 text-xs leading-relaxed text-neutral-300">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Definiții și Acceptarea Termenilor
          </h2>
          <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950/80 p-3">
            <table className="min-w-full border-collapse text-[11px] text-neutral-200">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-2 py-1 text-left font-semibold">Termen</th>
                  <th className="px-2 py-1 text-left font-semibold">Definiție</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Vânzător (Operator)</td>
                  <td className="px-2 py-1">S.C. MONVELLI EXCLUSIVE S.R.L., proprietarul site-ului e-securemme.ro.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Cumpărător (Client)</td>
                  <td className="px-2 py-1">Orice persoană fizică sau juridică care plasează o Comandă prin intermediul Site-ului.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Site</td>
                  <td className="px-2 py-1">Domeniul e-securemme.ro și subdomeniile acestuia.</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-2 py-1 font-semibold text-neutral-300">Comandă</td>
                  <td className="px-2 py-1">Un document electronic prin care Cumpărătorul solicită achiziționarea de Bunuri și Servicii afișate pe Site.</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-semibold text-neutral-300">Bunuri și Servicii</td>
                  <td className="px-2 py-1">Produsele (Cilindri, Yale, etc.) și Serviciile (Montaj, Deblocare) menționate în Comandă.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Prin accesarea și utilizarea Site-ului, Cumpărătorul acceptă integral Termenii și Condițiile de mai jos, precum și prevederile din
            <span className="font-semibold"> Politica de Confidențialitate</span> și <span className="font-semibold">Politica de Retur</span>.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">2. Modificarea Termenilor</h2>
          <p>
            Administratorii Site-ului își rezervă dreptul de a modifica Termenii și Condițiile în orice moment, fără notificare prealabilă.
            Termenii aplicați unei Comenzi sunt întotdeauna cei valabili la momentul plasării acelei Comenzi.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            3. Contractul la Distanță (Plasarea și Confirmarea Comenzii)
          </h2>
          <h3 className="text-sm font-semibold text-white">3.1. Plasarea Comenzii</h3>
          <p>
            Cumpărătorul poate plasa Comenzi pe Site prin adăugarea Bunurilor și Serviciilor dorite în coșul de cumpărături, urmând pașii de finalizare a
            comenzii.
          </p>
          <h3 className="text-sm font-semibold text-white">3.2. Încheierea Contractului</h3>
          <p>
            Contractul de vânzare-cumpărare la distanță se consideră încheiat în momentul în care Vânzătorul
            <span className="font-semibold"> confirmă</span> Cumpărătorului, prin e-mail, acceptarea Comenzii sale și disponibilitatea produselor.
            Simpla înregistrare a Comenzii (e-mailul automat primit de client) <span className="font-semibold">nu</span> reprezintă o confirmare a Contractului.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">4. Prețuri și Modalități de Plată</h2>
          <h3 className="text-sm font-semibold text-white">4.1. Prețuri</h3>
          <p>
            Toate prețurile afișate pe Site sunt exprimate în <span className="font-semibold">RON</span> și includ
            <span className="font-semibold"> TVA</span>, conform legislației în vigoare. Vânzătorul își rezervă dreptul de a modifica prețurile fără o notificare prealabilă.
          </p>
          <h3 className="text-sm font-semibold text-white">4.2. Modalități de Plată</h3>
          <p>
            Plata Bunurilor și Serviciilor se poate efectua prin metodele detaliate în secțiunea
            <span className="font-semibold"> "Cum Plătesc"</span> a Site-ului:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Plata ramburs (la livrare)</li>
            <li>Ordin de Plată / Transfer Bancar</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">5. Livrarea Bunurilor</h2>
          <h3 className="text-sm font-semibold text-white">5.1. Termene și Costuri</h3>
          <p>
            Detalii privind termenele de livrare, costurile de transport și pragul pentru transport gratuit sunt stipulate explicit în secțiunea
            <span className="font-semibold"> "Detalii Livrare"</span> a Site-ului.
          </p>
          <h3 className="text-sm font-semibold text-white">5.2. Verificarea la Primire</h3>
          <p>
            Cumpărătorul este obligat să verifice starea coletului și a produselor la momentul primirii acestora de la curier. Orice reclamație privind
            anomaliile (colet deteriorat, produs lipsă) trebuie făcută conform procedurii descrise în
            <span className="font-semibold"> "Detalii Livrare"</span> și semnalată curierului.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">6. Garanții și Returnarea Bunurilor</h2>
          <h3 className="text-sm font-semibold text-white">6.1. Garanții</h3>
          <p>
            Toate produsele comercializate de e-securemme.ro beneficiază de garanția legală de conformitate, conform prevederilor legale aplicabile.
          </p>
          <h3 className="text-sm font-semibold text-white">6.2. Dreptul de Retragere</h3>
          <p>
            Cumpărătorul persoană fizică are dreptul de a se retrage din contract (retur) în termen de
            <span className="font-semibold"> 14 zile calendaristice</span> de la primirea produselor, fără a invoca vreun motiv, conform OUG 34/2014.
            Procedura și condițiile de retur, inclusiv regula specială privind cilindrii de securitate, sunt detaliate în
            <span className="font-semibold"> "Politica de Returnare și Înlocuire"</span>.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            7. Drepturile de Proprietate Intelectuală și Răspunderea Utilizatorilor
          </h2>
          <h3 className="text-sm font-semibold text-white">7.1. Conținutul Site-ului</h3>
          <p>
            Întregul conținut al Site-ului (texte, imagini, logo-uri, simboluri, elemente grafice, descrieri) este proprietatea
            <span className="font-semibold"> S.C. MONVELLI EXCLUSIVE S.R.L.</span> și este protejat de Legea dreptului de autor și de legile privind proprietatea intelectuală.
            Utilizarea acestora fără acordul prealabil scris este strict interzisă.
          </p>
          <h3 className="text-sm font-semibold text-white">7.2. Răspunderea Utilizatorilor</h3>
          <p>
            Utilizatorii sunt unicii responsabili pentru conținutul postat (recenzii, comentarii, întrebări) și se obligă să nu posteze conținut ilegal,
            defăimător sau care încalcă drepturile de proprietate intelectuală ale terților. Prin postare, Utilizatorii acordă Vânzătorului dreptul de a
            publica și utiliza conținutul în scop de promovare sau îmbunătățire a serviciilor. Vânzătorul își rezervă dreptul de a înlătura orice
            conținut sau comentariu neadecvat, fără notificare prealabilă.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-white">8. Forța Majoră și Litigii</h2>
          <h3 className="text-sm font-semibold text-white">8.1. Forța Majoră</h3>
          <p>
            Niciuna dintre părți nu va fi răspunzătoare pentru neexecutarea obligațiilor contractuale dacă o astfel de neexecutare este cauzată de un
            eveniment de forță majoră.
          </p>
          <h3 className="text-sm font-semibold text-white">8.2. Litigii</h3>
          <p>
            Orice litigiu apărut în legătură cu acest contract va fi soluționat pe cale amiabilă. În cazul în care părțile nu ajung la un acord, competența
            revine instanțelor judecătorești din România. De asemenea, Cumpărătorul poate apela la soluționarea online a litigiilor (platforma SOL).
          </p>
        </div>
      </section>
    </div>
  );
}
