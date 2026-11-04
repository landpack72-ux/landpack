"use client";

const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";

// Champ « fichier » en français : le champ natif du navigateur (« Choose File ») est masqué,
// et remplacé par un bouton dont le texte est le nôtre.
export default function FileField({
  id, title, tag, button, hint, file, preview, previewClass, onPick,
}: {
  id: string;
  title: string;
  tag: string;
  button: string;
  hint: string;
  file: File | null;
  preview: string | null;
  previewClass: string;
  onPick: (f: File | null) => void;
}) {
  return (
    <div>
      <span className={label}>
        {title} <span className="font-medium normal-case tracking-normal text-ink-soft">({tag})</span>
      </span>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-dashed border-ink/30 bg-paper/60 p-3">
        <input
          key={file ? `${file.name}-${file.size}` : "vide"}
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className="cursor-pointer rounded-md bg-water px-4 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-water-dark peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2"
        >
          {file ? "Changer le fichier" : button}
        </label>
        <span className="min-w-0 flex-1 truncate font-body text-sm text-ink-soft">{file ? file.name : "Aucun fichier choisi"}</span>
        {file && (
          <button type="button" onClick={() => onPick(null)} className="font-body text-sm font-semibold text-ink underline hover:text-water">
            Retirer
          </button>
        )}
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={`Aperçu : ${title}`} className={`mt-3 max-w-full rounded border border-ink/10 ${previewClass}`} />
      )}
      <p className="mt-1.5 font-body text-xs leading-relaxed text-ink-soft">{hint}</p>
    </div>
  );
}
