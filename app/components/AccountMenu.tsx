"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { notifyAccountChanged, useAccount } from "@/lib/use-account";

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

// Compte client : icône + « S'identifier / Mon compte » (ordinateur) ou icône seule (téléphone).
export default function AccountMenu({ variant }: { variant: "bar" | "mobile" }) {
  const { profile } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "mobile") {
    return (
      <Link
        href="/compte"
        aria-label={profile ? "Mon compte" : "Se connecter ou créer un compte"}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ink/25 text-ink hover:bg-paper"
      >
        <UserIcon className="h-6 w-6" />
        {profile && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-water ring-2 ring-white" />}
      </Link>
    );
  }

  const item = "block px-4 py-3 font-body text-sm text-ink hover:bg-paper";

  async function logout() {
    await fetch("/api/account/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    setOpen(false);
    notifyAccountChanged();
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-md px-2 py-1 text-left text-cream transition-colors hover:bg-white/10"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/40">
          <UserIcon className="h-6 w-6" />
        </span>
        <span className="leading-tight">
          <span className="block font-body text-xs text-cream/85">{profile ? "Bonjour" : "S'identifier"}</span>
          <span className="block font-body text-sm font-semibold">{profile ? profile.first_name || "Mon compte" : "Mon compte"}</span>
        </span>
        <span aria-hidden className="text-xs">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-ink/10">
          {profile ? (
            <>
              <Link href="/compte" onClick={() => setOpen(false)} className={item}>Mon compte</Link>
              <Link href="/compte" onClick={() => setOpen(false)} className={`${item} border-t border-ink/10`}>Mes commandes</Link>
              <button type="button" onClick={logout} className={`${item} w-full border-t border-ink/10 text-left`}>Se déconnecter</button>
            </>
          ) : (
            <>
              <Link href="/compte?tab=connexion" onClick={() => setOpen(false)} className={`${item} font-semibold`}>Se connecter</Link>
              <Link href="/compte?tab=inscription" onClick={() => setOpen(false)} className={`${item} border-t border-ink/10`}>Créer un compte</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
