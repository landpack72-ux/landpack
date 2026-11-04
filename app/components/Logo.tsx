"use client";

import { useState } from "react";

// Logo du site (adresse enregistrée dans l'admin > Coordonnées).
// Si l'image est introuvable, le nom « Landpack » s'affiche à la place.
export default function Logo({ src, className = "h-10 w-auto" }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="font-display text-2xl text-ink">Landpack</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Landpack"
      className={className}
      onError={() => setFailed(true)}
      ref={(el) => {
        // L'image peut avoir échoué avant que React ne soit prêt.
        if (el && el.complete && el.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}
