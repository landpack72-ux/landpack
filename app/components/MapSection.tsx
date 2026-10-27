import { getSettings } from "@/lib/data";

export default async function MapSection() {
  const s = await getSettings();
  return (
    <section id="carte" className="px-4 sm:px-6 pb-16 sm:pb-20 lg:px-10 lg:pb-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border-2 border-ink/10 sm:rounded-[1.75rem]">
        <div className="relative h-64 w-full sm:h-80 md:h-96 lg:h-[420px]">
          <iframe
            title={`Localisation atelier Landpack — ${s.address}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0, filter: "saturate(1.05) brightness(1.02)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
