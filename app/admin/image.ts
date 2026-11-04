// Envoi des photos de l'admin : adaptation au format de l'emplacement et conversion WebP dans le navigateur,
// puis envoi de l'image principale et de ses deux versions légères (téléphone).

import { processImage } from "@/lib/image-client";
import type { ImagePreset } from "@/lib/images";
import { uploadToServer } from "./api";

export type UploadResult = { url: string; info: string };

const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} Ko`;

export async function uploadImage(file: File, folder: string, preset: ImagePreset = "generic"): Promise<UploadResult> {
  const img = await processImage(file, preset);
  const plain = await uploadToServer(img.full, folder);
  const base = /\/(\d+-[0-9a-f]{8})\.webp$/.exec(plain)?.[1];
  let sm = 0;
  let md = 0;
  if (base) {
    // Les versions légères ne bloquent jamais l'envoi. On note dans l'adresse de l'image celles qui existent VRAIMENT
    // (?v=petite-moyenne-grande) : le site ne propose jamais au navigateur une version qui n'existe pas.
    const [smOk, mdOk] = await Promise.all(
      (["sm", "md"] as const).map(async (size) => {
        const blob = img[size];
        if (!blob) return false;
        return uploadToServer(blob, folder, { of: base, size }).then(() => true, () => false);
      }),
    );
    sm = smOk ? img.smWidth : 0;
    md = mdOk ? img.mdWidth : 0;
  }
  return { url: `${plain}?v=${sm}-${md}-${img.width}`, info: `${img.width} × ${img.height} px · ${kb(img.full.size)} (WebP)` };
}
