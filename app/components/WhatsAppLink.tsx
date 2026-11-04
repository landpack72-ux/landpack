"use client";

import { usePathname } from "next/navigation";
import { waHref } from "@/lib/format";
import { WhatsAppIcon } from "./icons";

// Bouton flottant WhatsApp, masqué sur l'interface admin.
export default function WhatsAppLink({ number }: { number: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={waHref(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Landpack sur WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
