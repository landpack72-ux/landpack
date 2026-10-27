import { getText } from "@/lib/data";
import CtaBannerClient from "./CtaBannerClient";

export default async function CtaBanner() {
  const t = await getText("home.cta");
  return <CtaBannerClient badge={t.badge} title={t.title} text={t.text} button={t.button} />;
}
