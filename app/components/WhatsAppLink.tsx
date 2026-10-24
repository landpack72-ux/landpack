"use client";

import { usePathname } from "next/navigation";
import { waHref } from "@/lib/format";

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
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.65 4.53 1.78 6.4L3 29l7.78-2.72A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.36l-.355-.21-4.62 1.62 1.55-4.51-.23-.37A9.7 9.7 0 1 1 25.75 15c0 5.376-4.372 9.75-9.746 9.75Zm5.34-7.29c-.293-.146-1.734-.855-2.003-.953-.269-.098-.464-.146-.66.147-.195.293-.757.953-.928 1.148-.171.196-.342.22-.635.073-.293-.147-1.236-.455-2.354-1.45-.87-.775-1.457-1.732-1.628-2.025-.171-.293-.018-.451.128-.597.132-.13.293-.342.44-.513.146-.171.195-.293.293-.489.098-.196.049-.367-.024-.513-.073-.147-.66-1.59-.904-2.178-.238-.572-.48-.494-.66-.503l-.562-.01c-.196 0-.513.073-.782.367-.269.293-1.026 1.003-1.026 2.446s1.051 2.837 1.198 3.033c.146.196 2.07 3.16 5.017 4.43.701.303 1.248.484 1.674.62.703.224 1.343.192 1.849.117.564-.084 1.734-.708 1.979-1.392.244-.684.244-1.27.171-1.392-.073-.122-.269-.196-.562-.343Z" />
      </svg>
    </a>
  );
}
