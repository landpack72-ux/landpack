// Transforme les réglages « Style du site » de l'admin en CSS.
// Rien n'est généré tant que le client n'a rien changé : le design d'origine reste intact.
// Les valeurs sont vérifiées (couleurs hexadécimales, polices de la liste, tailles bornées)
// avant d'être insérées dans la page.

import { DEF_BY_ID } from "./content";

const DEFAULT = DEF_BY_ID["style.theme"].defaults[0];

const COLOR_VARS: Record<string, string> = {
  color_water: "--water",
  color_water_dark: "--water-dark",
  color_ink: "--ink",
  color_ink_soft: "--ink-soft",
  color_cream: "--kraft-cream",
  color_paper: "--kraft-paper",
  color_gold: "--gold-thread",
  color_stamp: "--stamp",
  color_nature: "--nature",
};

const STACKS: Record<string, string> = {
  Sora: '"Sora", ui-sans-serif, system-ui, sans-serif',
  "DM Sans": '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  Poppins: '"Poppins", ui-sans-serif, system-ui, sans-serif',
  Montserrat: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
  Inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  Nunito: '"Nunito", ui-sans-serif, system-ui, sans-serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  Lora: '"Lora", Georgia, serif',
};

// Tailles de Tailwind (en rem) : « textes » et « titres » se règlent séparément.
const BODY_SIZES: Record<string, number> = { xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25 };
const TITLE_SIZES: Record<string, number> = { "2xl": 1.5, "3xl": 1.875, "4xl": 2.25, "5xl": 3, "6xl": 3.75, "7xl": 4.5 };

const HEX = /^#[0-9a-fA-F]{6}$/;

function scale(value: string | undefined): number {
  const n = parseFloat(value ?? "1");
  return Number.isFinite(n) ? Math.min(1.4, Math.max(0.8, n)) : 1;
}

export function themeCss(t: Record<string, string>): string {
  const vars: string[] = [];
  const rules: string[] = [];

  for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
    const v = t[key];
    if (v && HEX.test(v) && v.toLowerCase() !== DEFAULT[key].toLowerCase()) vars.push(`${cssVar}:${v}`);
  }

  const body = scale(t.size_body);
  const title = scale(t.size_title);
  if (body !== 1) {
    for (const [k, rem] of Object.entries(BODY_SIZES)) vars.push(`--text-${k}:${(rem * body).toFixed(4)}rem`);
    rules.push(`body{font-size:${body}rem}`);
  }
  if (title !== 1) {
    for (const [k, rem] of Object.entries(TITLE_SIZES)) vars.push(`--text-${k}:${(rem * title).toFixed(4)}rem`);
  }

  if (t.font_display in STACKS && t.font_display !== DEFAULT.font_display) {
    rules.push(`.font-display{font-family:${STACKS[t.font_display]}}`);
  }
  if (t.font_body in STACKS && t.font_body !== DEFAULT.font_body) {
    rules.push(`body,.font-body{font-family:${STACKS[t.font_body]}}`);
  }

  return (vars.length ? `:root{${vars.join(";")}}` : "") + rules.join("");
}