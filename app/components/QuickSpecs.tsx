const SPECS = [
  { label: "Formats sacs", value: "17 · 26 · 28 cm" },
  { label: "Gobelets", value: "12 · 14 · 16 oz" },
  { label: "Quantité min.", value: "dès 500 pièces" },
  { label: "Délai devis", value: "sous 24h" },
];

export default function QuickSpecs() {
  return (
    <div className="border-b-2 border-dashed border-ink/15 bg-paper/50 px-4 sm:px-6 py-4 sm:py-5 lg:px-10">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-4 font-mono text-xs text-ink-soft sm:flex sm:flex-wrap sm:justify-between sm:gap-x-12 sm:gap-y-3">
        {SPECS.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <dt className="text-ink/50">{s.label}</dt>
            <dd className="mt-1 text-sm text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
