// Fonctions d'image exécutées dans le navigateur.
import { PRESETS, type ImagePreset } from "./images";

/** Convertit une image en WebP (réduite à 1600 px max) : plus léger, et fond transparent conservé. */
export async function toWebp(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") {
    throw new Error("Ce navigateur ne sait pas convertir l'image. Utilisez Chrome, Edge, Firefox ou Safari récent.");
  }
  return blob;
}

/** Petite vignette (adresse de données) pour montrer dans le panier le logo envoyé. */
export async function makeThumb(file: File, size = 120): Promise<string | null> {
  try {
    const blob = await toWebp(file, size, 0.7);
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Préparation d'une photo du client pour le site : conversion WebP, adaptation au format de l'emplacement
// (carré à fond blanc, recadrage…), réduction en douceur et trois tailles (grande, moyenne, petite).
// ---------------------------------------------------------------------------

function toCanvas(source: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(source, 0, 0, w, h);
  return c;
}

// Réduction par étapes de moitié : garde les détails (pas de crénelage sur les grandes photos de téléphone).
function scaleTo(source: HTMLCanvasElement, dw: number, dh: number): HTMLCanvasElement {
  let cur = source;
  while (cur.width / 2 >= dw && cur.height / 2 >= dh) {
    const next = document.createElement("canvas");
    next.width = Math.ceil(cur.width / 2);
    next.height = Math.ceil(cur.height / 2);
    const g = next.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(cur, 0, 0, next.width, next.height);
    cur = next;
  }
  const out = document.createElement("canvas");
  out.width = Math.max(1, dw);
  out.height = Math.max(1, dh);
  const g = out.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(cur, 0, 0, out.width, out.height);
  return out;
}

function render(bmp: ImageBitmap, preset: ImagePreset, targetW: number): HTMLCanvasElement {
  const P = PRESETS[preset];
  const ratio = P.h ? P.h / P.w : null;

  if (P.fit === "cover" && ratio) {
    // On recadre la photo au centre dans le format voulu, sans jamais l'agrandir.
    let sw = bmp.width, sh = bmp.height, sx = 0, sy = 0;
    if (bmp.height / bmp.width > ratio) {
      sh = Math.round(bmp.width * ratio);
      sy = Math.round((bmp.height - sh) / 2);
    } else {
      sw = Math.round(bmp.height / ratio);
      sx = Math.round((bmp.width - sw) / 2);
    }
    const crop = document.createElement("canvas");
    crop.width = sw;
    crop.height = sh;
    crop.getContext("2d")!.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);
    const outW = Math.min(targetW, sw);
    return scaleTo(crop, outW, Math.round(outW * ratio));
  }

  if (P.fit === "contain" && ratio) {
    // La photo entière, centrée sur un fond uni, avec une petite marge.
    const outW = targetW;
    const outH = Math.round(targetW * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const g = canvas.getContext("2d")!;
    g.fillStyle = P.bg ?? "#ffffff";
    g.fillRect(0, 0, outW, outH);
    const scale = Math.min((outW * 0.94) / bmp.width, (outH * 0.94) / bmp.height, 2);
    const dw = Math.max(1, Math.round(bmp.width * scale));
    const dh = Math.max(1, Math.round(bmp.height * scale));
    const placed = scaleTo(toCanvas(bmp, bmp.width, bmp.height), dw, dh);
    g.drawImage(placed, Math.round((outW - dw) / 2), Math.round((outH - dh) / 2));
    return canvas;
  }

  // « inside » : réduite si besoin, jamais agrandie, proportions d'origine
  const scale = Math.min(1, targetW / bmp.width, P.h ? P.h / bmp.height : Infinity);
  return scaleTo(toCanvas(bmp, bmp.width, bmp.height), Math.round(bmp.width * scale), Math.round(bmp.height * scale));
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  for (const q of [quality, quality - 0.12, quality - 0.25]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", Math.max(0.4, q)));
    if (!blob || blob.type !== "image/webp") throw new Error("Ce navigateur ne sait pas convertir l'image. Utilisez Chrome, Edge, Firefox ou Safari récent.");
    if (blob.size <= 1.9 * 1024 * 1024) return blob;
  }
  throw new Error("Cette image reste trop lourde après réduction. Choisissez-en une plus petite.");
}

export type ProcessedImage = { full: Blob; md: Blob | null; sm: Blob | null; width: number; height: number; mdWidth: number; smWidth: number };

export async function processImage(file: File, preset: ImagePreset): Promise<ProcessedImage> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file); // tient compte de l'orientation des photos de téléphone
  } catch {
    throw new Error("Ce fichier n'a pas pu être lu. Utilisez une image JPG, PNG ou WebP.");
  }
  const P = PRESETS[preset];
  const fullCanvas = render(bmp, preset, P.w);
  const full = await encode(fullCanvas, P.quality);
  // Versions légères (seulement si l'image principale est assez grande pour qu'elles aient un intérêt)
  let md: Blob | null = null;
  let sm: Blob | null = null;
  let mdWidth = 0;
  let smWidth = 0;
  if (P.md && fullCanvas.width > P.md) {
    const c = render(bmp, preset, P.md);
    md = await encode(c, P.quality - 0.02);
    mdWidth = c.width;
  }
  if (P.sm && fullCanvas.width > P.sm) {
    const c = render(bmp, preset, P.sm);
    sm = await encode(c, P.quality - 0.04);
    smWidth = c.width;
  }
  bmp.close();
  return { full, md, sm, width: fullCanvas.width, height: fullCanvas.height, mdWidth, smWidth };
}
