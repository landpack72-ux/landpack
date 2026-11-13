// Informations de la boutique (lien Google Maps, horaires, réseaux sociaux) : saisies dans l'admin, utilisées
// dans le pied de page et dans les données lues par Google.

export const DAYS: { code: string; label: string; schema: string }[] = [
  { code: "Mo", label: "lundi", schema: "Monday" },
  { code: "Tu", label: "mardi", schema: "Tuesday" },
  { code: "We", label: "mercredi", schema: "Wednesday" },
  { code: "Th", label: "jeudi", schema: "Thursday" },
  { code: "Fr", label: "vendredi", schema: "Friday" },
  { code: "Sa", label: "samedi", schema: "Saturday" },
  { code: "Su", label: "dimanche", schema: "Sunday" },
];

/** Jours cochés (« Mo,Tu,We »), dans l'ordre de la semaine, sans doublon ni valeur inconnue. */
export function parseDays(v: string | undefined): string[] {
  const set = new Set((v ?? "").split(",").map((x) => x.trim()));
  return DAYS.filter((d) => set.has(d.code)).map((d) => d.code);
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const validTime = (v: string | undefined) => (v && TIME.test(v.trim()) ? v.trim() : null);

/** « 08:30 » -> « 8h30 » */
export function timeLabel(v: string): string {
  const [h, m] = v.split(":");
  return `${Number(h)}h${m}`;
}

/** « du lundi au samedi », « lundi et mardi », « du lundi au vendredi, samedi »… */
export function daysLabel(codes: string[]): string {
  const idx = codes.map((c) => DAYS.findIndex((d) => d.code === c)).filter((i) => i >= 0);
  const runs: number[][] = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1] === i - 1) last.push(i);
    else runs.push([i]);
  }
  return runs
    .map((r) => (r.length >= 3 ? `du ${DAYS[r[0]].label} au ${DAYS[r[r.length - 1]].label}` : r.map((i) => DAYS[i].label).join(" et ")))
    .join(", ");
}

/** Texte des horaires affiché au public, ou null si les heures ne sont pas renseignées. */
export function hoursText(s: Record<string, string>): string | null {
  const open = validTime(s.hours_open);
  const close = validTime(s.hours_close);
  if (!open || !close) return null;
  const days = parseDays(s.hours_days);
  const range = `${timeLabel(open)} – ${timeLabel(close)}`;
  return days.length > 0 ? `${daysLabel(days)}, ${range}` : range;
}

/** Phrase complète : « Ouvert du lundi au samedi de 8h30 à 18h00 », ou « Ouvert de 8h30 à 18h00 » si les jours ne sont pas cochés. */
export function hoursSentence(s: Record<string, string>): string | null {
  const open = validTime(s.hours_open);
  const close = validTime(s.hours_close);
  if (!open || !close) return null;
  const days = parseDays(s.hours_days);
  return `Ouvert ${days.length > 0 ? `${daysLabel(days)} ` : ""}de ${timeLabel(open)} à ${timeLabel(close)}`;
}

/** Horaires au format lu par Google (schema.org), ou rien si les jours ne sont pas cochés. */
export function openingSpec(s: Record<string, string>) {
  const open = validTime(s.hours_open);
  const close = validTime(s.hours_close);
  const days = parseDays(s.hours_days);
  if (!open || !close || days.length === 0) return null;
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((c) => DAYS.find((d) => d.code === c)!.schema),
      opens: open,
      closes: close,
    },
  ];
}

/** « 08 Rue 70, …, Casablanca 21000 » -> rue seule + code postal (pour les données lues par Google). */
export function splitAddress(address: string): { street: string; postalCode: string | null } {
  const postal = /\b(\d{5})\b/.exec(address)?.[1] ?? null;
  const street = address
    .replace(/\b\d{5}\b/, "")
    .replace(/,?\s*Casablanca\s*$/i, "")
    .replace(/[,\s]+$/, "")
    .trim();
  return { street: street || address, postalCode: postal };
}

/** Adresse web valable (https uniquement) ou null : une valeur étrange saisie dans l'admin n'est jamais affichée. */
export function safeUrl(v: string | undefined): string | null {
  const u = (v ?? "").trim();
  if (!u || u.length > 600) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const SOCIALS: { key: string; label: string }[] = [
  { key: "social_facebook", label: "Facebook" },
  { key: "social_instagram", label: "Instagram" },
  { key: "social_tiktok", label: "TikTok" },
];

export function socialLinks(s: Record<string, string>): { label: string; url: string }[] {
  return SOCIALS.map((x) => ({ label: x.label, url: safeUrl(s[x.key]) })).filter((x): x is { label: string; url: string } => !!x.url);
}
