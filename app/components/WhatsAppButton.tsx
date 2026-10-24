import WhatsAppLink from "./WhatsAppLink";
import { getSettings } from "@/lib/data";

export default async function WhatsAppButton() {
  const s = await getSettings();
  return <WhatsAppLink number={s.whatsapp} />;
}
