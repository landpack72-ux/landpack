import Link from "next/link";
import StampBadge from "./StampBadge";

type SubPageHeroProps = {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Point de focus de la photo si le sujet n'est pas centré (défaut: center) */
  focus?: "center" | "top" | "bottom";
};

export default function SubPageHero({
  image,
  eyebrow,
  title,
  text,
  focus = "center",
}: SubPageHeroProps) {
  const objectPosition =
    focus === "top" ? "object-top" : focus === "bottom" ? "object-bottom" : "object-center";

  return (
    <section className="relative aspect-[4/3] w-full overflow-hidden bg-ink sm:aspect-[16/9]">
      <img
        src={image}
        alt={title}
        className={`photo-kraft-tone absolute inset-0 h-full w-full object-cover ${objectPosition}`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-water-dark/80 via-ink/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-ink/10 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-0 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="mb-4 w-fit font-mono text-xs uppercase tracking-wide text-cream/70 hover:text-cream"
        >
          ← Accueil
        </Link>
        <StampBadge rotate={-3} className="w-fit border-cream/60 !text-cream bg-ink/20">
          {eyebrow}
        </StampBadge>
        <h1 className="mt-5 max-w-2xl break-words font-display text-3xl leading-[1.05] text-cream drop-shadow-[0_3px_14px_rgba(15,30,38,0.55)] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-cream/90 drop-shadow-[0_2px_8px_rgba(15,30,38,0.5)] sm:text-base">
          {text}
        </p>
      </div>
    </section>
  );
}
