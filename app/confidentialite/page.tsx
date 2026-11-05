import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { DEFAULT_LEGAL_UPDATED } from "@/lib/legal";
import { formatPhone } from "@/lib/format";
import { Fill, LegalPage, Section } from "../components/Legal";

export const metadata: Metadata = {
  title: { absolute: "Politique de confidentialité et cookies | Landpack" },
  description: "Quelles données Landpack collecte, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

export default async function ConfidentialitePage() {
  const s = await getSettings();
  const email = s.legal_email || s.email;
  const address = s.legal_address || s.address;
  const mail = email ? <a href={`mailto:${email}`}>{email}</a> : <Fill value="" label="e-mail de contact" />;

  return (
    <LegalPage
      title="Politique de confidentialité et cookies"
      updated={s.legal_updated || DEFAULT_LEGAL_UPDATED}
      intro="Cette page explique quelles données personnelles Landpack collecte sur ce site, pourquoi, comment elles sont protégées et quels sont vos droits. Elle est rédigée conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel."
    >
      <Section title="1. Qui est responsable de vos données ?">
        <p>
          Le responsable du traitement est <strong><Fill value={s.legal_name} label="raison sociale" /></strong> (<Fill value={s.legal_form} label="forme juridique" />),
          ICE <Fill value={s.legal_ice} label="ICE" />, RC <Fill value={s.legal_rc} label="registre du commerce" />, dont le siège est situé : {address}.
        </p>
        <p>
          Pour toute question ou pour exercer vos droits : {mail}, ou par téléphone au <a href={`tel:${s.phone}`}>{formatPhone(s.phone)}</a>.
        </p>
        {s.legal_cndp?.trim() && <p>Traitement déclaré à la CNDP sous le n° {s.legal_cndp.trim()}.</p>}
      </Section>

      <Section title="2. Quelles données collectons-nous ?">
        <ul>
          <li>
            <strong>Quand vous créez un compte :</strong> prénom, nom, adresse e-mail, numéro de téléphone et mot de passe. Le mot de passe est conservé sous une forme chiffrée :
            personne, pas même Landpack, ne peut le lire. Vous pouvez aussi renseigner une adresse de livraison.
          </li>
          <li>
            <strong>Quand vous passez une commande ou demandez un devis :</strong> prénom, nom, téléphone, adresse de livraison, articles et quantités, message éventuel, ainsi que le
            logo et la photo que vous nous envoyez pour la personnalisation.
          </li>
          <li>
            <strong>Quand vous visitez le site :</strong> des informations techniques (adresse IP, date et heure, type de navigateur) enregistrées par nos hébergeurs dans leurs journaux
            de sécurité. Votre adresse IP sert aussi, temporairement, à limiter les tentatives répétées de connexion ou d&apos;envoi (protection contre les abus).
          </li>
        </ul>
        <p>Nous ne demandons aucune donnée sensible (santé, opinions, origine, etc.).</p>
      </Section>

      <Section title="3. Pourquoi utilisons-nous ces données ?">
        <ul>
          <li>créer et gérer votre compte ;</li>
          <li>traiter, confirmer, fabriquer et livrer vos commandes, et vous appeler pour valider votre logo et la livraison ;</li>
          <li>vous envoyer les e-mails liés à votre compte (confirmation de l&apos;adresse, mot de passe oublié) ;</li>
          <li>sécuriser le site et prévenir les abus ;</li>
          <li>respecter nos obligations légales, notamment comptables.</li>
        </ul>
        <p>
          Nous les utilisons avec votre accord (la case que vous cochez à la création du compte et à l&apos;envoi d&apos;une commande) et pour exécuter votre commande.
          <strong> Nous ne les utilisons pas pour de la publicité, et nous ne les vendons ni ne les cédons à des tiers.</strong>
        </p>
      </Section>

      <Section title="4. Qui peut accéder à vos données ?">
        <ul>
          <li>l&apos;équipe de Landpack autorisée à gérer les commandes ;</li>
          <li>
            nos prestataires techniques, qui font fonctionner le site et n&apos;ont pas le droit d&apos;utiliser vos données pour leurs propres besoins : <strong>Supabase</strong> (base de données,
            comptes, stockage sécurisé des fichiers), <strong>Netlify</strong> (hébergement du site) et <strong>Resend</strong> (envoi des e-mails de confirmation et de réinitialisation) ;
          </li>
          <li>les autorités, si la loi nous l&apos;impose.</li>
        </ul>
        <p>Le logo et la photo que vous envoyez sont rangés dans un espace privé, accessible uniquement aux administrateurs de Landpack.</p>
      </Section>

      <Section title="5. Vos données quittent-elles le Maroc ?">
        <p>
          Nos prestataires techniques hébergent les données hors du Maroc, dans la région suivante : <strong><Fill value={s.legal_data_region} label="pays ou région d'hébergement" /></strong>.
          Ce transfert est soumis aux règles de la loi n° 09-08, que Landpack s&apos;engage à respecter.
        </p>
      </Section>

      <Section title="6. Combien de temps conservons-nous vos données ?">
        <ul>
          <li><strong>Compte :</strong> tant que votre compte est actif. Vous pouvez demander sa suppression à tout moment.</li>
          <li><strong>Commandes et demandes :</strong> <Fill value={s.legal_retention_orders} label="durée de conservation" />.</li>
          <li><strong>Logo et photo envoyés :</strong> supprimés une fois votre commande traitée.</li>
          <li><strong>Journaux techniques :</strong> durée courte, fixée par nos hébergeurs.</li>
          <li><strong>Panier :</strong> il reste dans votre navigateur jusqu&apos;à ce que vous le vidiez ou envoyiez votre commande.</li>
        </ul>
      </Section>

      <Section title="7. Quels sont vos droits ?">
        <p>
          Conformément à la loi n° 09-08, vous pouvez à tout moment accéder à vos données, les faire rectifier ou effacer, vous opposer à leur utilisation pour des motifs légitimes,
          et retirer votre consentement. Vous pouvez modifier vos informations et votre mot de passe vous-même depuis <Link href="/compte">Mon compte</Link>.
        </p>
        <p>
          Pour les autres demandes (accès, suppression du compte, opposition), écrivez à {mail} ou appelez le <a href={`tel:${s.phone}`}>{formatPhone(s.phone)}</a> : nous vous répondons dans les meilleurs délais.
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) : <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">www.cndp.ma</a>.
        </p>
      </Section>

      <Section title="8. Comment protégeons-nous vos données ?">
        <ul>
          <li>connexion chiffrée (HTTPS) sur tout le site ;</li>
          <li>mots de passe chiffrés, jamais lisibles ;</li>
          <li>accès à l&apos;administration réservé aux personnes autorisées et protégé par mot de passe ;</li>
          <li>fichiers des clients dans un espace privé, ouverts seulement par l&apos;administrateur avec un lien temporaire ;</li>
          <li>sessions conservées dans des cookies sécurisés, illisibles par les scripts du site ;</li>
          <li>limitation des tentatives répétées de connexion.</li>
        </ul>
        <p>Aucun système n&apos;est infaillible, mais nous mettons en œuvre des mesures de sécurité adaptées et nous les faisons évoluer.</p>
      </Section>

      <Section title="9. Cookies et stockage dans votre navigateur">
        <p>
          Un cookie est un petit fichier enregistré dans votre navigateur. Ce site n&apos;utilise que ce qui est nécessaire à son fonctionnement :
          <strong> aucun cookie publicitaire, aucun outil de statistiques ou de suivi, aucun contenu provenant d&apos;un autre site.</strong> C&apos;est pourquoi aucun bandeau de consentement
          n&apos;est affiché.
        </p>
        <ul>
          <li><strong>lp_ct</strong> et <strong>lp_cr</strong> (cookies) : connexion à votre compte client. Créés seulement quand vous vous connectez ; le premier dure environ une heure, le second 30 jours au plus ; supprimés à la déconnexion.</li>
          <li><strong>lp_at</strong> et <strong>lp_rt</strong> (cookies) : même rôle pour les administrateurs de Landpack (7 jours au plus).</li>
          <li><strong>lp_cart_v1</strong> (stockage local) : votre panier, gardé jusqu&apos;à ce que vous le vidiez ou envoyiez votre commande.</li>
          <li><strong>lp_last_lead</strong> (stockage local) : évite l&apos;envoi en double d&apos;une demande de devis.</li>
        </ul>
        <p>
          Vous pouvez supprimer ces éléments dans les réglages de votre navigateur ; la connexion et le panier ne fonctionneront alors plus. Si nous ajoutons un jour un outil de mesure d&apos;audience ou de publicité,
          nous vous demanderons votre accord avant.
        </p>
      </Section>

      <Section title="10. Modifications de cette page">
        <p>Nous pouvons mettre à jour cette politique, par exemple si nous ajoutons un service. La date de dernière mise à jour figure en haut de la page.</p>
      </Section>
    </LegalPage>
  );
}
