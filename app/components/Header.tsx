import { getList, getText } from "@/lib/data";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const [links, header] = await Promise.all([getList("global.nav"), getText("global.header")]);
  return (
    <HeaderClient
      links={links.map((l) => ({ href: l.href, label: l.label }))}
      ctaLabel={header.cta_label}
    />
  );
}
