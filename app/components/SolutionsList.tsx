import { getBlocks } from "@/lib/data";
import StampBadge from "./StampBadge";

export default async function SolutionsList() {
  const blocks = await getBlocks("home_solutions");
  return (
    <section
      id="nos-solutions"
      className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="stamp">
          Nos solutions
        </StampBadge>
        <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-5xl lg:text-6xl">
          Des solutions d&apos;emballage sur mesure pour les professionnels
          de l&apos;alimentaire.
        </h2>
        <p className="mt-4 max-w-2xl font-body text-ink-soft">
          Landpack accompagne restaurateurs, traiteurs, hôtels, cafés et
          professionnels de l&apos;alimentaire au Maroc, de la conception à la
          livraison de leurs emballages.
        </p>

        <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((s) => (
            <div key={s.id ?? s.title} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <div>
                <h3 className="font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-1 font-body text-sm text-ink-soft">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border-2 border-ink/10 bg-paper p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Notre objectif
          </p>
          <p className="mt-2 max-w-2xl font-body text-ink">
            Vous proposer un emballage pratique, sécurisé, esthétique et
            adapté à votre activité, tout en maîtrisant vos coûts.
          </p>
        </div>
      </div>
    </section>
  );
}
