import { getList, getText } from "@/lib/data";
import StampBadge from "./StampBadge";

export default async function SolutionsList() {
  const [head, items] = await Promise.all([getText("home.solutions_head"), getList("home.solutions")]);
  return (
    <section id="nos-solutions" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="stamp">
          {head.badge}
        </StampBadge>
        <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-5xl lg:text-6xl">
          {head.title}
        </h2>
        <p className="mt-4 max-w-2xl font-body text-ink-soft">{head.text}</p>

        <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <div key={s.title + i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <div>
                <h3 className="font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-1 font-body text-sm text-ink-soft">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {head.goal_text && (
          <div className="mt-14 rounded-2xl border-2 border-ink/10 bg-paper p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">{head.goal_label}</p>
            <p className="mt-2 max-w-2xl font-body text-ink">{head.goal_text}</p>
          </div>
        )}
      </div>
    </section>
  );
}
