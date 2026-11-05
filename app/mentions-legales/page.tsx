import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { DEFAULT_LEGAL_UPDATED } from "@/lib/legal";
import { formatPhone } from "@/lib/format";
import { Fill, LegalPage, Section } from "../components/Legal";

export const metadata: Metadata = {
  title: { absolute: "Mentions légales | Landpack" },
  description: "Éditeur, hébergeur et informations légales du site landpack.ma.",
  alternates: { canonical: "/mentions-legales" },
};

export default async function MentionsLegalesPage() {
  const s = await getSettings();
  const email = s.legal_email || s.email;
  const address = s.legal_address || s.address;

  return (
    <LegalPage title="Mentions légales" updated={s.legal_updated || DEFAULT_LEGAL_UPDATED}>
      <Section title="Éditeur du site">
        <ul>
          <li><strong>Raison sociale :</strong> <Fill value={s.legal_name} label="raison sociale" /></li>
          <li><strong>Forme juridique :</strong> <Fill value={s.legal_form} label="forme juridique" /></li>
          <li><strong>ICE :</strong> <Fill value={s.legal_ice} label="ICE" /></li>
          <li><strong>Registre du commerce :</strong> <Fill value={s.legal_rc} label="registre du commerce" /></li>
          <li><strong>Siège :</strong> {address}</li>
          <li><strong>Téléphone :</strong> <a href={`tel:${s.phone}`}>{formatPhone(s.phone)}</a></li>
          <li><strong>E-mail :</strong> {email ? <a href={`mailto:${email}`}>{email}</a> : <Fill value="" label="e-mail de contact" />}</li>
          <li><strong>Directeur de la publication :</strong> <Fill value={s.legal_publisher} label="nom du directeur de la publication" /></li>
        </ul>
      </Section>

      <Section title="Hébergement et services techniques">
        <ul>
          <li><strong>Hébergement du site :</strong> Netlify, Inc. (États-Unis), netlify.com.</li>
          <li><strong>Base de données, comptes et fichiers :</strong> Supabase (supabase.com).</li>
          <li><strong>Envoi des e-mails du site :</strong> Resend (resend.com).</li>
        </ul>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Les textes, les images, le logo Landpack, la mise en page et le code de ce site sont la propriété de Landpack ou utilisés avec l&apos;autorisation de leurs titulaires.
          Toute reproduction sans autorisation écrite est interdite.
        </p>
        <p>Les logos et visuels que vous nous envoyez restent votre propriété : nous les utilisons uniquement pour fabriquer votre commande.</p>
      </Section>

      <Section title="Responsabilité">
        <p>
          Les descriptions, dimensions et prix par pièce affichés sur le site sont indicatifs. Le prix et les caractéristiques définitifs sont confirmés par Landpack lors de la confirmation de la commande.
          Landpack s&apos;efforce de maintenir le site accessible mais ne peut garantir l&apos;absence d&apos;interruption.
        </p>
      </Section>

      <Section title="Données personnelles et cookies">
        <p>
          Pour savoir comment vos données sont utilisées et comment exercer vos droits, consultez notre <Link href="/confidentialite">politique de confidentialité et cookies</Link>.
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>Ce site et ses conditions d&apos;utilisation sont soumis au droit marocain. En cas de litige, nous recherchons d&apos;abord une solution amiable ; à défaut, les tribunaux compétents du Maroc sont seuls compétents.</p>
      </Section>
    </LegalPage>
  );
}
