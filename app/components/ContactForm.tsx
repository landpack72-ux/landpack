"use client";

import { useState, FormEvent } from "react";
import { submitLead } from "@/lib/leads";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "wait">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "");

    const result = await submitLead({
      name: field("name"),
      phone: field("phone"),
      email: field("email"),
      message: field("message"),
      source: "Formulaire de contact",
      trap: field("website"),
    });

    if (result === "ok") {
      setStatus("success");
      form.reset();
    } else {
      setStatus(result);
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border-2 border-ink/10 bg-paper p-9 text-center">
        <p className="font-display text-2xl text-ink">Message envoyé ✓</p>
        <p className="mt-2 max-w-xs font-body text-sm text-ink-soft">
          Merci, on revient vers vous très vite.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl border-2 border-ink/10 bg-paper p-5 sm:rounded-[1.75rem] sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-mono text-[11px] uppercase text-ink/50">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 w-full rounded-full border-2 border-ink/15 bg-cream px-4 py-2.5 font-body text-ink focus:border-water focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="font-mono text-[11px] uppercase text-ink/50">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-2 w-full rounded-full border-2 border-ink/15 bg-cream px-4 py-2.5 font-body text-ink focus:border-water focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="email2" className="font-mono text-[11px] uppercase text-ink/50">
          Email
        </label>
        <input
          id="email2"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-full border-2 border-ink/15 bg-cream px-4 py-2.5 font-body text-ink focus:border-water focus:outline-none"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="font-mono text-[11px] uppercase text-ink/50">
          Votre projet
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Produit, format, quantité approximative..."
          className="mt-2 w-full rounded-2xl border-2 border-ink/15 bg-cream px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:border-water focus:outline-none"
        />
      </div>

      {/* Champ piège pour les robots : invisible pour les visiteurs */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-full bg-water py-3.5 font-medium text-cream transition-colors hover:bg-water-dark disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {status === "sending" ? "Envoi..." : "Envoyer la demande"}
      </button>

      {status === "error" && (
        <p className="mt-3 font-body text-sm text-stamp">
          Un problème est survenu, réessayez ou contactez-nous directement.
        </p>
      )}
      {status === "wait" && (
        <p className="mt-3 font-body text-sm text-stamp">
          Votre demande vient d&apos;être envoyée. Patientez quelques secondes avant d&apos;en envoyer une autre.
        </p>
      )}
    </form>
  );
}
