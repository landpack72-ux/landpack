// Convertit une photo en WebP (et la réduit à 1600 px max) AVANT l'envoi,
// pour que le site reste rapide même si le client choisit une photo de 5 Mo.

import type { SupabaseClient } from "@supabase/supabase-js";

export async function toWebp(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob || blob.type !== "image/webp") {
    throw new Error("Ce navigateur ne sait pas convertir en WebP. Utilisez Chrome, Edge ou Firefox.");
  }
  return blob;
}

export async function uploadImage(db: SupabaseClient, file: File, folder: string): Promise<string> {
  const blob = await toWebp(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await db.storage
    .from("site-images")
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return db.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
