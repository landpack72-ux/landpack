"use client";

import { useState, FormEvent } from "react";
import { submitLead } from "@/lib/leads";

export default function CtaBannerClient({
  badge,
  title,
  text,
  button,
}: {
  badge: string;
  title: string;
  text: string;
  button: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "wait">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    const result = await submitLead({
      email: String(data.get("email") ?? ""),
      message: "Demande de devis rapide (e-mail seulement)",
      source: "Bandeau devis",
      trap: String(data.get("website") ?? ""),
    });

    if (result === "ok") {
      setStatus("success");
      form.reset();
    } else {
      setStatus(result);
    }
  }

  return (
    <section id="devis" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border-2 border-ink/15 bg-water px-5 py-12 text-center shadow-[0_10px_30px_-8px_rgba(20,95,128,0.45)] sm:rounded-[2.5rem] sm:px-16 sm:py-16">
        <p className="stamp-badge inline-block rounded-full border-2 border-cream/60 px-4 py-1.5 text-xs uppercase text-cream">
          {badge}
        </p>
        <h2 className="mt-6 whitespace-pre-line break-words font-display text-3xl leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-cream/85">
          {text}
        </p>

        {status === "success" ? (
          <p className="mx-auto mt-9 max-w-xl font-display text-2xl text-cream">
            Merci ✓ on revient vers vous très vite.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="relative mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="email" className="sr-only">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              className="w-full flex-1 rounded-full border-2 border-ink bg-cream px-5 py-3.5 font-body text-ink placeholder:text-ink/40 focus:outline-none"
            />
            {/* Champ piège pour les robots : invisible pour les visiteurs */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website-cta">Ne pas remplir</label>
              <input id="website-cta" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-ink px-7 py-3.5 font-medium text-cream transition-colors hover:bg-cream hover:text-ink disabled:opacity-60"
            >
              {status === "sending" ? "Envoi..." : button}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 font-body text-sm text-cream/90">Un problème est survenu, réessayez.</p>
        )}
        {status === "wait" && (
          <p className="mt-3 font-body text-sm text-cream/90">
            Votre demande vient d&apos;être envoyée. Patientez quelques secondes avant d&apos;en envoyer une autre.
          </p>
        )}
      </div>
    </section>
  );
}
