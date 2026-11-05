import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { DEFAULT_LEGAL_UPDATED } from "@/lib/legal";
import { fmtInt } from "@/lib/pricing";
import { Fill, LegalPage, Section, Todo } from "../components/Legal";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: "Conditions de vente | Landpack" },
    description: "Conditions de vente des emballages personnalisés Landpack.",
    alternates: { canonical: "/conditions-de-vente" },
    // Tant que l'entreprise n'a pas publié le texte (admin > Informations légales), la page n'est pas référencée.
    robots: s.legal_cgv_published === "1" ? undefined : { index: false, follow: false },
  };
}

export default async function ConditionsDeVentePage() {
  const s = await getSettings();
  const email = s.legal_email || s.email;
  const min = Number(s.qty_min) || 50;
  const step = Number(s.qty_step) || 50;
  const threshold = Number(s.discount_threshold) || 0;
  const percent = Number(s.discount_percent) || 0;

  return (
    <LegalPage title="Conditions de vente" updated={s.legal_updated || DEFAULT_LEGAL_UPDATED}>
      <Section title="1. Objet">
        <p>
          Ces conditions régissent les commandes d&apos;emballages personnalisés (boîtes, sachets, sacs kraft, gobelets, cartons) passées sur ce site auprès de{" "}
          <strong><Fill value={s.legal_name} label="raison sociale" /></strong>. Toute commande implique l&apos;acceptation de ces conditions.
        </p>
      </Section>

      <Section title="2. Produits et personnalisation">
        <p>
          Les articles sont personnalisés avec le logo que vous nous fournissez. Les photos, dimensions et couleurs affichées sur le site sont indicatives : de légères variations de teinte
          sont possibles à l&apos;impression.
        </p>
      </Section>

      <Section title="3. Commande">
        <p>
          Vous composez un panier (ou demandez un devis), puis vous envoyez votre commande. <strong>Cet envoi ne vaut pas confirmation</strong> : la commande n&apos;est définitive qu&apos;après notre appel
          (ou notre message WhatsApp) de confirmation, au cours duquel nous validons le logo, les quantités, le prix et la livraison.
        </p>
        <p>La quantité minimale est de {fmtInt(min)} pièces par article, par paliers de {fmtInt(step)}.</p>
      </Section>

      <Section title="4. Prix">
        <p>
          Les prix sont exprimés en dirhams marocains (Dh) par pièce. Ils sont indicatifs et confirmés lors de la confirmation de la commande.
          {percent > 0 && threshold > 0 && <> Une remise de {percent} % s&apos;applique à l&apos;ensemble de la commande à partir de {fmtInt(threshold)} pièces.</>}
        </p>
        <p>TVA : <Todo>prix hors taxes ou toutes taxes comprises</Todo>. Frais de livraison : <Todo>montant ou conditions de gratuité</Todo>.</p>
      </Section>

      <Section title="5. Paiement">
        <p><Todo>modes de paiement acceptés et échéances : acompte, paiement à la livraison, virement…</Todo></p>
      </Section>

      <Section title="6. Validation du visuel et fabrication">
        <p><Todo>délai de fabrication et étapes de validation du visuel avant impression</Todo></p>
      </Section>

      <Section title="7. Livraison">
        <p><Todo>zones livrées, délais, transporteur et contrôle des colis à la réception</Todo></p>
      </Section>

      <Section title="8. Annulation, retours et réclamations">
        <p>
          Les articles étant fabriqués sur mesure avec votre logo, <Todo>conditions d&apos;annulation et de retour</Todo>. Toute réclamation doit être signalée à{" "}
          {email ? <a href={`mailto:${email}`}>{email}</a> : <Fill value="" label="e-mail de contact" />} dans un délai de <Todo>nombre de jours</Todo> après la livraison, avec des photos.
        </p>
      </Section>

      <Section title="9. Vos logos et visuels">
        <p>
          Vous garantissez que vous avez le droit d&apos;utiliser le logo et les visuels que vous nous envoyez. Landpack ne peut être tenue responsable d&apos;une atteinte aux droits d&apos;un tiers causée par ces visuels,
          et ne les utilise que pour réaliser votre commande.
        </p>
      </Section>

      <Section title="10. Données personnelles">
        <p>Vos données sont traitées comme indiqué dans notre <Link href="/confidentialite">politique de confidentialité et cookies</Link>.</p>
      </Section>

      <Section title="11. Droit applicable et litiges">
        <p>
          Ces conditions sont soumises au droit marocain. En cas de litige, nous cherchons d&apos;abord une solution amiable ; à défaut, <Todo>tribunal compétent</Todo>.
        </p>
      </Section>
    </LegalPage>
  );
}
