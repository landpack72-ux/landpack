import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

const mark = "rounded bg-kraft/50 px-1 font-semibold text-ink";

/** Valeur renseignée dans l'admin, ou repère surligné « à compléter » tant qu'elle est vide. */
export function Fill({ value, label }: { value?: string | null; label: string }) {
  return value?.trim() ? <>{value.trim()}</> : <mark className={mark}>[à compléter : {label}]</mark>;
}

/** Passage à rédiger par l'entreprise (dépend de son activité). */
export function Todo({ children }: { children: ReactNode }) {
  return <mark className={mark}>[à compléter : {children}]</mark>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg text-ink sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 font-body text-sm leading-relaxed text-ink-soft sm:text-[0.95rem] [&_strong]:text-ink [&_a]:font-semibold [&_a]:text-water [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function LegalPage({ title, intro, updated, children }: { title: string; intro?: string; updated: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl text-ink [overflow-wrap:anywhere] sm:text-3xl">{title}</h1>
          <span className="mt-2 block h-1 w-14 rounded-full bg-kraft" />
          <p className="mt-3 font-body text-xs text-ink-soft">Dernière mise à jour : {updated}</p>
          {intro && <p className="mt-5 font-body text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">{intro}</p>}
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
