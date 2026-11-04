"use client";

import { useEffect, useState } from "react";

export type Profile = { first_name: string; last_name: string; phone: string; address: string; email: string };

let cache: Promise<Profile | null> | null = null;

/** Demande au serveur si un client est connecté (cookie HttpOnly : le navigateur ne voit aucun jeton). */
export function loadAccount(force = false): Promise<Profile | null> {
  if (!cache || force) {
    cache = fetch("/api/account/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j?.ok ? (j.profile as Profile) : null))
      .catch(() => null);
  }
  return cache;
}

export function notifyAccountChanged() {
  window.dispatchEvent(new Event("lp-account-changed"));
}

export function useAccount() {
  const [state, setState] = useState<{ loading: boolean; profile: Profile | null }>({ loading: true, profile: null });

  useEffect(() => {
    let alive = true;
    const refresh = (force: boolean) =>
      loadAccount(force).then((profile) => {
        if (alive) setState({ loading: false, profile });
      });
    refresh(false);
    const onChange = () => refresh(true);
    window.addEventListener("lp-account-changed", onChange);
    return () => {
      alive = false;
      window.removeEventListener("lp-account-changed", onChange);
    };
  }, []);

  return state;
}
