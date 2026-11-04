// Règles du mot de passe : les mêmes dans le navigateur (aide en direct) et sur le serveur (contrôle officiel).

export function passwordProblem(p: unknown): string | null {
  if (typeof p !== "string" || p.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (p.length > 72) return "Le mot de passe est trop long (72 caractères maximum).";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  return null;
}

export const passwordChecks = (p: string) => [
  { ok: p.length >= 8, label: "8 caractères minimum" },
  { ok: /[A-Za-z]/.test(p), label: "une lettre" },
  { ok: /\d/.test(p), label: "un chiffre" },
];
