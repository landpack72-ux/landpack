"use client";

import { useState, FormEvent } from "react";

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID || "xzepabdv";

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
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!FORM_ID) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("source", "CTA rapide — devis");

    try {
      const res = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
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
            className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
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
          <p className="mt-3 font-body text-sm text-cream/90">
            {FORM_ID
              ? "Un problème est survenu, réessayez."
              : "Formulaire non configuré (ID Formspree manquant)."}
          </p>
        )}
      </div>
    </section>
  );
}
