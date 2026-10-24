type LogoProps = {
  className?: string;
  size?: number;
};

/**
 * Logo Landpack : un carton kraft ouvert, dessiné en perspective,
 * fermé par une croix de ruban adhésif kraft doré et une étiquette
 * bleu eau — les trois couleurs de la marque réunies sur l'objet
 * même que Landpack personnalise.
 */
export default function LandpackLogo({ className = "", size = 44 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Logo Landpack"
    >
      <defs>
        <linearGradient id="lp-box-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDC79A" />
          <stop offset="100%" stopColor="#C4A265" />
        </linearGradient>
        <linearGradient id="lp-box-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B08B4F" />
          <stop offset="100%" stopColor="#8F6E38" />
        </linearGradient>
        <linearGradient id="lp-box-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EBDBB6" />
          <stop offset="100%" stopColor="#D8C299" />
        </linearGradient>
      </defs>

      {/* Face avant */}
      <path d="M18 44 L50 52 L50 88 L18 80 Z" fill="url(#lp-box-front)" />
      {/* Face côté (ombre) */}
      <path d="M50 52 L82 44 L82 80 L50 88 Z" fill="url(#lp-box-side)" />
      {/* Dessus / rabats ouverts */}
      <path d="M18 44 L50 36 L82 44 L50 52 Z" fill="url(#lp-box-top)" />

      {/* Rabat arrière gauche relevé */}
      <path
        d="M18 44 L14 22 L44 14 L50 36 Z"
        fill="#E4D2A6"
        stroke="#B08B4F"
        strokeWidth="1.2"
      />
      {/* Rabat arrière droit relevé */}
      <path
        d="M82 44 L86 22 L56 14 L50 36 Z"
        fill="#D8C299"
        stroke="#B08B4F"
        strokeWidth="1.2"
      />

      {/* Ruban kraft doré vertical */}
      <path d="M46 36 L48 88 L52 88 L52.5 36 Z" fill="var(--gold-thread)" opacity="0.9" />

      {/* Étiquette bleu eau avec goutte */}
      <rect x="30" y="58" width="20" height="14" rx="2.5" fill="var(--water)" />
      <circle cx="40" cy="65" r="3.2" fill="#EAF6FB" />

      {/* Feuille verte posée sur le carton */}
      <path
        d="M62 58 C 70 54, 76 58, 76 65 C 76 71, 70 74, 64 70 C 60 67, 60 62, 62 58 Z"
        fill="var(--nature)"
      />
    </svg>
  );
}
