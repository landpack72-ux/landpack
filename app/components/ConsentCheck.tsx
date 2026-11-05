import Link from "next/link";

// Case à cocher obligatoire : acceptation de la politique de confidentialité (loi 09-08).
// Le lien s'ouvre dans un nouvel onglet pour ne pas perdre ce que le client a déjà saisi.
export default function ConsentCheck({ id }: { id: string }) {
  return (
    <div className="flex items-start gap-3">
      <input id={id} name="consent" type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-water" />
      <label htmlFor={id} className="cursor-pointer font-body text-sm leading-snug text-ink">
        J&apos;ai lu et j&apos;accepte la{" "}
        <Link href="/confidentialite" target="_blank" rel="noopener noreferrer" className="font-semibold text-water underline hover:text-water-dark">
          politique de confidentialité
        </Link>
        . Mes informations servent à gérer mon compte et mes commandes.
      </label>
    </div>
  );
}
