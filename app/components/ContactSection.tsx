import { getSettings } from "@/lib/data";
import { formatPhone, telHref, waHref } from "@/lib/format";
import StampBadge from "./StampBadge";
import ContactForm from "./ContactForm";

export default async function ContactSection() {
  const s = await getSettings();
  return (
    <section id="contact" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <StampBadge rotate={-3} variant="stamp">
              Contact
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-5xl lg:text-6xl">
              Parlons de votre projet.
            </h2>
            <p className="mt-5 max-w-md font-body text-ink-soft">
              Une question, un devis, un format un peu particulier ? L&apos;équipe
              Landpack répond directement, sans détour.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={telHref(s.phone)}
                className="flex items-center gap-3 rounded-xl border-2 border-ink/10 bg-paper px-5 py-4 transition-colors hover:border-water"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-water text-cream">
                  ☎
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase text-ink/50">
                    Téléphone
                  </p>
                  <p className="font-body text-ink">{formatPhone(s.phone)}</p>
                </div>
              </a>

              <a
                href={`mailto:${s.email}`}
                className="flex items-center gap-3 rounded-xl border-2 border-ink/10 bg-paper px-5 py-4 transition-colors hover:border-water"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nature text-cream">
                  ✉
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase text-ink/50">
                    Email
                  </p>
                  <p className="font-body text-ink">{s.email}</p>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-xl border-2 border-ink/10 bg-paper px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                  ⚑
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase text-ink/50">
                    Atelier
                  </p>
                  <p className="font-body text-ink">
                    {s.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
