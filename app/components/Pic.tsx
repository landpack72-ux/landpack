import { srcSetFor, type ImagePreset } from "@/lib/images";

// Image du site : choisit automatiquement la bonne taille (grande, moyenne ou petite) selon l'écran.
export default function Pic({
  src,
  alt,
  sizes,
  preset = "generic",
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  /** Largeur d'affichage selon l'écran, ex. « (min-width: 1024px) 25vw, 46vw ». */
  sizes: string;
  preset?: ImagePreset;
  className?: string;
  priority?: boolean;
}) {
  const set = srcSetFor(src, preset);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={set ?? undefined}
      sizes={set ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
