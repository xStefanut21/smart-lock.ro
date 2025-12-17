import Link from "next/link";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-neutral-100">
      <h1 className="mb-4 text-2xl font-semibold text-white">Comanda ta a fost plasată cu succes</h1>

      <p className="mb-2 text-neutral-300">
        Îți mulțumim pentru comandă! Am înregistrat comanda ta și în scurt timp vei primi un email
        de confirmare cu toate detaliile.
      </p>

      <p className="mb-4 text-neutral-300">
        <span className="font-medium text-neutral-100">ID comandă:</span>{" "}
        <span className="font-mono text-neutral-50">#{id}</span>
      </p>

      <div className="mb-6 space-y-2 text-neutral-300">
        <p>
          Te rugăm să verifici inbox-ul adresei tale de email pentru mesajul de confirmare. Dacă nu îl
          găsești în câteva minute, verifică și folderul <span className="font-medium">Spam</span> sau
          <span className="font-medium">Promotions</span>.
        </p>
        <p>
          Dacă întâmpini orice problemă sau nu primești emailul de confirmare, ne poți contacta la
          <span className="font-medium"> 0741119449</span> sau pe email la
          <span className="font-medium"> stefan.prodan@monvelli.ro</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/account/orders/${id}`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Vezi detaliile comenzii
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 hover:border-neutral-500"
        >
          Înapoi la produse
        </Link>
      </div>
    </div>
  );
}
